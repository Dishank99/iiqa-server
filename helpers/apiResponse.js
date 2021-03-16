exports.successResponse = function(res, respData) {
    const data = {
        data: respData,
        message: 'success'
    }
    return res.status(200).json(data)
}

exports.createdResponse = function(res, message){
    const data = {
        message: message || 'Request copleted Sucessfully'
    }
    return res.status(201).json(data)
}

exports.notFoundErrorResponse = function(res) {
    const data = {
        error: 'Data you requested for doesnot exists'
    }
    return res.status(404).json(data)
}

exports.incompleteRequestBodyResponse = function(res, message) {
    const data = {
        error: message
    }
    return res.status(400).json(data)
}

exports.duplicateDataResponse = function(res, message) {
    const data = {
        message: 'Data already exists'
    }
    return res.status(409).json(data)
}

exports.internalServerError = function(res, message) {
    const data = {
        error: message
    }
    return res.status(500).json(data)
}