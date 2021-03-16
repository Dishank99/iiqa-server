//config
const express = require('express')
const app = express()
const cors = require('cors')

//middlewares
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))

//routes

//port
const port = process.env.PORT || 8000
app.listen(port, ()=> console.log(`listening on port ${port}`))