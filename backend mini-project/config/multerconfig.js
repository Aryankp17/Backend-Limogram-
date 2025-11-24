import multer from 'multer';
import crypto from 'crypto';
import path from 'path';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/uploads/')
  },
  filename: function (req, file, cb) {
    crypto.randomBytes(16,(err,buf)=>{
        const fn = buf.toString('hex') + path.extname(file.originalname);
        cb(null, fn);
    })
    
  }
})

const upload = multer({ storage: storage });
export default upload;