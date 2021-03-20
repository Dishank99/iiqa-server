const { Router } = require('express')
const router = Router()

const UserRoutes = require('./user')
const ClassroomRoutes = require('./classroom')
const ImageSetRoutes = require('./imageSet')
const AvatarRoutes = require('./avatar')

router.use('/users', UserRoutes)
router.use('/classrooms', ClassroomRoutes)
router.use('/imagesets', ImageSetRoutes)
router.use('/avatars', AvatarRoutes)

module.exports = router