const { firestore } = require('../configs/firebase')
const { dlAPI } = require('../helpers/api')

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

module.exports = { dummy, generateQuiz, uploadGeneratedQuiz }