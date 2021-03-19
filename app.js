//config
const express = require('express')
const app = express()
const cors = require('cors')

const UserRoutes = require('./routes/user')
const ClassroomRoutes = require('./routes/classroom')
const ImageSetRoutes = require('./routes/imageSet')
const AvatarRoutes = require('./routes/avatar')

//middlewares
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))

//routes
app.use('/users/', UserRoutes)
app.use('/classrooms/', ClassroomRoutes)
app.use('/imageset', ImageSetRoutes)
app.use('/avatar', AvatarRoutes)

//port
const port = process.env.PORT || 8000
app.listen(port, ()=> console.log(`listening on port ${port}`))