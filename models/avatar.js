/**
 * models comprises of files that connects to the db model
 */

 const { firestore } = require('../configs/firebase')

 const Avatar = firestore.collection('avatars')
 
 module.exports = Avatar