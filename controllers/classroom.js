const Classroom  = require('../models/classroom')

exports.getClassroomsForStudent = async function (userId){
    /**
     * @param userId ... the docid of user
     * 
     * @return listOfClassrooms
     * 
     * from docid get the list of classrom user is part of
     */
    try {
        console.log(userId)
        let responseData = []
        const listOfClassrooms = await Classroom.where('studentIds', 'array-contains', userId).get()
        if(listOfClassrooms.empty){
            return []
        }
        listOfClassrooms.forEach(classroom => {
            console.log(classroom.data())
            responseData = [...responseData, {docId: classroom.id, ...classroom.data()}]
        })
        console.log(responseData)
        return responseData
    } catch (err) {
        throw err
    }
}

exports.getClassroomsForTeacher = async function (userId){
   /**
     * @param userId ... the docid of user
     * 
     * @return listOfClassrooms
     * 
     * from docid get the list of classrom user is part of
     */
    try {
        console.log(userId)
        let responseData = []
        const listOfClassrooms = await Classroom.where('teacherId', '==', userId).get()
        if(listOfClassrooms.empty){
            return []
        }
        listOfClassrooms.forEach(classroom => {
            console.log(classroom.data())
            responseData = [...responseData, {docId: classroom.id, ...classroom.data()}]
        })
        console.log(responseData)
        return responseData 
    } catch (err) {
        throw err
    }
}

exports.createNewClassroom = async function (name, color, teacherDocId, displayPicture){
    /**
     * @param name
     * @param color
     * @param teacherId
     * @param displayPicture
     * 
     * @return success message for creation of clasroom
     * 
     * for new classroom studentIds will be []
     * get the doc id of user from uid
     * make a new doc in classroom collection with given data
     */

    try {
        // const { docId } = await getOnlyUserProfile(teacherId)
        // console.log(docId)
        await Classroom.add({
            name, color, teacherId: teacherDocId, studentIds:[], displayPicture
        })
        return 'New Classroom created'
    } catch (err) {
        throw err
    }
}

exports.addStudentInClassroom = async function (classroomDocId, studentDocId){
    /**
     * @param classroomDocId this classroomDocId is actually docId of classroom
     * @setudeId
     * 
     * @return success amessage on joining classroom
     * 
     * search for the classroom docid again given classroomDocId
     * get docid of user from uid
     * add docid in array of studentIds of searched classroom
     */

    try {
        const classroomRef = Classroom.doc(classroomDocId)
        const classroom = await classroomRef.get()
        if(!classroom.exists){
            throw new Error('notfound')
        }
        if(classroom.data().studentIds.includes(studentDocId)) {
            throw new Error('duplicate')
        }

        let { studentIds } = classroom.data()
        studentIds.push(studentDocId)
        await classroomRef.set({
            ...classroom.data(), studentIds,
        })
        return 'Joined Classroom Successfully'
    } catch (err) {
        throw err
    }
}
