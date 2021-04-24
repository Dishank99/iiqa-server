const { Router } = require('express')
const router = Router()

const { authenticate } = require('../middlewares')

const UserRoutes = require('./user')
const ClassroomRoutes = require('./classroom')
const ImageSetRoutes = require('./imageSet')
const AvatarRoutes = require('./avatar')
const StorageRoutes = require('./storage')
const AuthRoutes = require('./auth')

router.use('/users', authenticate, UserRoutes)
router.use('/classrooms', authenticate, ClassroomRoutes)
router.use('/imagesets', authenticate, ImageSetRoutes)
router.use('/avatars', authenticate, AvatarRoutes)
router.use('/storage', authenticate, StorageRoutes)
router.use('/auth', AuthRoutes)

module.exports = router