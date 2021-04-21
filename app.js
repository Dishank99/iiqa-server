//config
const express = require('express')
const app = express()
const cors = require('cors')
const fileUpload = require('express-fileupload')
const { authenticate } = require('./middlewares')

const routes = require('./routes')

//middlewares
// app.use(fileUpload({
//     useTempFiles: true,
//     tempFileDir: './media/'
// }))
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(authenticate)

//routes
app.use(routes)

//port
const port = process.env.PORT || 8000
app.listen(port, ()=> console.log(`listening on port ${port}`))