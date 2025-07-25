import { v2 as cloudinary } from "cloudinary";
import { config } from "../config/app.config";

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
});

/**
 * Upload buffer to Cloudinary
 * @param buffer - File buffer
 * @param folder - Cloudinary folder to upload to
 * @param publicId - Optional public ID for the image
 * @returns Promise with Cloudinary upload result
 */
export const uploadToCloudinary = async (
  buffer: Buffer,
  folder: string = "profile-pictures",
  publicId?: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const uploadOptions: any = {
      folder,
      resource_type: "image",
      format: "jpg", // Convert to JPG for consistency
      quality: "auto:good", // Automatic quality optimization
      transformation: [
        {
          width: 400,
          height: 400,
          crop: "fill", // Crop and resize to exact dimensions
          gravity: "face", // Focus on face if detected
        },
      ],
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
      uploadOptions.overwrite = true;
    }

    cloudinary.uploader
      .upload_stream(uploadOptions, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      })
      .end(buffer);
  });
};

/**
 * Delete image from Cloudinary
 * @param publicId - Public ID of the image to delete
 * @returns Promise with deletion result
 */
export const deleteFromCloudinary = async (publicId: string): Promise<any> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw error;
  }
};

/**
 * Extract public ID from Cloudinary URL
 * @param url - Cloudinary URL
 * @returns Public ID or null if not a valid Cloudinary URL
 */
export const extractPublicIdFromUrl = (url: string): string | null => {
  try {
    // Match pattern: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{folder}/{public_id}.{format}
    const match = url.match(/\/v\d+\/(.+)\.[^.]+$/);
    if (match) {
      return match[1]; // Returns folder/public_id
    }
    return null;
  } catch (error) {
    return null;
  }
};

export default cloudinary;
