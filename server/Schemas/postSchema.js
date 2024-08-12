const mongoose = require('mongoose');
const schema = mongoose.Schema;

const postSchema = new schema(
    {
        title: String,
        text: String,
        image: String,
        author: {
            type: schema.Types.ObjectId,
            ref: 'users'
        },
        vote: {
            type: Number,
            default: 0
        },
        date: {
            type: Date,
            default: Date.now
        }
    }
)

module.exports = mongoose.model('Post', postSchema)
