const service = require("../../../service/clasification");
const servicePreprocessing = require("../../../service/preprocessign");
const DataTraining = require("../../../../pojo/dataTrain");
const preprocessing = require("../../../../utils/utils");
const extraction_fitur = require("../../../../utils/featureExtraction");
const Klasifikasi = require('../../../../utils/clasification');
const { FlagOperation } = require("../../../../pojo/flag");
module.exports = {
  async featureExtraction(req, res) {
    let dataset_All = [];
    let datasetProvokasi = [];
    let datasetPenghinaan = [];
    let datasetPositif = [];
    let resultMax;
    let sumPositif, sumPenghinaan, sumProvokasi;
    let word;

    let positif = [];
    let penghinaan = [];
    let provokasi = [];

    let resultpositif = 1;
    let resultpenghinaan = 1;
    let resultprovokasi = 1;
    let resultancamankekerasan = 1;
    let maxData = [];
    let termPositif = [];
    let termPenghinaan = [];
    let termProvokasi = [];
    
    let klasifikasi;
    try{
      const { dataTesting } = req.body;
    const datasetObj = {
      tweet: dataTesting,
    };
   await Klasifikasi.mappingHash();

    // poccess preprocessing
    datasetObj.tweet = preprocessing.removeLineBreak(
      preprocessing.caseFolding(datasetObj.tweet)
    );
    datasetObj.tweet = preprocessing.operationMention(datasetObj, 2);
    datasetObj.tweet = preprocessing.operationSlangAndStopWord1Data(
      datasetObj.tweet,
      1,
      FlagOperation.mapSlangword
    );
    datasetObj.tweet = preprocessing.operationSlangAndStopWord1Data(
      datasetObj.tweet,
      1,
      FlagOperation.mapStemming
    );
    datasetObj.tweet = preprocessing.operationSlangAndStopWord1Data(
      datasetObj.tweet,
      2,
      FlagOperation.mapStopword
    );
    datasetObj.tweet = preprocessing.removeOnlyOneCharacter(datasetObj.tweet);

    if (FlagOperation.cache == false) {
      let dataset = await service.getData();
      FlagOperation.cache = true;
      //countTest = Math.floor((data.length * test) / 100);

      dataset_All = Klasifikasi.mappingDataset(dataset);
      FlagOperation.feature = Klasifikasi.mappingBag_of_word(dataset_All);

      // split dataset every class
      for (i = 0; i < dataset_All.length; i++) {
        if (dataset_All[i].klasifikasi == "penghinaan") {
          datasetPenghinaan.push(dataset_All[i]);
        } else if (dataset_All[i].klasifikasi == "provokasi") {
          datasetProvokasi.push(dataset_All[i]);
        }  else {
          datasetPositif.push(dataset_All[i]);
        }
      }

      FlagOperation.probPenghinaan =
        datasetPenghinaan.length / dataset_All.length;

      FlagOperation.probProvokasi =
        datasetProvokasi.length / dataset_All.length;

      FlagOperation.probPositif = datasetPositif.length / dataset_All.length;

      await Klasifikasi.GetTF(dataset_All,datasetPenghinaan,datasetProvokasi,datasetPositif)
      await Klasifikasi.GetIdf();
      await Klasifikasi.GetTfIdf();
      sumPositif = await Klasifikasi.GetSumTFIdf(FlagOperation.wPositif,FlagOperation.feature);
      sumPenghinaan = await Klasifikasi.GetSumTFIdf(FlagOperation.wPenghinaan,FlagOperation.feature);
      sumProvokasi = await Klasifikasi.GetSumTFIdf(FlagOperation.wProvokasi,FlagOperation.feature);
      await Klasifikasi.MappingmapKata(sumPositif,sumPenghinaan,sumProvokasi);
     
    }
    word = datasetObj.tweet.split(" ");
    for (j = 0; j < word.length; j++) {
      let wtermPositif = FlagOperation.mapPositif.get(word[j]) ?? 0;
      termPositif.push(wtermPositif);
      let wtermPenghinaan = FlagOperation.mapPenghinaan.get(word[j]) ?? 0;
      termPenghinaan.push(wtermPenghinaan);
      let wtermProvokasi = FlagOperation.mapProvokasi.get(word[j]) ?? 0;
      termProvokasi.push(wtermProvokasi);
      

      let Positif =
        (wtermPositif + 1) /
        (FlagOperation.weight[0] + FlagOperation.weight[3]);
      let Penghinaan =
        (wtermPenghinaan + 1) /
        (FlagOperation.weight[1] + FlagOperation.weight[3]);
      let Provokasi =
        (wtermProvokasi + 1) /
        (FlagOperation.weight[2] + FlagOperation.weight[3]);
      

      resultpositif = resultpositif * Positif;
      resultpenghinaan = resultpenghinaan * Penghinaan;
      resultprovokasi = resultprovokasi * Provokasi;
      

      positif.push(Positif);
      penghinaan.push(Penghinaan);
      provokasi.push(Provokasi);
     
    }
    resultpositif = resultpositif * FlagOperation.probPositif;
    resultpenghinaan = resultpenghinaan * FlagOperation.probPenghinaan;
    resultprovokasi = resultprovokasi * FlagOperation.probProvokasi;
  
    maxData = [
      resultpositif,
      resultpenghinaan,
      resultprovokasi,
    ];

    let max = extraction_fitur.compare(maxData[0], maxData[1]) ? 0 : 1;
    resultMax = extraction_fitur.compare(maxData[2], maxData[max]) ? 2 : max;
   
    switch (resultMax) {
      case 0:
        klasifikasi = "non hs";
        break;
      case 1:
        klasifikasi = "penghinaan";
        break;
      case 2:
        klasifikasi = "provokasi";
        break;
    }
    res.status(200).json({
      message: "berhasil",
      status: FlagOperation.cache,
      total: FlagOperation.feature.length, 
      dataclean: datasetObj.tweet,
      datacleanArr: word,
      probPositif: FlagOperation.probPositif,
      probPenghinaan: FlagOperation.probPenghinaan,
      probProvokasi: FlagOperation.probProvokasi,
      klasifikasi: klasifikasi,
      termPositif: termPositif,
      termProvokasi: termProvokasi,
      termPenghinaan: termPenghinaan,
      resultpositif,
      resultprovokasi,
      resultpenghinaan,
      resultancamankekerasan,
      perhitungan_postif: positif,
      perhitungan_penghinaan: penghinaan,
      perhitungan_provokasi: provokasi,
      weight: FlagOperation.weight,
    });
    }catch(err){
      res.status(500).json({
        status:"fail",
        message:err.message
      })
    }
    
  },
};
