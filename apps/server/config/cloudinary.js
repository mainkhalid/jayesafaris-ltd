import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload from a base64 data URI, https URL, or a file buffer (from multer).
 *
 * @param {string|Buffer} source  - base64 URI, https URL, or Buffer
 * @param {string} folder         - Cloudinary folder path
 * @param {string} [publicId]     - Optional existing public_id to overwrite
 */
export const uploadImage = async (source, folder, publicId = null) => {
  const opts = {
    folder,
    resource_type: "image",
    overwrite: true,
    ...(publicId ? { public_id: publicId } : {}),
  };

  let result;

  if (Buffer.isBuffer(source)) {
    // Wrap the buffer upload in a promise using the upload_stream API
    result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(opts, (err, res) => {
        if (err) return reject(err);
        resolve(res);
      });
      stream.end(source);
    });
  } else {
    // base64 data URI or https URL — works as-is
    result = await cloudinary.uploader.upload(source, opts);
  }

  return { url: result.secure_url, publicId: result.public_id };
};

/**
 * Upload multiple files from multer buffers.
 *
 * @param {Express.Multer.File[]} files
 * @param {string} folder
 * @returns {Promise<{ url: string, publicId: string }[]>}
 */
export const uploadMultipleFromBuffer = async (files, folder) => {
  return Promise.all(files.map((file) => uploadImage(file.buffer, folder)));
};

/**
 * Delete an image from Cloudinary by its public_id.
 * Silently succeeds if the image doesn't exist.
 *
 * @param {string} publicId
 */
export const deleteImage = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch {
    console.warn(`[Cloudinary] Could not delete image: ${publicId}`);
  }
};

export default cloudinary;