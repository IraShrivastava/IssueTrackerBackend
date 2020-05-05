const appConfig = require('./../../config/appConfig')
const crypto = require('crypto')
const GridFsStorage = require('multer-gridfs-storage')
const multer = require('multer')
const path = require('path')
const mongoose = require('mongoose')
const Grid = require('gridfs-stream')
const response = require('./../libs/responseLib');
const logger = require('./../libs/loggerLib');

let conn = mongoose.createConnection(appConfig.db.uri)
  let gfs
conn.once('open', ()=>{
  gfs = Grid(conn.db, mongoose.mongo)
  gfs.collection('uploads')
})
   


const storage = new GridFsStorage({
    url: appConfig.db.uri,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          const filename = buf.toString('hex') + path.extname(file.originalname);
          const fileInfo = {
            filename: filename,
            bucketName: 'uploads'
          };
          resolve(fileInfo);
        });
      });
    }
  });
  const upload = multer({ storage });

  // init gfs

  const uploadFile = (req, res) =>{
        logger.captureInfo('Fileuploaded', 'Multer: uploadFile')
        res.json({file: req.file, uploadFileName:req.file.filename})
  }
  
  const getAllFile =  (req, res) => {
     gfs.files.find().toArray((err,result)=>{
       if(err)
       {
        logger.captureError(err.message, 'Multer: getAllFile', 10)
        let apiResponse = response.generate(true, 'Failed To Find File Data', 500, null)
        res.send(apiResponse)
       }
       else
       {
        let apiResponse = response.generate(false, 'All Files Found', 200, result)
        res.send(apiResponse)
       }

     })
  }

  const getSingleFile =  (req, res) => {
     gfs.files.findOne({ filename: req.params.filename },((err,result)=> {
       if(err)
       {
        logger.captureError(err.message, 'Multer: getSingleFile', 10)
        let apiResponse = response.generate(true, 'Failed To Find File Data', 500, null)
        res.send(apiResponse)
       }
       else{
        let apiResponse = response.generate(false, 'All Files Found', 200, result)
        res.send(apiResponse)
       }
     })
     )}

  const downloadFile =  (req, res) => {
     gfs.files.findOne({ filename: req.params.filename },((err,result)=>{
       if(err){
        logger.captureError(err.message, 'Multer: downloadFile', 10)
        let apiResponse = response.generate(true, 'Failed To Find File Data', 500, null)
        res.send(apiResponse)
       }
       else{
        const readStream = gfs.createReadStream({filename: req.params.filename});
        console.log(readStream)
        res.set('Content-Type', result.contentType)
         readStream.pipe(res)
       }
     })
     )}

  const deleteFile =  (req, res) =>{
    
       gfs.files.deleteOne({ _id: req.params.id, root: 'uploads' },((err,result)=>{
         if(err){
          logger.captureError(err.message, 'Multer: deleteFile', 10)
          let apiResponse = response.generate(true, 'Failed To Delete File Data', 500, null)
          res.send(apiResponse)
         }
         else{
          let apiResponse = response.generate(false, 'File Deleted succesfully', 200, result)
          res.send(apiResponse)
         }
       })  
       )}

module.exports = {
    upload: upload,
    uploadFile:uploadFile,
    getAllFile: getAllFile,
    getSingleFile: getSingleFile,
    downloadFile: downloadFile,
    deleteFile: deleteFile
}