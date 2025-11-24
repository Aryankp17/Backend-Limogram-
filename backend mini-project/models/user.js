import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/mini-project');

const userSchema = new mongoose.Schema({
    username:String,
    name:String,
    email:String,
    password:String,
    age:Number,
    profilepic:{
        type:String,
        default:'Default.png'
    },
    posts:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'post'
        }
    ]
})

const user = mongoose.model('user',userSchema);
export default user;