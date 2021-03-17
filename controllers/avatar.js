const Avatar = require('../models/avatar')

exports.getAvatarImageLinks = async function (){
    /**
     * @return list of image links of all stored avatars from db
     */
    try {
        const listOfAvatars = await Avatar.get()
        if(listOfAvatars.empty){
            return []
        }
        let responseData = []
        listOfAvatars.forEach(avatarDoc => {
            console.log(avatarDoc.data())
            responseData = [...responseData, avatarDoc.data().imageLink]
        })
        return responseData
    } catch (err) {
        throw err
    }
}