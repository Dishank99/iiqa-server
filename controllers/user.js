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

async function getUserProfile(id){
    /**
     * @param {string} id
     * 
     * @return {Object} userProfile
     * 
     * get the user doc from given id
     * get the student data if from doc id if user type is student
     */
    if(!id){
        return null
    }
    let userData = null
    let responseData = null
    userData = await getOnlyUserProfile(id)
    if (userData.isStudent){
        let studentData = null
        
        const studentProfilesList = await Student.where('userDocId', '==', userData.docId).get()
        if(studentProfilesList.empty){
            throw new Error('No matching student record')
        }
        studentProfilesList.forEach(studentProfile => {
            studentData = studentProfile.data()
            responseData = {...userData, ...studentData}
        })
    } else {
        responseData = userData
    }
    return responseData
    
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
