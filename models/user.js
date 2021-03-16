/**
 * models comprises of files that connects to the db model
 */

const { firestore } = require('../configs/firebase')

const User = firestore.collection('users')
const Student = firestore.collection('students')
 
module.exports = {User, Student}