const { firestore } = require('../configs/firebase')

const ImageSet = require('../models/imageSet')

const getImageSet =async function (ImageSet) {
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
  
const getPredefinedImageSets = async function () {
    /**
     * @return promise that resolves to imagesets
     *
     * call getImageSet method with admin imageset
     */
  
    return getImageSet(ImageSet);
  }

const createImageSet = async function (displayPicture='', imageLinks, name) {
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

module.exports = {
  getImageSet,
  getPredefinedImageSets,
  createImageSet,
}