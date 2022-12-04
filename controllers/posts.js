import Post from '../models/Post.js'
import User from '../models/User.js'
import Comment from '../models/Comment.js'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'

// Create Post
export const createPost = async (req, res) => {
    try {
        const { title, text } = req.body
        const user = await User.findById(req.userId)

        //create post with img
        if (req.files) {
            // new uniq name for uploaded img
            let fileName = Date.now().toString() + req.files.image.name
            // path to current folder:
            const __dirname = dirname(fileURLToPath(import.meta.url))
            // move img to 'uploads'
            req.files.image.mv(path.join(__dirname, '..', 'uploads', fileName))

            // create new post according to model and pass there data from frontend
            const newPostWithImage = new Post({
                username: user.username,
                title,
                text,
                imgUrl: fileName,
                author: req.userId,
            })

            await newPostWithImage.save()

            //add post to user
            await User.findByIdAndUpdate(req.userId, {
                $push: { posts: newPostWithImage },
            })

            return res.json(newPostWithImage)
        }

        //create post without img
        const newPostWithoutImage = new Post({
            username: user.username,
            title,
            text,
            imgUrl: '',
            author: req.userId,
        })
        await newPostWithoutImage.save()
        
        //add post to user:
        await User.findByIdAndUpdate(req.userId, {
            $push: { posts: newPostWithoutImage },
        })
        res.json(newPostWithoutImage)
    } catch (error) {
        res.json({ message: 'Something went wrong' })
    }
}

// Get All Posts
export const getAll = async (req, res) => {
    try {
        //find all posts and sort them by creation time
        const posts = await Post.find().sort('-createdAt')
        //find top-3 posts by views
        const popularPosts = await Post.find().limit(3).sort('-views')

        if (!posts) {
            return res.json({ message: 'No posts' })
        }

        res.json({ posts, popularPosts })
    } catch (error) {
        res.json({ message: 'Something went wrong' })
    }
}

// Get Post By Id
export const getById = async (req, res) => {
    try {
        // find post and increment views by 1:
        const post = await Post.findByIdAndUpdate(req.params.id, {
            $inc: { views: 1 },
        })
        res.json(post)
    } catch (error) {
        res.json({ message: 'Something went wrong' })
    }
}

// Get My Posts
export const getMyPosts = async (req, res) => {
    try {
        const user = await User.findById(req.userId)
        const list = await Promise.all(
            user.posts.map((post) => {
                return Post.findById(post._id)
            }),
        )

        res.json(list.reverse())
    } catch (error) {
        res.json({ message: 'Something went wrong' })
    }
}

// Remove post
export const removePost = async (req, res) => {
    try {
        //Delete post from all posts
        const post = await Post.findByIdAndDelete(req.params.id)
        if (!post) return res.json({ message: 'This post does not exist.' })

        //Delete post from user's post
        await User.findByIdAndUpdate(req.userId, {
            $pull: { posts: req.params.id },
        })

        res.json({ message: 'Post was deleted' })
    } catch (error) {
        res.json({ message: 'Something went wrong' })
    }
}

// Update post
export const updatePost = async (req, res) => {
    try {
        const { title, text, id } = req.body
        const post = await Post.findById(id)

        //like in "Create post" (we can change image)
        if (req.files) {
            let fileName = Date.now().toString() + req.files.image.name
            const __dirname = dirname(fileURLToPath(import.meta.url))
            req.files.image.mv(path.join(__dirname, '..', 'uploads', fileName))
            post.imgUrl = fileName || ''
        }

        post.title = title
        post.text = text

        await post.save()

        res.json(post)
    } catch (error) {
        res.json({ message: 'Something went wrong' })
    }
}

// Get Post Comments
export const getPostComments = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        const list = await Promise.all(
            post.comments.map((comment) => {
                return Comment.findById(comment)
            }),
        )
        res.json(list)
    } catch (error) {
        res.json({ message: 'Something went wrong' })
    }
}