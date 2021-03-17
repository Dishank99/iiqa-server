//config
const express = require('express')
const app = express()
const cors = require('cors')

const UserRoutes = require('./routes/user')
const ClassroomRoutes = require('./routes/classroom')
const QuizRoutes = require('./routes/quiz')

//middlewares
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))

//routes
app.use('/users/', UserRoutes)
app.use('/classrooms/', ClassroomRoutes)
app.use('/quiz/', QuizRoutes)

//port
const port = process.env.PORT || 8000
app.listen(port, ()=> console.log(`listening on port ${port}`))