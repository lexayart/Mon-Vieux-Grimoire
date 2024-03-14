const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

//on récupère le modèle user, requis pour l'authentification des utilisateurs
const User = require('../models/User')

//INSCRIPTION
exports.signup = (req, res, next) => {
    //on encrpyte le mot de passe à l'aide de bcrypt
    bcrypt.hash(req.body.password, 10)
    
    .then((hash) => {
        //on créée un nouvel utilisateur avec le hash créé par bcrypt et l'email entré par l'utilisateur
        const user = new User({
            email: req.body.email,
            password: hash
        })

        //on enregistre l'utilisateur dans la base de données.
        user.save()

        //on envoie un message de succès
        .then(() => res.status(201).json({message: 'Utilisateur créé !'}))

        //on gère l'erreur s'il y en a une
        .catch((error) => {res.status(400).json({error})})
    })

    //on gère l'erreur s'il y en a une
    .catch((error) => {res.status(500).json({error})})
}

//CONNEXION
exports.login = (req, res, next) => {
    //on cherche l'utilisateur dans la base de données
    User.findOne({email: req.body.email})
    //s'il n'esxiste pas on renvoie un message d'erreur

    .then((user) => {
        if (!user){
            res.status(401).json({message: 'Utilisateur non trouvé'})

        //s'il existe on va comparer le hash du mots de passe avec ce lui de la bdd avec bcrypt
        } else {
            bcrypt.compare(req.body.password, user.password)

            .then((valid => {
                //s'ils ne correspondent pas on renvoie un message d'erreur
                if (!valid) {
                    return res.status(401).json({message: 'Mot de passe incorrect !'})
                    
                //s'ils correspondent on renvoie le user Id ainsi qu'un token
                } else {
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            {userId: user._id},
                            'RANDOM_TOKEN_SECRET',
                            {expiresIn: '24h'}
                        )
                    })
                }
            }))

            //on gère l'erreur s'il y en a une
            .catch((error) => res.status(500).json({error})) 
        }
    })

    //on gère l'erreur s'il y en a une
    .catch((error) => res.status(500).json({error}))
}