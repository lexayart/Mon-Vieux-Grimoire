const express = require ('express')
const router = express.Router()

//importation des middlewares requis pour les routes d'authentification
const userCtrl = require('../controllers/user')

//définition des routes d'authentification
router.post('/signup', userCtrl.signup)
router.post('/login', userCtrl.login)

module.exports = router