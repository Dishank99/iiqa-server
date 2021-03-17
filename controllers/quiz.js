const { firestore } = require('../configs/firebase')
const { dlAPI } = require('../helpers/api')

const { getClassroomData } = require('./classroom')

const dummy = async function (imageLinksArray) {
    const imageSets = Array(imageLinksArray.slice(2,imageLinksArray.length-2))
    console.log(imageSets)
    const respObj = {
                      answer: {
                        correct_answer: "yes",
                        options: ["yes", "no"],
                      },
                      image_path:
                        "https://firebasestorage.googleapis.com/v0/b/iiqa-dev.appspot.com/o/misc%2Fbaby.jpeg?alt=media",
                      question: " is the baby happy ?",
                    }
    const resp = imageSets.map(_ => respObj)
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
        const quizApiResponse = await dlAPI.post('', {
            image_url_array:imageLinksArray
        })
        console.log(quizApiResponse)
        return quizApiResponse.data;
    } catch (err) {
        throw err
    }
}

const uploadGeneratedQuiz = async function (quizData, classroomDocId) {
    /**
     * @param quizData set of quistion answrs and imageLinks to be stored
     * @param classroomDocId
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
      let { quizData, dateTimeOfCreation } = quizObj.data()
      quizData = JSON.parse(quizData)
      const dateTimeObj = dateTimeOfCreation.toDate()
      dateTimeOfCreation = `${dateTimeObj.toDateString()} ${dateTimeObj.toLocaleTimeString()}`
      return { dateTimeOfCreation, quizData }
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
        .get();
      if (listOfQuizzesResp.empty) return [];
  
      const arrayOfQuizData = [];
      listOfQuizzesResp.forEach((eachQuizData) => {
        arrayOfQuizData.push({ docId: eachQuizData.id, ...eachQuizData.data() });
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
      const classroomData = await getClassroomData(classroomDocId)
      if(!classroomData.studentIds.includes(studentDocId)) {
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

module.exports = {
                    dummy,
                    generateQuiz,
                    uploadGeneratedQuiz,
                    getSpecifiedGeneratedQuiz,
                    getAllGeneratedQuiz,
                    getAllAttendees,
                    addAnAttendee,
                    studentEligibiltyStatus
                }