const sharp = require('sharp')

const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
}

async function optimization(file){
    //on récupère la destination et le chemin de base
    const extension = MIME_TYPES[file.mimetype]
    const initialPath = `images/${file.filename}`
    
    //on remplace l'extension du chemin de base par webp pour obtenir le chemin final
    const destinationPath = initialPath.replace(`.${extension}`, '.webp')

    //on redimensionne l'image, on la convertit et on l'enregistre au bon endroit grâce au chemin final
    await sharp(initialPath)
    .resize({height: 600, fit: 'cover'})
    .webp()
    .toFile(destinationPath)
    .then(() => {
        console.log('Image enregistrée')
    })
    //on gère l'erreur s'il y en a une
    .catch((error) => console.log(error))
    
    //on retourne le chemin final
    return destinationPath
}

//on exporte la fonction
module.exports = { optimization };