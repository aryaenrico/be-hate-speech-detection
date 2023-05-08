const express = require ('express');
const cors = require('cors');
const server = express()
const apiRouter =express.Router();
const appRouter =express.Router();
const uploadFile =require('./Middleware/uploadFile');
const controller =require ("./app/controller");
const upload =uploadFile.single('file');

apiRouter.post("/api/v1/file",[cors(),controller.api.v1.uploadController.uploadFile],controller.api.v1.uploadController.Upload);
apiRouter.get("",function(req,res){
      res.status(200).json({
            message:"hai"
      })
})
appRouter.use(apiRouter)
server.use(apiRouter);
server.use(cors());
module.exports = server;

