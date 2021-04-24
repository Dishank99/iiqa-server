const fs = require('fs')

exports.processImageSetsLinksForAPI = function (imageLinks) {
    let resp = "['";
    for (let i = 0; i < imageLinks.length - 1; i++) {
      resp += imageLinks[i] + "', '";
    }
    resp += imageLinks[imageLinks.length - 1] + "']";
    return resp;
  }

exports.processFileName = (ogFileName) => {
  // const ogFileName = file.name
  ogFileName = ogFileName.split(' ').join('')
  const nameOfFile = ogFileName.slice(0,ogFileName.lastIndexOf('.'))
  const ext = ogFileName.slice(ogFileName.lastIndexOf('.'))
  const uniquePart = new Date().toDateString().split(' ').join('')
  const modifiedfileName = `${nameOfFile}${uniquePart}${ext}`
  return modifiedfileName
}

exports.getFirebaseFileUrl = (fileName) => {
  return `https://firebasestorage.googleapis.com/v0/b/iiqa-dev.appspot.com/o/uploadedImages%2F${fileName}?alt=media`
}

exports.deleteFileAfterUpload = (fileList) => {
  console.log(fileList)
  const deleteTask = fileList.map(file => fs.unlink(file.path, err => {
    console.log(err)
    // throw(err)
  }))
  return Promise.all(deleteTask)
}

exports.parseCookies = (unParsedCookies) => {
  const unParsedCookiesArr = unParsedCookies.split(';')
  let parsedCookies = {}
  unParsedCookiesArr.forEach(cookie => {
    const [ cookieKey, cookieValue ] = cookie.split('=')
    parsedCookies[cookieKey] = cookieValue
  });
  return parsedCookies
}