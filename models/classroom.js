/**
 * models comprises of files that connects to the db model
 */

const { firestore } = require('../configs/firebase')

const Classroom = firestore.collection('classrooms')

module.exports = Classroom