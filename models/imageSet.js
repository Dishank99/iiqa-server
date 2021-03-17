/**
 * models comprises of files that connects to the db model
 */

 const { firestore } = require('../configs/firebase')

 const ImageSet = firestore.collection('imagesets')
 
 module.exports = ImageSet