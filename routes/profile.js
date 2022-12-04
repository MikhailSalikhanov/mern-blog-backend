import { Router } from 'express'
import {
    updateAvatar,
} from '../controllers/profile.js'
import { checkAuth } from '../utils/checkAuth.js'
const router = new Router()

// Update Avatar
// http://localhost:5000/api/user/
router.put('/', updateAvatar)

export default router
