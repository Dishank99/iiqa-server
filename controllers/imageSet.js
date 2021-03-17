const { firestore } = require('../configs/firebase')

const ImageSet = require('../models/imageSet')

async function getImageSet(ImageSet) {
    /**
     * @param docId
     *
     * @return returns all the image sets
     */
  
    try {
      const imageSetsList = await ImageSet.get();
      if (imageSetsList.empty) {
        return [];
      }
      let imageSetResponse = [];
      imageSetsList.forEach((imageSet) => {
        imageSetResponse.push({ docId: imageSet.id, ...imageSet.data() });
      });
      return imageSetResponse;
    } catch (err) {
      throw err
    }
}
  
exports.getPredefinedImageSets = async function () {
    /**
     * @return promise that resolves to imagesets
     *
     * call getImageSet method with admin imageset
     */
  
    return getImageSet(ImageSet);
  }
  
exports.getClassroomImageSet = async function (classroomDocId) {
    /**
     * @param classroomDocId
     *
     * @return promise that resolves to metioned classroom imagesets
     *
     * get the docId of classroom
     * get the subcolection path
     * call getImageSt method with the Imageset formed
     */
  
    return getImageSet(
      firestore.collection(`classrooms/${classroomDocId}/imagesets`)
    );
}

exports.createImageSetForClassroom = async function (docId, imageLinks) {
    /**
     * @param docId docID of classroom
     * @imageLinks links of image to be saved
     *
     * @return success message
     *
     * creat document with imagelinks
     * set name to be the current day
     * displaypicture wil be bydefault taken as the first image
     */
  
    try {
      // TODO: set parameter for maximum no of images allowed
      const subCollectionForImageSet = firestore.collection(
        `classrooms/${docId}/imagesets`
      );
      const imageSetName = new Date().toDateString().slice(4);
      await subCollectionForImageSet.add({
        name: imageSetName,
        imageLinks,
      });
      return "Collection saved successfully";
    } catch (err) {
      throw err
    }
}

exports.createImageSet = async function (displayPicture='', imageLinks, name) {
    /**
     * @imageLinks links of image to be saved
     *
     * @return success message
     */
    // TODO: add dl api call
    try {
        console.log(imageLinks)
        await ImageSet.add({displayPicture, imageLinks, name})
        return 'Image set succesfully added'
    } catch (err) {
        throw err
    }
}