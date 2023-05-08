const upload =require ('../../../../Middleware/uploadFile')
const uploadOperation =upload.single('file')
module.exports={
      async Upload(req,res) {
            res.status(200).json({
                  status:"sukses",
                  message:'file berhasil id upload'
            })
      },


      async uploadFile(req, res, next) {
            const upload = uploadOperation;
            upload(req, res, function (err) {
                if (err != undefined) {
                    res.status(400).json({
                        status:"fail",
                        message:err.message
                    })
                    return 
                } 
                next()
            })
        }
}