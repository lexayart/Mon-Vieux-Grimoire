const jwt = require ('jsonwebtoken')
require('dotenv').config()

//VERIFICATION DU TOKEN
module.exports= (req, res, next) => {
    try {
        //on récupère le token dans la requête et on le vérifie grâce à jwt et la clé de décryptage
        const token = req.headers.authorization.split(' ')[1]
        const decodedToken = jwt.verify(token, process.env.TOKENKEY)
        const userId = decodedToken.userId
        //on renvoie le userId présent dans le token
        req.auth = {
            userId: userId
        }
        next()
    //on gère l'erreur s'il y en a une
    } catch (error) {res.status(401).json({error})}
}