const express = require ('express');
const cors = require('cors');
const server = express()
const apiRouter =express.Router();
const appRouter =express.Router();
const uploadFile =require('./Middleware/uploadFile');
const controller =require ("./app/controller");
const upload =uploadFile.single('file');

apiRouter.post("/api/v1/file",[cors(),controller.api.v1.uploadController.uploadFile],controller.api.v1.uploadController.Upload);
apiRouter.get("/api/v1/feature",cors(),controller.api.v1.clasificationController.featureExtraction);
apiRouter.post("/api/v1/datasets",cors(),controller.api.v1.dataset.addDataset);
appRouter.use(apiRouter);
server.use(express.json());
server.use(apiRouter);
module.exports = server;

