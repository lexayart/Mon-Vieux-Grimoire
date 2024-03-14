const express = require('express');
const router = express.Router();

//importation des middlewares requis pour les routes
const auth = require('../middleware/auth')
const multer = require('../middleware/multer-config')
const booksCtrl = require('../controllers/books');

//routes ne nécessitant pas d'authentification
router.get('/', booksCtrl.getAllBooks)
router.get('/bestrating', booksCtrl.getBestRating)
router.get('/:id', booksCtrl.getOneBook)

//routes nécessitant une authentification
router.post('/', auth, multer, booksCtrl.createBook)
router.put('/:id', auth, multer, booksCtrl.modifyBook)
router.delete('/:id', auth, booksCtrl.deleteBook)
router.post('/:id/rating', auth, booksCtrl.addRating)


module.exports = router;