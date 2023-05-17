const upload = require("../../../../Middleware/uploadFile");
const uploadOperation = upload.single("file");
const readExcel = require("read-excel-file/node");
const path = require("path");
const { Dataset } = require("../../../../dataser");
const preprocessing = require("../../../../utils/utils");
const service = require("../../../service/preprocessign");
const DatasetData = require("../../../../pojo/dataser");
const date = require('date-and-time');



module.exports = {
  async Upload(req, res) {
    let mapSlangWord;
    let mapStopWord;
    let mapStemming;
    let dataSource = [];
    let dataSourceLower = [];
    let dataSourceRemoveMention = [];
    let dataSourceRemoveSlang = [];
    let dataStemming = [];
    let dataSourceStopWord = [];
    let dataset=[];
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
        service.stemmingService(),
      ]).then((data) => {
        mapSlangWord = new Map(
          preprocessing.createArrayOfMaps(data[0], preprocessing.Slang)
        );
        mapStopWord = new Map(
          preprocessing.createArrayOfMaps(data[1], preprocessing.StopWord)
        );
        mapStemming = new Map(
          preprocessing.createArrayOfMaps(data[2], preprocessing.Stemming)
        );
      });

      dataSourceRemoveSlang = await preprocessing.operationSlangAndStopWord(
        dataSourceRemoveMention,
        1,
        mapSlangWord
      );

      dataStemming = await preprocessing.operationSlangAndStopWord(
        dataSourceRemoveSlang,
        1,
        mapStemming
      );
      dataSourceStopWord = await preprocessing.operationSlangAndStopWord(
        dataStemming,
        2,
        mapStopWord
      );
    
      for (let i=0;i<dataSourceStopWord.length;i++){
          dataset.push(new DatasetData(date.format(dataSource[i].tanggal,'YYYY/MM/DD'),dataSource[i].tweet,dataSourceLower[i].tweet,dataSourceRemoveMention[i].tweet,dataSourceRemoveSlang[i].tweet,dataStemming[i].tweet,dataSourceStopWord[i].tweet,dataSource[i].klasifikasi));
      }
       await service.uploadData(dataset);


      // const mySet1 = new Set();
      // for (i=0;i<dataSourceStopWord.length;i++){
      //   split = preprocessing.splitTweet(dataSourceStopWord[i]);
      //   for (j=0;j<split.length;j++){
      //     mySet1.add(split[j]);
      //   }
      // }
      // let temp =[...mySet1];
      // for (i=0;i<temp.length;i++){
      //   word =mapStopWord.get(temp[i])
      //   if (word !=undefined){
      //     temp.slice(i,1);
      //   }
      // }

      // let sentiment=[];
      // for (i=0;i<1;i++){
      //   corpus = preprocessing.splitTweet(dataSourceStopWord[i]);
      //   // iterate all corpus
      //   for(j=0;j<10;j++){
      //     let temp=[];
      //     for (k=0;k<corpus.length;k++){
            
      //       let score=0;
      //       if (temp[j] == corpus[k]){
      //         score++;
      //       }


      //     }
      //   }

      // }
     
      // console.info(preprocessing.splitTweet(dataSource));
      // console.info(preprocessing.splitTweet(dataSourceLower.tweet));
      // console.info(preprocessing.splitTweet(dataSourceRemoveMention.tweet));
      // console.info(preprocessing.splitTweet(dataSourceRemoveSlang.tweet));
      // console.info(preprocessing.splitTweet(dataStemming.tweet));
      // console.info(preprocessing.splitTweet(dataSourceStopWord.tweet));
      
      res.status(200).json({
        status: "sukses",
        message: "file berhasil di upload",
        dataAsli: dataSource[3],
        lowerCase: dataSourceLower[3],
        removeMention: dataSourceRemoveMention[3],
        slangWord: dataSourceRemoveSlang[3],
        stemming: dataStemming[3],
        stop:dataSourceStopWord
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
