const multer = require("multer");
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    createImagesDirIfNeeded(); // Call function to create 'images' directory if it doesn't exist
    callback(null, "images");
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(" ").join("_");
    callback(null, Date.now() + name);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, callback) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.jpg' || ext === '.jpeg' || ext === '.png') {
      return callback(null, true);
    }
    return callback(new Error('Seulement les fichiers jpg, jpeg ou png sont acceptés'));
  }
}).single("image");

// Function to create 'images' directory if it doesn't exist
const createImagesDirIfNeeded = () => {
  const imagesDir = path.join(__dirname, '..', 'images');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir);
  }
};

module.exports = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (req.file) {
      const imagePath = path.join(__dirname, '..', 'images', req.file.filename);
      const compressedImagePath = path.join(__dirname, '..', 'images', 'compressed_' + req.file.filename);

      // Get the file size
      const fileSize = fs.statSync(imagePath).size / (1024 * 1024);

      // Check if the file size is greater than 1MB
      if (fileSize > 1) {
        // Lire l'image originale
        fs.readFile(imagePath, (readErr, data) => {
          if (readErr) {
            console.error("Erreur lors de la lecture du fichier original :", readErr);
            return res.status(500).json({ message: "Erreur lors de la compression de l'image." });
          }

          // Compresser l'image
          sharp(data)
            .resize({ width: 800, height: null })
            .toFile(compressedImagePath, (error) => {
              if (error) {
                console.error("Erreur lors de la compression de l'image :", error);
                return res.status(500).json({ message: "Erreur lors de la compression de l'image." });
              }
              
              // Supprimer l'image originale après compression réussie
              fs.unlink(imagePath, (unlinkErr) => {
                if (unlinkErr) {
                  console.error("Erreur lors de la suppression du fichier original :", unlinkErr);
                }
                req.file.filename = 'compressed_' + req.file.filename;
                next();
              });
            });
        });
      } else {
        // If the file size is not greater than 1MB, proceed without compression
        next();
      }
    } else {
      next();
    }
  });
};