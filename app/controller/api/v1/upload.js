const upload = require("../../../../Middleware/uploadFile");
const uploadOperation = upload.single("file");
const readExcel = require("read-excel-file/node");
const path = require("path");
const { Dataset } = require("../../../../dataser");
const preprocessing = require("../../../../utils/utils");
const { slangwordService } = require("../../../service/preprocessign");

module.exports = {
  async Upload(req, res) {
    let dataSource = [];
    let dataSourceLower = [];
    let dataSourceRemoveMention = [];
    let dataSourceRemoveSlang = [];
    let resultKataBaku = "";

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
      // slangword
      for (i = 0; i < dataSourceRemoveMention.length; i++) {
        let tweetSplit = preprocessing.splitTweet(dataSourceRemoveMention[i]);
        for (j = 0; j < tweetSplit.length; j++) {
          let data = await slangwordService(tweetSplit[j]);
          if (data != undefined) {
            tweetSplit[j] = data.dataValues.katabaku;
          }
        }
        for (word of tweetSplit) {
          resultKataBaku = `${resultKataBaku}${word} `;
        }
        dataSourceRemoveSlang.push(
          new Dataset(
            dataSourceRemoveMention[i].tanggal,
            resultKataBaku,
            dataSourceRemoveMention[i].klasifikasi
          )
        );
      }
      res.status(200).json({
        status: "sukses",
        message: "file berhasil id upload",
        data: dataSource,
        dataLower: dataSourceLower,
        remove: dataSourceRemoveMention,
        katabaku: dataSourceRemoveSlang,
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
