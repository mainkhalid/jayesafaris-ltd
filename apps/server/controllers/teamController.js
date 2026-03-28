import Team from "../models/teamModel.js";
import { uploadImage, deleteImage } from "../config/cloudinary.js";
import upload from "../middleware/upload.js";

const FOLDER = "jaye-safaris/team";

// ── Multer middleware — expose for routes ──────────────────────────────────────
// Single optional image field named "image" — mirrors packageUpload
export const teamUpload = upload.single("image");

const isUrl = (s) => typeof s === "string" && s.startsWith("http");

const resolveImage = async (file, incomingUrl, existing = {}) => {
  const { url: existingUrl, publicId: existingPublicId } = existing;

  if (file) {
    // New file uploaded — delete old, upload buffer
    await deleteImage(existingPublicId);
    return uploadImage(file.buffer, FOLDER);
  }

  if (isUrl(incomingUrl) && incomingUrl === existingUrl) {
    // URL unchanged — keep existing record as-is, no Cloudinary call
    return existing;
  }

  if (!incomingUrl) {
    // Explicitly cleared
    await deleteImage(existingPublicId);
    return { url: "", publicId: "" };
  }

  // New URL provided (pasted link)
  await deleteImage(existingPublicId);
  return uploadImage(incomingUrl, FOLDER);
};

// ── GET /api/team/all ─────────────────────────────────────────────────────────
export const getAllMembers = async (req, res) => {
  try {
    const members = await Team.find().sort({ sortOrder: 1, createdAt: 1 }).lean();
    res.status(200).json({ success: true, data: members });
  } catch (err) {
    console.error("[getAllMembers]", err);
    res.status(500).json({ success: false, message: "Failed to fetch team members." });
  }
};

// ── POST /api/team ─────────────────────────────────────────────────────────────
// Accepts multipart/form-data (via teamUpload middleware on the route)
export const createMember = async (req, res) => {
  try {
    const { name, role, bio, email, phone, linkedin, instagram, isVisible, imageUrl } = req.body;

    if (!name?.trim() || !role?.trim()) {
      return res.status(400).json({ success: false, message: "name and role are required." });
    }

    // file = req.file (from upload.single("image"))
    const resolvedImage = await resolveImage(req.file ?? null, imageUrl ?? "", {});

    const member = await Team.create({
      name:      name.trim(),
      role:      role.trim(),
      bio:       bio?.trim()       ?? "",
      email:     email?.trim()     ?? "",
      phone:     phone?.trim()     ?? "",
      linkedin:  linkedin?.trim()  ?? "",
      instagram: instagram?.trim() ?? "",
      isVisible: isVisible !== "false",
      imageUrl:     resolvedImage.url,
      imagePublicId: resolvedImage.publicId,
      sortOrder: await Team.countDocuments(),
    });

    res.status(201).json({ success: true, data: member });
  } catch (err) {
    console.error("[createMember]", err);
    res.status(500).json({ success: false, message: "Failed to create team member." });
  }
};

export const updateMember = async (req, res) => {
  try {
    const member = await Team.findById(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: "Member not found." });

    const { name, role, bio, email, phone, linkedin, instagram, isVisible, imageUrl, imagePublicId } = req.body;

    const resolvedImage = await resolveImage(
      req.file ?? null,
      imageUrl ?? "",
      { url: member.imageUrl, publicId: member.imagePublicId ?? imagePublicId ?? "" }
    );

    if (name      !== undefined) member.name      = name.trim();
    if (role      !== undefined) member.role      = role.trim();
    if (bio       !== undefined) member.bio       = bio.trim();
    if (email     !== undefined) member.email     = email.trim();
    if (phone     !== undefined) member.phone     = phone.trim();
    if (linkedin  !== undefined) member.linkedin  = linkedin.trim();
    if (instagram !== undefined) member.instagram = instagram.trim();
    if (isVisible !== undefined) member.isVisible = isVisible !== "false";

    member.imageUrl      = resolvedImage.url;
    member.imagePublicId = resolvedImage.publicId;

    await member.save();
    res.status(200).json({ success: true, data: member });
  } catch (err) {
    console.error("[updateMember]", err);
    res.status(500).json({ success: false, message: "Failed to update team member." });
  }
};
export const deleteMember = async (req, res) => {
  try {
    const member = await Team.findById(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: "Member not found." });

    await deleteImage(member.imagePublicId);
    await member.deleteOne();

    res.status(200).json({ success: true, message: "Member deleted." });
  } catch (err) {
    console.error("[deleteMember]", err);
    res.status(500).json({ success: false, message: "Failed to delete team member." });
  }
};
export const reorderMembers = async (req, res) => {
  try {
    const { order } = req.body; 
    if (!Array.isArray(order)) {
      return res.status(400).json({ success: false, message: "order must be an array of IDs." });
    }
    await Promise.all(order.map((id, idx) => Team.findByIdAndUpdate(id, { sortOrder: idx })));
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("[reorderMembers]", err);
    res.status(500).json({ success: false, message: "Failed to reorder members." });
  }
};