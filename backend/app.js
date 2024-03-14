const express = require('express');
const mongoose = require('mongoose'); 
const path = require('path')

//importation des routers requis pour l'app
const bookRoutes = require('./routes/books')
const userRoutes = require('./routes/user')

//définition de l'app avec express
const app = express();
//connexion de l'app à la base de données
mongoose.connect('mongodb+srv://rocheaxelle:Jg8xu1dVZz1K50i3@cluster0.nqwqkz6.mongodb.net/?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

//middleware qui vient parser le json
app.use(express.json())

//définition de headers évitant d'avoir des erreurs CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
})

//Définition des routes à l'aide des routeurs
app.use('/api/books', bookRoutes)
app.use('/api/auth', userRoutes)

//lien du dossier images à la route correspondante.
app.use('/images', express.static(path.join(__dirname, 'images')))

//gestion d'erreur
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.send({ error: err.message });
});

module.exports = app;