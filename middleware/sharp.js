const sharp = require("sharp");
module.exports = async (req, res, next) => {
  try {
    if (req.file) {
      const { buffer, originalname, mimetype } = req.file;
      const mymeTypeOk = ["image/jpg", "image/jpeg", "image/png"].includes(mimetype);
        if (!mymeTypeOk) {
            throw new Error("Invalid mime type");
        }

      const name = originalname.split(" ").join('_');
      const filename = name + Date.now() + '.webp';
      await sharp(buffer)
        .resize(404, 537, { fit: "cover" })
        .toFormat("webp")
        .webp({ quality: 80 })
        .toFile(`./images/${filename}`);
        req.file.filename = filename;
    }

    next();
  } catch (error) {
    console.error("Error processing image:", error);
    res.status(500).json({ error: "Image processing failed" });
  }
};
