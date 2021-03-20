//config
const express = require('express')
const app = express()
const cors = require('cors')

const routes = require('./routes')

//middlewares
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))

//routes
app.use(routes)

//port
const port = process.env.PORT || 8000
app.listen(port, ()=> console.log(`listening on port ${port}`))