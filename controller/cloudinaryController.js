import cloudinary from "cloudinary";

export const deleteCloudinaryImage = async (req, res, next) => {
    try {
      const { public_id } = req.body;
      
      if (!public_id) {
        return res.status(400).json({ message: "Public ID is required" });
      }
      
      // Delete the image from Cloudinary
      const result = await cloudinary.uploader.destroy(public_id);
      
      if (result.result === 'ok') {
        return res.status(200).json({ message: "Image deleted successfully" });
      } else {
        return res.status(400).json({ message: "Failed to delete image" });
      }
    } catch (err) {
      console.error("Error deleting image from Cloudinary:", err);
      next(err);
    }
  };