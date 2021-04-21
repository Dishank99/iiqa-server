const { storage } = require('../configs/firebase')
const { getFirebaseFileUrl, deleteFileAfterUpload } = require('../helpers/utilities')
const fs = require('fs')

exports.uploadImagesToFireBaseStorage = async (imageFiles) => {
    try {
        console.log(imageFiles)
        const uploadTasks = imageFiles.map((file) => {
            // console.log(filesNamesArr[index])
            const fileBlob = fs.readFileSync(file.path)
            return storage.upload(file.path, {
                destination: `/uploadedImages/${file.name}`
            })
            // return storage.ref(`/uploadedImages/${file.name}`).put(fileBlob)
        })    
    
        let uploadedImagesData = []

        const snapshotArr = await Promise.all(uploadTasks)
        if(snapshotArr.length === uploadTasks.length){
            imageFiles.forEach(imageFile => uploadedImagesData.push(getFirebaseFileUrl(imageFile.name)))
            deleteFileAfterUpload(imageFiles)
            return uploadedImagesData
        } else {
            throw new Error('Could not upload all the files')
        }
    } catch (err) {
        throw err
    }
}