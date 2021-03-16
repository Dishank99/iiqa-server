const { User, Student } = require('../models/user')

exports.getOnlyUserProfileFromAuthUID = async function (id){
    console.log(id)
    try {
        let userData = null
        const userProfilesList = await User.where('uid','==',id).get()
        if(userProfilesList.empty){
            throw new Error ('notfound')
        }
        userProfilesList.forEach((userProfile) => {
            userData = {docId: userProfile.id, ...userProfile.data()}
        })
        return userData
    } catch (err) {throw err}
}

exports.getProfileDataFromDocId = async function (docId){
    /**
     * @param {string} docId
     * 
     * @return {Object} user profile details
     */

    try {
        const profileDetails = await User.doc(docId).get()
        if(!profileDetails.exists) {
            throw new Error ('notfound')
        }
        return {docId, ...profileDetails.data()}
    } catch (err) {
        throw err
    }
}

exports.createUser = async function (data){
    /**
     * @param {Object} data
     * 
     * @return {string} success response
     */
    try {
        const userProfilesList = await User.where('uid','==',data.uid).get()
        if (!userProfilesList.empty)
            throw new Error('duplicate')
        await User.add(data)
        return 'User created successfully.'
    } catch (err) {
        throw err
    }
}
