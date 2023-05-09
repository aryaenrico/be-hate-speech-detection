const upload = require("../../../../Middleware/uploadFile");
const uploadOperation = upload.single("file");
const readExcel = require("read-excel-file/node");
const path = require("path");
const { fail } = require("assert");
const { Dataset } = require("../../../../dataser");
const preprocessing = require("../../../../utils/utils");
const sastrawi = require("sastrawijs");

module.exports = {
  async Upload(req, res) {
    let dataSource = [];
    let dataSourceLower = [];
    let dataSourceRemoveMention = [];
    let dataStemmed = [];

    const dir = path.join(
      __dirname,
      `../../../../dataset/${res.locals.fileName}`
    );

    readExcel(dir)
      .then((data) => {
        for (i = 1; i < 2; i++) {
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

        res.status(200).json({
          status: "sukses",
          message: "file berhasil id upload",
          data: dataSource,
          dataLower: dataSourceLower,
          dataLink: dataSourceRemoveMention,
        });
        return;
      })
      .catch((e) => {
        res.status(500).json({
          status: "fail",
          messageL: e.message,
        });
        return;
      });
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
