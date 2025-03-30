const mongoose = require('mongoose');
const schema = mongoose.Schema;

const noteSchema = new schema(
    {
        title: {type: String, required: true},
        content: {type: Object, required: true},
        author: {
            type: schema.Types.ObjectId,
            ref: 'users'
        },
        type: {
            type: String,
            enum: ['daily', 'permanent'],
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        },
    }
)

module.exports = mongoose.model('Note', noteSchema)
