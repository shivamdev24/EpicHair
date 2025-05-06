
import cloudinary from "./cloudinary";

export const UploadImage = async (file: File, folder: string) => {
  const buffer = await file.arrayBuffer();
  const bytes = Buffer.from(buffer);

  // Return the promise so that the caller can await it
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: "auto",
          folder: folder,
        },
        async (err, result) => {
          if (err) {
            return reject(err.message); // Reject the promise if there's an error
          }

          // Ensure result is not undefined
          if (!result) {
            return reject("Image upload failed; no result returned.");
          }

          // Get the public ID of the uploaded image
          const publicId = result.public_id;

          // Construct the transformed image URL
          const transformedImageUrl = cloudinary.url(publicId, {
            transformation: [
              { width: 500, crop: "scale" },
              { quality: 35 },
              { fetch_format: "auto" },
            ],
          });

          // Resolve the promise with the upload result and the transformed image URL
          resolve({
            ...result, // Include original upload result
            transformed_url: transformedImageUrl, // Add the transformed URL
          });
        }
      )
      .end(bytes);

    // Send the image bytes to Cloudinary
  });
};











export const DeleteImage = async (public_id:  string) => {
  
  return new Promise<void>(async(resolve, reject) => {
   try {
    const result = await cloudinary.uploader.destroy(
      public_id
    );
    console.log(result);
    return resolve();
   } catch (error) {
    console.log(error)
    reject(new Error("error"))
   }
  });
};
