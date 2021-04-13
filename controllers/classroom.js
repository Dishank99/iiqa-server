const Classroom  = require('../models/classroom')
const { firestore } = require('../configs/firebase')
const { dlAPI } = require('../helpers/api')
const { processImageSetsLinksForAPI } = require('../helpers/utilities')
const { getImageSet } = require('./imageSet')

const getClassroomsForStudent = async function (userId){
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

const getClassroomsForTeacher = async function (userId){
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

const getClassroomData = async function(classroomDocId) {
    /**
     * @param classroomDocId
     * 
     * @return complete data of classroom
     */

     try {
        const classroomRef = Classroom.doc(classroomDocId)
        const classroom = await classroomRef.get()
        if(!classroom.exists){
            throw new Error('notfound')
        }

        return {docId:classroomDocId, ...classroom.data()}
    } catch (err) {
        throw err
    }
}

const createNewClassroom = async function (name, color, teacherDocId, displayPicture){
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
        console.log(name, color, teacherDocId, displayPicture)
        await Classroom.add({
            name, color, teacherId: teacherDocId, studentIds:[], displayPicture
        })
        return 'New Classroom created'
    } catch (err) {
        throw err
    }
}

const updateClassroom = async function (classroomDocId, data){
    /**
     * @param classroomDocId this classroomDocId is actually docId of classroom
     * @param studentDocId
     * 
     * @return success amessage on joining classroom
     * 
     * search for the classroom docid again given classroomDocId
     * get docid of user from uid
     * add docid in array of studentIds of searched classroom
     */

    try {
        const { studentDocId, teacherDocId, color, displayPicture } = data 
        let classroomData = await getClassroomData(classroomDocId)
        if(studentDocId) {
          if(classroomData.studentIds.includes(studentDocId)) {
              throw new Error('duplicate')
          }
          classroomData = {...classroomData, studentIds: [...classroomData.studentIds, studentDocId]}
        }
        if (teacherDocId) {
          classroomData = {...classroomData, teacherId: teacherDocId}
        }
        if(color) {
          classroomData = {...classroomData, color}
        }
        if(displayPicture) {
          classroomData = {...classroomData, displayPicture}
        }

        await Classroom.doc(classroomDocId).set({
            ...classroomData
        })
        return 'Updated Classroom Successfully'
    } catch (err) {
        throw err
    }
}

const dummy = async function (imageLinksArray) {
    console.log(imageLinksArray)
    const respObj = {
                      answer: {
                        correct_answer: "yes",
                        options: ["yes", "no"],
                      },
                      image_path:
                        "https://firebasestorage.googleapis.com/v0/b/iiqa-dev.appspot.com/o/misc%2Fbaby.jpeg?alt=media",
                      question: " is the baby happy ?",
                    }
    const resp = imageLinksArray.map(_ => respObj)
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({
          result: resp
        });
      }, [1000]);
    });
}
  
const generateQuiz = async function (imageLinksArray) {
    /**
     * @param imageLinksArray
     *
     * @response quiz question and answers
     *
     */

    try {
        const processedImageLinksArray = processImageSetsLinksForAPI(imageLinksArray)
        const quizApiResponse = await dlAPI.post('', {
            image_url_array:processedImageLinksArray
        })
        console.log(quizApiResponse)
        return quizApiResponse.data;
    } catch (err) {
        throw err
    }
}

const uploadGeneratedQuiz = async function (quizData, classroomDocId, quizName) {
    /**
     * @param quizData set of quistion answrs and imageLinks to be stored
     * @param classroomDocId
     * @param quizName
     *
     * @return return quiz docId
     */
  
    try {
      var currentdate = new Date();
      const { id: quizDocId } = await firestore
        .collection(`classrooms/${classroomDocId}/quizzes`)
        .add({
          dateTimeOfCreation: currentdate,
          quizData: JSON.stringify(quizData),
          quizName,
        });
  
      return quizDocId;
    } catch (err) {
      throw new Error(err);
    }
}

const getSpecifiedGeneratedQuiz = async function (classroomDocId, quizDocId){
    /**
     * @param classroomDocId
     * @param quizDocId
     * 
     * @return quiz data for the given classroom and quiz id
     */
  
    try {
      const quizObj = await firestore.collection(`classrooms/${classroomDocId}/quizzes`).doc(quizDocId).get()
      if(!quizObj.exists){
        throw new Error('notfound')
      }
      let { quizData, dateTimeOfCreation, ...rest } = quizObj.data()
      quizData = JSON.parse(quizData)
      const dateTimeObj = dateTimeOfCreation.toDate()
      dateTimeOfCreation = `${dateTimeObj.toDateString()} ${dateTimeObj.toLocaleTimeString()}`
      return { dateTimeOfCreation, quizData, ...rest }
    } catch (err) {
      throw err
    }
}

const getAllGeneratedQuiz = async function (classroomDocId) {
    /**
     * @param classroomDocId
     *
     * @return array of quizzes and data
     */
  
    try {
      const listOfQuizzesResp = await firestore
        .collection(`classrooms/${classroomDocId}/quizzes`)
        .orderBy('dateTimeOfCreation', 'desc')
        .get();
      if (listOfQuizzesResp.empty) return [];
  
      const arrayOfQuizData = [];
      listOfQuizzesResp.forEach((eachQuizData) => {
        let { dateTimeOfCreation, ...restOfTheData } = eachQuizData.data()
        // dateTimeOfCreation = `${dateTimeOfCreation.toDate().toDateString()} ${dateTimeOfCreation.toDate().toLocaleTimeString()}`
        const dateOfCreation = dateTimeOfCreation.toDate().toDateString()
        const timeOfCreation = dateTimeOfCreation.toDate().toLocaleTimeString()
        const dateTime = {dateOfCreation, timeOfCreation}
        arrayOfQuizData.push({ docId: eachQuizData.id, dateTime, ...restOfTheData });
      });
      return arrayOfQuizData;
    } catch (err) {
      throw err;
    }
}

const getAllAttendees = async function (classroomDocId, quizDocId) {
    /**
     * @param classroomDocId
     * @param quizDocId
     *
     * @return attendee name and score
     */
  
    try {
      const listOfAttendeesResp = await firestore
        .collection(`classrooms/${classroomDocId}/quizzes/${quizDocId}/attendees`)
        .get();
      if (listOfAttendeesResp.empty) {
        return [];
      }
      let attendeesDataArray = [];
      listOfAttendeesResp.forEach((attendee) => {
        attendeesDataArray.push({ docId: attendee.id, ...attendee.data() });
      });
      return attendeesDataArray;
    } catch (err) {
      throw err
    }
}

const addAnAttendee = async function (classroomDocId, quizDocId, studentDocId, score, outOffScore)
    {
    /**
     * @param classroomDocId
     * @param quizDocId
     * @param studentDocId
     *
     * @return sucess message on saving the score
     */
  
    try {
      console.log(classroomDocId, quizDocId, studentDocId, score, outOffScore);
      // TODO: rethink for this test
    //   const classroomData = await getClassroomData(classroomDocId)
    //   const allPresentAttendees = await getAllAttendees(classroomDocId, quizDocId)
      const [ classroomData, allPresentAttendees ] = await Promise.all([
                                                                        getClassroomData(classroomDocId),
                                                                        getAllAttendees(classroomDocId, quizDocId)
                                                                    ])
      if(!classroomData.studentIds.includes(studentDocId) || allPresentAttendees.find(attendeeData => attendeeData.studentDocId === studentDocId)) {
          throw new Error('notauthorized')
      }
      await firestore
        .collection(`classrooms/${classroomDocId}/quizzes/${quizDocId}/attendees`)
        .add({
          studentDocId,
          score: `${score}/${outOffScore}`,
        });
  
      return "Your score saved";
    } catch (err) {
      throw err
    }
}

const studentEligibiltyStatus = async function (classroomDocId, quizDocId, studentId) {
    try {
        const classroomDataValidation =  getClassroomData(classroomDocId)
        const listOfAttendeesRespValidation = firestore
            .collection(`classrooms/${classroomDocId}/quizzes/${quizDocId}/attendees`)
            .where('studentDocId', '==', studentId)
            .get();
        const eligibilityValidations = await Promise.all([classroomDataValidation, listOfAttendeesRespValidation])
        const [classroomData ,listOfAttendeesResp] = eligibilityValidations
        console.log(classroomData)
        if(listOfAttendeesResp.empty && classroomData.studentIds.includes(studentId))
            return 1
        else
            return 0
    } catch (err) {
      throw err
    }
}

const getClassroomImageSet = async function (classroomDocId) {
    /**
     * @param classroomDocId
     *
     * @return promise that resolves to metioned classroom imagesets
     *
     * get the docId of classroom
     * get the subcolection path
     * call getImageSt method with the Imageset formed
     */
  
    return getImageSet(
      firestore.collection(`classrooms/${classroomDocId}/imagesets`)
    );
}

const createImageSetForClassroom = async function (docId, imageLinks) {
    /**
     * @param docId docID of classroom
     * @imageLinks links of image to be saved
     *
     * @return success message
     *
     * creat document with imagelinks
     * set name to be the current day
     * displaypicture wil be bydefault taken as the first image
     */
  
    try {
      const subCollectionForImageSet = firestore.collection(
        `classrooms/${docId}/imagesets`
      );
      const imageSetName = new Date().toDateString().slice(4);
      await subCollectionForImageSet.add({
        name: imageSetName,
        imageLinks,
      });
      return "Collection saved successfully";
    } catch (err) {
      throw err
    }
}

module.exports = {
                    getClassroomsForStudent,
                    getClassroomsForTeacher,
                    getClassroomData,
                    createNewClassroom,
                    updateClassroom,
                    //quiz
                    dummy,
                    generateQuiz,
                    uploadGeneratedQuiz,
                    getSpecifiedGeneratedQuiz,
                    getAllGeneratedQuiz,
                    getAllAttendees,
                    addAnAttendee,
                    studentEligibiltyStatus,
                    //imageset
                    getClassroomImageSet,
                    createImageSetForClassroom,
                }
