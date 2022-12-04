import Comment from '../models/Comment.js'
import Post from '../models/Post.js'

export const createComment = async (req, res) => {
    try {
        // req.body is data from our form
        const { postId, comment, author } = req.body

        if (!comment)
            return res.json({ message: 'Comment cannot be empty' })

        const newComment = new Comment({ comment, author })
        await newComment.save()

        //add comment to corresponding post 
        try {
            await Post.findByIdAndUpdate(postId, {
                $push: { comments: newComment._id },
            })
        } catch (error) {
            console.log(error)
        }

        res.json(newComment)
    } catch (error) {
        res.json({ message: 'Something went wrong' })
    }
}