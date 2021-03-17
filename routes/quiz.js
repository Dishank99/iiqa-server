const { Router } = require('express')
const router = Router()

const QuizController = require('../controllers/quiz')
const apiResponse = require('../helpers/apiResponse')

router.get('/', async(req, res) => {
    // if classroomDocId only then all the quizzes of that classroom
    // if both classroomDocId and quizDocId then return specified quiz data
    const { classroomDocId, quizDocId } = req.query

    try {

        let response = null
        if(classroomDocId && quizDocId) {
            response = await QuizController.getSpecifiedGeneratedQuiz(classroomDocId, quizDocId)
        } else if (classroomDocId && ! quizDocId) {
            response = await QuizController.getAllGeneratedQuiz(classroomDocId)
        } else {
            return apiResponse.incompleteRequestBodyResponse(res, 'Provide either both classroomDocId and quizDocId or just classroomDocId')
        }

        return apiResponse.successResponse(res, { quizData: response})

    } catch (err) {
        return err.message === 'notfound'? apiResponse.notFoundErrorResponse(res, 'Quiz for given data doesnot exist') : apiResponse.internalServerError(res, err.message)
    }
})

router.post('/', async (req, res) => {
    // to put up new quiz
    // quiz data and classroomDocId

    const { generate } = req.query
    const { imageLinksArray, classroomDocId, quizData } = req.body

    try {

        let response = null
        if (generate && !imageLinksArray) {
            return apiResponse.incompleteRequestBodyResponse(res, 'Provide either generate param and imageLinksArray or classroomDocId and QuizData')
        } else if( generate && imageLinksArray && !(classroomDocId && quizData) ) {
            response = await QuizController.generateQuiz(imageLinksArray)
        } else if ( classroomDocId && quizData && !(generate && imageLinksArray) ) {
            response = await QuizController.uploadGeneratedQuiz(quizData, classroomDocId)
            response = {quizDocId: response}
        } else {
            return apiResponse.incompleteRequestBodyResponse(res, 'Provide either generate param and imageLinksArray or classroomDocId and QuizData')
        }

        return apiResponse.successResponse(res, response)

    } catch (err) {
        return apiResponse.internalServerError(res, err.message)
    }

})

module.exports = router