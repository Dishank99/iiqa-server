const axios = require('axios')

exports.dlAPI = axios.create({
    baseURL: 'http://127.0.0.1:100/',
    headers: { 'Content-Type': 'application/json' },
})