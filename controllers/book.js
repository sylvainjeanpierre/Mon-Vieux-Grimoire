const Book = require('../models/book')
const fs = require('fs');

exports.getBooks = (req, res, next) => {
    Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({error}));
};

exports.getOneBook = (req, res, next) => {
    Book.findOne({_id: req.params.id})
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json({error}));
};

exports.createBook = (req, res, next) => {
    console.log(req.body.book)
    const bookData = JSON.parse(req.body.book);
    delete bookData.userId;
    const book = new Book({
        ...bookData,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    book.save()
    .then(() => res.status(201).json({message:'Livre enregistré'}))
    .catch(error => res.status(400).json({error}));


    // const bookData = JSON.parse(req.body.book);
    // const book = new Book(bookData);
    // book.save()
    // .then(() => res.status(201).json({message:'Livre enregistré'}))
    // .catch(error => res.status(400).json({error}));
};

exports.updateOneBook = (req, res, next) => {
    const bookData = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : {...req.body};
    delete bookData.userId;
    Book.findOne({_id: req.params.id})
    .then((book) => {
        if (book.userId != req.auth.userId) {
            res.status(401).json({message:'Non autorisé'})
        } else {
            Book.updateOne({_id: req.params.id}, {...req.body, _id: req.params.id})
        .then(() => res.status(200).json({message: 'Livre modifié'}))
        .catch((error) => res.status(400).json({error}));
        }

    })
    .catch(error => res.status(400).json({error}))


    // Book.updateOne({_id: req.params.id}, {...req.body, _id: req.params.id})
    // .then(() => res.status(200).json({message: 'Livre modifié'}))
    // .catch((error) => res.status(400).json({error}));
};

exports.deleteOneBook = (req, res, next) => {
    Book.findOne({_id: req.params.id})
    .then((book) => {
        if (book.userId != req.auth.userId) {
            res.status(401).json({message:'Non autorisé'})
        } else {
            const filename = book.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Book.deleteOne({_id: req.params.id})
                .then(() => res.status(200).json({message: 'Livre supprimé'}))
                .catch((error) => res.status(400).json({error}));
            });
        }
    })
    .catch(error => res.status(400).json({error}))

    // Book.deleteOne({_id: req.params.id})
    // .then(() => res.status(200).json({message: 'Livre supprimé'}))
    // .catch((error) => res.status(400).json({error}));
};