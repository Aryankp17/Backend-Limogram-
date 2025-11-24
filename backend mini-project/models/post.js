import mongoose, { Types } from 'mongoose';

const postSchema = new mongoose.Schema({
    username:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    content:String,
    createdAt:{
        type:Date,
        default:Date.now
    },
    likes:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'user'
        }
    ]
})

const post = mongoose.model('post',postSchema);
export default post;