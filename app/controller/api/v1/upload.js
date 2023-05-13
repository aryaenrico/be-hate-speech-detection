const upload = require("../../../../Middleware/uploadFile");
const uploadOperation = upload.single("file");
const readExcel = require("read-excel-file/node");
const path = require("path");
const { Dataset } = require("../../../../dataser");
const preprocessing = require("../../../../utils/utils");
const service = require("../../../service/preprocessign");


module.exports = {
  async Upload(req, res) {
    let mapSlangWord;
    let mapStopWord;
    let dataSource = [];
    let dataSourceLower = [];
    let dataSourceRemoveMention = [];
    let dataSourceRemoveSlang = [];
    let dataSourceStopWord = [];
    const dir = path.join(
      __dirname,
      `../../../../datasetData/${res.locals.fileName}`
    );
    try {
      const data = await readExcel(dir);

      for (i = 1; i < data.length; i++) {
        let temp = new Dataset(data[i][0], data[i][1], data[i][2]);
        dataSource.push(temp);
      }

      dataSourceLower = preprocessing.mappingArray(
        dataSource,
        preprocessing.operationLower
      );
      dataSourceRemoveMention = preprocessing.mappingArray(
        dataSourceLower,
        preprocessing.operationMention
      );

      await Promise.all([
        service.slangwordService(),
        service.stopwordService(),
      ]).then((data) => {
        mapSlangWord = new Map(preprocessing.createMapSlangWord(data[0]));
        mapStopWord = new Map(preprocessing.createMapStopWord(data[1]));
      });

      dataSourceRemoveSlang = await preprocessing.operationSlangAndStopWord(
        dataSourceRemoveMention,
        1,
        mapSlangWord
      );
      dataSourceStopWord = await preprocessing.operationSlangAndStopWord(
        dataSourceRemoveSlang,
        2,
        mapStopWord
      );

      res.status(200).json({
        status: "sukses",
        message: "file berhasil di upload",
        dataAsli: dataSource[1],
        lowerCase: dataSourceLower[1],
       removeMention: dataSourceRemoveMention[1],
        slangWord: dataSourceRemoveSlang[1],
        stopWord: dataSourceStopWord[1],
      });
    } catch (error) {
      res.status(500).json({
        status: "fail",
        message: error.message,
      });
    }
  },
  async uploadFile(req, res, next) {
    const upload = uploadOperation;
    upload(req, res, function (err) {
      if (err != undefined) {
        res.status(400).json({
          status: "fail",
          message: err.message,
        });
        return;
      }
      res.locals.fileName = req.file.originalname;
      next();
    });
  },
};
