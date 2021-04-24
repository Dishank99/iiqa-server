//config
const express = require('express')
const app = express()
const cors = require('cors')
const cookieParser = require('cookie-parser')

const routes = require('./routes')

//middlewares
app.use(cors({credentials:true, origin:'http://localhost:3000'}))
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())

//routes
app.use(routes)

//port
const port = process.env.PORT || 8000
app.listen(port, ()=> console.log(`listening on port ${port}`))