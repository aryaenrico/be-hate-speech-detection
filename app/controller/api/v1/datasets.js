const preprocessing = require("../../../../utils/utils");
const  DatasetData  = require("../../../../pojo/dataser");
const date = require("date-and-time");
const service = require("../../../service/preprocessign");
const serviceDataset = require("../../../service/dataset");
const { Dataset } = require("../../../../dataser");
const Klasifikasi = require('../../../../utils/clasification');
const { FlagOperation } = require("../../../../pojo/flag");



module.exports = {
  async addDataset(req, res) {
    let mapSlangWord, mapStopWord, mapStemming;
    let tempDataset = [];
    let datalower = [];
    let dataremovemention = [];
    let dataslang = [];
    let datastemming = [];
    let datastop = [];
    let result ;

    try{
      const {tweet, klasifikasi} = req.body;
      tempDataset.push(
        new Dataset(date.format(new Date(), "YYYY/MM/DD"), tweet, klasifikasi)
      );
      await Klasifikasi.mappingHash();
      datalower = preprocessing.mappingArray(tempDataset,preprocessing.operationLower);
      dataremovemention = preprocessing.mappingArray(datalower,preprocessing.operationMention);
      dataslang = await preprocessing.operationSlangAndStopWord(
        dataremovemention,
        1,
        FlagOperation.mapSlangword
      );
      datastemming = await preprocessing.operationSlangAndStopWord(
        dataslang,
        1,
        FlagOperation.mapStemming
      );
      datastop = await preprocessing.operationSlangAndStopWord(
        datastemming,
        2,
        FlagOperation.mapStopword
      );
      for (i = 0; i < tempDataset.length; i++) {
        result = new DatasetData(
          tempDataset[i].tanggal,
          tweet,
          datalower[i].tweet,
          dataremovemention[i].tweet,
          dataslang[i].tweet,
          datastemming[i].tweet,
          datastop[i].tweet,
          klasifikasi
        );
      }
      Klasifikasi.offFlag()
      await serviceDataset.addDataset(result);
      res.status(200).json({
        data: "sukses",
        dataPreprocessing:result
        
      });
    }catch(err){
      res.status(500).json({
        status:'fail',
        message:err.message
      })
    }
      
   
  }
};
