const multer = require('multer')

//on définie une bibliotèque de mime types
const MIME_TYPE = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
}

const storage = multer.diskStorage({
    //on définit la destination de l'image dans le disque
    destination: (req, file, callback) => {
            callback(null, 'images')
        },
        //on définit le nouveau nom de fichier pour qu'il soit le plus unique possible
        filename: (req, file, callback) => {
            const name = file.originalname.split(' ').join('_');
            const name2 = name.split('.')[0]
            const extension = MIME_TYPE[file.mimetype];
            callback(null, name2 + Date.now() + '.' + extension);
        }
    })

//on enregistre le tout
module.exports = multer({storage: storage}).single('image')