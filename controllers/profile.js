import User from '../models/User.js'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

// Update Avatar
export const updateAvatar = async (req, res) => {
    try {      
        let fileName = Date.now().toString() + req.files.image.name
        const __dirname = dirname(fileURLToPath(import.meta.url))
        req.files.image.mv(path.join(__dirname, '..', 'uploads', fileName))
        const user = await User.findOneAndUpdate({"username": req.body.username}, {"avatarUrl": fileName}, {new: true})
        debugger
        res.json({user})
    } catch (error) {
        res.json({ message: 'Something went wrong' })
    }
}
