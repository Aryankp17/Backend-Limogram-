import express from "express";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UserModel from './models/user.js';
import PostModel from './models/post.js';
import cookieParser from 'cookie-parser';
import upload from './config/multerconfig.js';


const app = express();
app.set('view engine','ejs');
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));
const port = 3000;

function isloggedin(req,res,next){
    jwt.verify(req.cookies.token,'9e6dd8b9',function(err,decoded){
        if(err){
            return res.status(401).redirect('/login');
        }
        req.user = decoded;
        next();
    })
}


app.get('/upload', isloggedin,(req,res)=>{
    res.render('upload');
})
app.post('/upload', isloggedin,upload.single('image'),async (req,res)=>{
    const user = await UserModel.findOne({_id:req.user.userid})
    user.profilepic = req.file.filename;
    console.log(req.file);
    user.save();
    res.redirect('/profile');

})

app.get('/profile', isloggedin,async (req,res)=>{
    const user = await  UserModel.findOne({ _id:req.user.userid}).populate('posts');
    res.render('profile',{user});
    
});
app.get('/edit-post/:id',isloggedin,async (req,res)=>{
    const post = await PostModel.findOne({_id:req.params.id})
    res.render('edit',{post});
})

app.get('/',(req,res)=>{
    res.render('home');
})
app.get('/register',(req,res)=>{
    res.render('signup');
})
app.get('/login',(req,res)=>{
    res.render('login');
})
app.get('/logout',(req,res)=>{
    res.cookie('token','');
    res.redirect('/');
})
app.post('/register',async (req,res)=>{
    let{username,name,email,password,age} = req.body;
    const user = await UserModel.findOne({email})
    if(user) return res.status(400).send('User already exists');
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(password, salt, async function(err, hash) {
        const newuser = await UserModel.create({username,name,email,password:hash,age});
        const token = jwt.sign({email:newuser.email,userid:newuser._id},'9e6dd8b9',{expiresIn:'2h'})
        res.cookie('token',token);
        res.redirect('/profile');    
        });
    });
})
app.post('/login',async (req,res)=>{
    let{email,password} = req.body;
    const user = await UserModel.findOne({email})
    if(!user) return res.status(400).send('Invalid Credentials');
    bcrypt.compare(password, user.password, function(err, result) {
        if(!result) return res.status(400).send('Invalid Credentials');
        const token = jwt.sign({email:user.email,userid:user._id},'9e6dd8b9',{expiresIn:'2h'})
        res.cookie('token',token);
        res.redirect('/profile');
    }); 
})
app.post('/create-post',isloggedin,async (req,res)=>{
    let{content} = req.body;
    const posts = await PostModel.create({ username:req.user.userid,content})
    const user = await UserModel.findOne({_id:req.user.userid});
    user.posts.push(posts._id);
    await user.save();
    res.redirect('profile');

})
app.post('/edit-post/:id',isloggedin,async (req,res)=>{
    let{content} = req.body;
    await PostModel.findOneAndUpdate({_id:req.params.id},{content},{new:true})
    res.redirect('/profile');
})
app.get('/likes/:id',isloggedin,async (req,res)=>{
    const post = await PostModel.findOne({_id:req.params.id}).populate('username');
    const likeIndex = post.likes.indexOf(req.user.userid)
    if(likeIndex === -1){
        post.likes.push(req.user.userid)
    }else{
        post.likes.splice(likeIndex,1);
    }
    post.save();
    res.redirect('/profile');
})

app.listen(port,()=>{
    console.log('Server is running on '+ port)
})