import Package from "../models/packageModel.js";
import { uploadImage, deleteImage } from "../config/cloudinary.js";
import { uploadFields } from "../middleware/upload.js";

const CLOUDINARY_FOLDER = "safari/packages";

/** Returns true if the string is a plain https URL */
const isUrl = (str) => typeof str === "string" && str.startsWith("http");

// ─── Export the middleware so routes can use it directly ──────────────────────
export const packageUpload = uploadFields.packageFields();

// ─── Image resolution helpers ─────────────────────────────────────────────────

const resolveThumbnail = async (file, incomingUrl, existing = {}) => {
  const { url: existingUrl, publicId: existingPublicId } = existing;

  if (file) {
    await deleteImage(existingPublicId);
    return await uploadImage(file.buffer, `${CLOUDINARY_FOLDER}/thumbnails`);
  }

  if (isUrl(incomingUrl) && incomingUrl === existingUrl) {
    return existing;
  }

  if (!incomingUrl) {
    await deleteImage(existingPublicId);
    return { url: "", publicId: "" };
  }

  await deleteImage(existingPublicId);
  return await uploadImage(incomingUrl, `${CLOUDINARY_FOLDER}/thumbnails`);
};

const resolveInclusionImages = async (
  incomingInclusions,
  existingInclusions = [],
  files = {}
) => {
  const existingMap = new Map(
    existingInclusions.map((inc) => [inc._id.toString(), inc])
  );

  const incomingIds = new Set(
    incomingInclusions.map((inc) => inc._id?.toString()).filter(Boolean)
  );
  for (const [id, existing] of existingMap) {
    if (!incomingIds.has(id)) {
      await deleteImage(existing.image?.publicId);
    }
  }

  const resolved = await Promise.all(
    incomingInclusions.map(async (inc, idx) => {
      const existingInc = inc._id ? existingMap.get(inc._id.toString()) : null;
      const existingImg = existingInc?.image ?? {};

      const fileKey = `inclusions[${idx}][image]`;
      const uploadedFile = files[fileKey]?.[0] ?? null;

      let resolvedImage;

      if (uploadedFile) {
        await deleteImage(existingImg.publicId);
        resolvedImage = await uploadImage(uploadedFile.buffer, `${CLOUDINARY_FOLDER}/inclusions`);
      } else if (!inc.image) {
        await deleteImage(existingImg.publicId);
        resolvedImage = { url: "", publicId: "" };
      } else if (isUrl(inc.image) && inc.image === existingImg.url) {
        resolvedImage = existingImg;
      } else {
        await deleteImage(existingImg.publicId);
        resolvedImage = await uploadImage(inc.image, `${CLOUDINARY_FOLDER}/inclusions`);
      }

      return {
        ...(inc._id ? { _id: inc._id } : {}),
        description: inc.description,
        image: resolvedImage,
      };
    })
  );

  return resolved;
};

// ─── Controllers ──────────────────────────────────────────────────────────────

export const getPackages = async (req, res) => {
  try {
    const { country } = req.query;
    const filter = { isActive: true };
    if (country) filter.country = country.toLowerCase();

    const packages = await Package.find(filter)
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean();

    res.status(200).json({ success: true, data: packages });
  } catch (err) {
    console.error("[getPackages]", err);
    res.status(500).json({ success: false, message: "Failed to fetch packages" });
  }
};

export const getPackageById = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id).lean();
    if (!pkg) {
      return res.status(404).json({ success: false, message: "Package not found" });
    }
    res.status(200).json({ success: true, data: pkg });
  } catch (err) {
    console.error("[getPackageById]", err);
    res.status(500).json({ success: false, message: "Failed to fetch package" });
  }
};

export const createPackage = async (req, res) => {
  try {
    const { country, title, price, duration, description, sortOrder = 0 } = req.body;
    const inclusions = req.body.inclusions ? JSON.parse(req.body.inclusions) : [];
    const days = req.body.days ? JSON.parse(req.body.days) : [];

    if (!country || !title) {
      return res.status(400).json({ success: false, message: "country and title are required" });
    }

    const thumbnailFile = req.files?.["thumbnail"]?.[0] ?? null;
    const resolvedThumbnail = thumbnailFile
      ? await uploadImage(thumbnailFile.buffer, `${CLOUDINARY_FOLDER}/thumbnails`)
      : { url: "", publicId: "" };

    const resolvedInclusions = await Promise.all(
      inclusions.map(async (inc, idx) => {
        const file = req.files?.[`inclusions[${idx}][image]`]?.[0] ?? null;
        const img = file
          ? await uploadImage(file.buffer, `${CLOUDINARY_FOLDER}/inclusions`)
          : isUrl(inc.image)
          ? await uploadImage(inc.image, `${CLOUDINARY_FOLDER}/inclusions`)
          : { url: "", publicId: "" };
        return { description: inc.description, image: img };
      })
    );

    const pkg = await Package.create({
      country: country.toLowerCase(),
      title, price, duration, description,
      thumbnail: resolvedThumbnail,
      days,
      inclusions: resolvedInclusions,
      sortOrder,
    });

    res.status(201).json({ success: true, data: pkg });
  } catch (err) {
    console.error("[createPackage]", err);
    res.status(500).json({ success: false, message: "Failed to create package" });
  }
};

export const updatePackage = async (req, res) => {
  try {
    const existing = await Package.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Package not found" });
    }

    const { country, title, price, duration, description, sortOrder, isActive } = req.body;
    const inclusions = req.body.inclusions !== undefined ? JSON.parse(req.body.inclusions) : undefined;
    const days = req.body.days !== undefined ? JSON.parse(req.body.days) : undefined;

    const thumbnailFile = req.files?.["thumbnail"]?.[0] ?? null;
    const resolvedThumbnail = await resolveThumbnail(thumbnailFile, req.body.thumbnail, existing.thumbnail);

    const resolvedInclusions = inclusions !== undefined
      ? await resolveInclusionImages(inclusions, existing.inclusions, req.files ?? {})
      : existing.inclusions;

    if (country     !== undefined) existing.country     = country.toLowerCase();
    if (title       !== undefined) existing.title       = title;
    if (price       !== undefined) existing.price       = price;
    if (duration    !== undefined) existing.duration    = duration;
    if (description !== undefined) existing.description = description;
    if (days        !== undefined) existing.days        = days;
    if (sortOrder   !== undefined) existing.sortOrder   = sortOrder;
    if (isActive    !== undefined) existing.isActive    = isActive;

    existing.thumbnail  = resolvedThumbnail;
    existing.inclusions = resolvedInclusions;

    await existing.save();
    res.status(200).json({ success: true, data: existing });
  } catch (err) {
    console.error("[updatePackage]", err);
    res.status(500).json({ success: false, message: "Failed to update package" });
  }
};

export const deletePackage = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) {
      return res.status(404).json({ success: false, message: "Package not found" });
    }

    await deleteImage(pkg.thumbnail?.publicId);
    await Promise.all(pkg.inclusions.map((inc) => deleteImage(inc.image?.publicId)));
    await pkg.deleteOne();

    res.status(200).json({ success: true, message: "Package deleted" });
  } catch (err) {
    console.error("[deletePackage]", err);
    res.status(500).json({ success: false, message: "Failed to delete package" });
  }
};

export const reorderPackages = async (req, res) => {
  try {
    const { updates } = req.body;
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ success: false, message: "updates must be a non-empty array" });
    }

    await Promise.all(
      updates.map(({ id, sortOrder }) =>
        Package.findByIdAndUpdate(id, { sortOrder }, { new: false })
      )
    );

    res.status(200).json({ success: true, message: "Order updated" });
  } catch (err) {
    console.error("[reorderPackages]", err);
    res.status(500).json({ success: false, message: "Failed to reorder packages" });
  }
};