const { Router } = require('express')
const router = Router()

const QuizController = require('../controllers/quiz')
const apiResponse = require('../helpers/apiResponse')

router.get('/', async(req, res) => {
    // if classroomDocId only then all the quizzes of that classroom
    // if both classroomDocId and quizDocId then return specified quiz data
    
    return true
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
            response = await QuizController.uploadGeneratedQuiz(classroomDocId, quizData)
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