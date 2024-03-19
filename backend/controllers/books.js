const Book = require('../models/Book')
const fs = require('fs')
const sharp = require('../utils/sharp')

// RECUPERER LES LIVRES LES MIEUX NOTES
exports.getBestRating = (req, res, next) => {
    //on récupère tous les livres
    Book.find()
    .then((books) => {
        //on les trie dans l'ordre décroissant, on récupère les trois premiers et on les renvoie en réponse
        const sortedBooks = books.sort((a, b) => b.averageRating - a.averageRating);
        const topThree = sortedBooks.slice(0, 3);

        res.status(200).json(topThree);
    })
    //on gère l'erreur s'il y en a une
    .catch((error) => {
        res.status(404).json({error});
    });
}

//RECUPERER UN LIVRE EN PARTICULIER SELON L'ID DANS L'URL
exports.getOneBook = (req, res, next) => {
    //on récupère le livre dont l'id correspond à l'id présent dans l'url
    Book.findOne({
        _id: req.params.id
    })
    //on renvoie le livre en question en réponse
    .then((book) => res.status(200).json(book))
    //on gère l'erreur s'il y en a une
    .catch((error) => res.status(404).json({error}))
}

//RECUPERER TOUS LES LIVRES
exports.getAllBooks = (req, res, next) => {
    //on récupère tous les livres en laissant les parenthèses vides
    Book.find()
    //on renvoie la liste de tous les livres
    .then((books) => res.status(200).json(books))
    //on gère l'erreur s'il y en a une
    .catch((error) => res.status(400).json({error}))
}

//CREER UN LIVRE
exports.createBook = async (req, res, next) => {
    //on récupère le livre dans le corps de la requête en le parsant
    const bookObject = JSON.parse(req.body.book)
    //on l'optimise avec la fonction sharp.optimization
    const filename = await sharp.optimization(req.file)

    //on supprime les paramètres qui seront remplacés
    delete bookObject._id
    delete bookObject._userId
    delete bookObject.ratings
    delete bookObject.averageRating

    //on crée l'objet qui contient les infos du nouveau livre à l'aide du modèle Book
    const book = new Book({
        ...bookObject, 
        year: Number(bookObject.year),
        ratings: [],
        averageRating: 0,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/${filename}`
    })

    //on enregistre le livre dans la base de données.
    book.save()
    //on envoie un message de succès
    .then(() => res.status(201).json({message : 'Livré enregistré !'}))
    //on gère l'erreur s'il y en a une
    .catch((error) => res.status(400).json({error}))
}

//MODIFIER UN LIVRE
exports.modifyBook = async (req, res, next) => {
    //on optimise l'image s'il y en a une dans la requête à l'aide de la fonction sharp.optimization
    //et on le renomme pour l'enregistrement
    let filename
    if (req.file) {filename = await sharp.optimization(req.file)}
    
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/${filename}`
    } : {...req.body}

    //on supprime le userId qui sera remplacé
    delete bookObject._userId

    //on récupère le livre qui sera modifié
    Book.findOne({_id: req.params.id})
    .then((book) => {
        //si l'utilisateur n'a pas le bon userId, on renvoie un message d'erreur
        if (book.userId != req.auth.userId) {
            return res.status(401).json({message: 'Non autorisé '})
        //si l'utilisateur est le bon, on met à jour le livre dans la base de données avec les nouvelles informations
        } else {
            Book.updateOne({_id: req.params.id}, {...bookObject, _id: req.params.id })
            //on envoie un message de succès
            .then(() => res.status(200).json({message: 'Livre modifié !'}))
            //on gère l'erreur s'il y en a une
            .catch((error) => res.status(401).json({error}))
        }
    })
    //on gère l'erreur s'il y en a une
    .catch((error) => res.status(400).json({error}))
}

//SUPPRIMER UN LIVRE
exports.deleteBook = (req, res, next) => {
    //on récupère le livre en question dans la bdd
    Book.findOne({_id: req.params.id})
    .then((book) => {
        //si l'utilisateur n'a pas le bon userId, on renvoie un message d'erreur
        if(book.userId != req.auth.userId) {
            res.status(401).json({message: 'Non autorisé'})
        } else {
            //si l'utilisateur est le bon, on supprime la photo correspondante dans le dossier images
            const filename = book.imageUrl.split('/images/')[1]

            fs.unlink(`images/${filename}`, () => {
                //puis on supprime le livre dans la bdd
                Book.deleteOne({_id: req.params.id})
                //et on envoie un message de succès
                .then(() => res.status(200).json({message: 'Livre supprimé'}))
                //on gère l'erreur s'il y en a une
                .catch((error) => res.status(500).json({error}))
            })
        }
    })
    //on gère l'erreur s'il y en a une
    .catch((error) => res.status(500).json({error}))
}

//AJOUTER UNE NOTE A UN LIVRE
exports.addRating = (req, res, next) => {
    //on récupère le livre que l'utilisateur souhaite noter
    Book.findOne({_id: req.params.id})
    .then((book) => {
        //on cherche si une note de la part  de l'utilisateur existe déjà
        const existingRating = book.ratings.filter((rating) => rating.userId === req.auth.userId)

        //si ce n'est pas le cas, on stocke la note dans une variable
        if(existingRating.length === 0){
            const previousRatings = book.ratings
            const newRatings = [...previousRatings, {userId: req.auth.userId, grade: req.body.rating, }]

            //on met à jour la note moyenne du livre 
            let ratingsSum = 0
            for (rating of newRatings){
                ratingsSum += rating.grade
            }
            const newAverageRating = ratingsSum/newRatings.length

            //on met à jour les informations dans la bdd
            Book.findOneAndUpdate(
                {_id: req.params.id}, 
                { 
                _id: req.params.id, 
                ratings: newRatings, 
                averageRating: newAverageRating
                },
                { new: true })
            //on renvoie le livre mis à jour dans la réponse
            .then((updatedBook) => {
                return res.status(201).json(updatedBook)})
            //on gère l'erreur s'il y en a une
            .catch(error => res.status(400).json({error}))

        //si l'utilisateur a déjà noté le livre, on renvoie un message d'erreur
        } else {
             res.status(400).json({message: 'Livre déjà noté'}) 
        }
    })
    //on gère l'erreur s'il y en a une
    .catch((error) => res.status(404).json({error}))
}