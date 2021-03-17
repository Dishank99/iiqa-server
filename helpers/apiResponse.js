exports.successResponse = function(res, respData) {
    const data = {
        ...respData,
        message: 'success'
    }
    return res.status(200).json(data)
}

exports.createdResponse = function(res, message='Request completed Sucessfully'){
    const data = {
        message
    }
    return res.status(201).json(data)
}

exports.notFoundErrorResponse = function(res, message='Data you requested for doesnot exists') {
    const data = {
        error: message 
    }
    return res.status(404).json(data)
}

exports.incompleteRequestBodyResponse = function(res, message) {
    const data = {
        error: `Please provide valid data. ${message}`
    }
    return res.status(400).json(data)
}

exports.duplicateDataResponse = function(res, message='Data already exists') {
    const data = {
        error: message
    }
    return res.status(409).json(data)
}

exports.notAuthorizedResponse = function(res, message='You are not authorized') {
    const data = {
        error: message
    }
    return res.status(403).json(data)
}

exports.internalServerError = function(res, message) {
    const data = {
        error: message
    }
    return res.status(500).json(data)
}