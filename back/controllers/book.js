const Book = require("../models/book");
const fs = require("fs");

exports.getBooks = (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book) {
        // rounding the average to one decimal place
        book.averageRating = Math.round(book.averageRating * 10) / 10;
        res.status(200).json(book);
      } else {
        res.status(404).json({ message: "Livre non trouvé" });
      }
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.getTopRatedBooks = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then((books) => {
      res.status(200).json(books);
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.addRate = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      // Add the new rate
      book.ratings.push({ userId: req.body.userId, grade: req.body.rating });

      // Calculate the average score
      let totalRating = 0;
      for (let i = 0; i < book.ratings.length; i++) {
        totalRating += book.ratings[i].grade;
      }
      book.averageRating = totalRating / book.ratings.length;

      // Save changes
      book
        .save()
        .then((updatedBook) => {
          updatedBook.averageRating = Math.round(updatedBook.averageRating * 10) / 10;
          res.status(200).json(updatedBook);
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.createBook = (req, res, next) => {
  const bookData = JSON.parse(req.body.book);
  delete bookData.userId;
  const book = new Book({
    ...bookData,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename
      }`,
  });
  book
    .save()
    .then(() => res.status(201).json({ message: "Livre enregistré" }))
    .catch((error) => res.status(400).json({ error }));
};

exports.updateOneBook = (req, res, next) => {
  let bookData = {};
  if (req.file) {
    bookData = {
      ...JSON.parse(req.body.book),
      imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename
        }`,
    };
  } else {
    bookData = { ...req.body };
  }

  delete bookData.userId;
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      const previousImage = book.imageUrl;
      Book.updateOne(
        { _id: req.params.id },
        { ...bookData, _id: req.params.id }
      )
        .then(() => {
          if (req.file && previousImage) {
            const filename = previousImage.split("/images/")[1];
            fs.unlink(`images/${filename}`, (err) => {
              if (err) {
                console.error(
                  "Erreur lors de la suppression de l'ancienne image :",
                  err
                );
              }
            });
          }
          res.status(200).json({ message: "Livre modifié" });
        })
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(400).json({ error }));
};

exports.deleteOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Non autorisé" });
      } else {
        const filename = book.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: "Livre supprimé" }))
            .catch((error) => res.status(400).json({ error }));
        });
      }
    })
    .catch((error) => res.status(400).json({ error }));
};
