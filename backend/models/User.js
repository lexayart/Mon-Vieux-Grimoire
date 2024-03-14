const mongoose = require('mongoose')

//on crée un schema selon les spécifications techniques fournies pour la base de données
const userSchema = mongoose.Schema({
    email: {type:String, required: true},
    password: {type:String, required:true}
})

//on exporte le modèle
module.exports = mongoose.model('User', userSchema)