const book = require("../models/book");
const Book = require("../models/book");
const fs = require("fs");

exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;
  delete bookObject.averageRating;
  delete bookObject.ratings;

  if (!req.file || !req.file.filename) {
    return res.status(400).json({ error: "Image file is required." });
  }

  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });

  book
    .save()
    .then(() => {
      res.status(201).json({ message: "Objet enregistré !" });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.getOneBook = (req, res, next) => {
  Book.findOne({
    _id: req.params.id,
  })
    .then((book) => {
      res.status(200).json(book);
    })
    .catch((error) => {
      res.status(404).json({
        error: error,
      });
    });
};

exports.modifyBook = (req, res, next) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };

  delete bookObject._userId;
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        if (req.file && book.imageUrl) {
          const oldFilename = book.imageUrl.split("/images/")[1];
          const fs = require("fs");
          fs.unlink(`images/${oldFilename}`, (err) => {
            if (err) {
              console.error("Failed to delete old image:", err);
            }
          });
        }

        Book.updateOne(
          { _id: req.params.id },
          { ...bookObject, _id: req.params.id }
        )
          .then(() => res.status(200).json({ message: "Objet modifié!" }))
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        const filename = book.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Objet supprimé !" });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => {
      res.status(200).json(books);
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

exports.getBestRatedBooks = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then((books) => {
      res.status(200).json(books);
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

exports.rateBook = (req, res, next) => {
  const rating = req.body.rating ?? null;
  const typeok = typeof rating === "number" && Number.isInteger(rating);
  if (rating == null || !typeok || rating < 0 || rating > 5) {
    return res
      .status(400)
      .json({
        error: "Invalid rating. Please provide a rating between 0 and 5.",
      });
  }

  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        return res.status(404).json({ error: "Book not found." });
      }

      if (book.ratings.some((r) => r.userId === req.auth.userId)) {
        return res
          .status(400)
          .json({ error: "You have already rated this book." });
      }

      book.ratings.push({ userId: req.auth.userId, grade: rating });
      const ratingsTotal = book.ratings.reduce(
        (total, curr) => total + curr.grade,
        0
      );
      book.averageRating = ratingsTotal / book.ratings.length;

      return book.save();
    })
    .then((savedBook) => {
      res.status(200).json(savedBook);
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};
