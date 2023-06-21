const service = require("../../../service/clasification");
const servicePreprocessing = require("../../../service/preprocessign");
const DataTraining = require("../../../../pojo/dataTrain");
const preprocessing = require("../../../../utils/utils");
const extraction_fitur = require("../../../../utils/featureExtraction");
const Klasifikasi = require('../../../../utils/clasification');
const { FlagOperation } = require("../../../../pojo/flag");
module.exports = {
  async featureExtraction(req, res) {
    let bag_of_word = new Set();
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

    const { dataTesting } = req.body;
    const datasetObj = {
      tweet: dataTesting,
    };

    await Promise.all([
      servicePreprocessing.slangwordService(),
      servicePreprocessing.stopwordService(),
      servicePreprocessing.stemmingService(),
    ]).then((data) => {
      FlagOperation.mapSlangword.clear();
      FlagOperation.mapSlangword = new Map(
        preprocessing.createArrayOfMaps(data[0], preprocessing.Slang)
      );

      FlagOperation.mapStopword.clear();
      FlagOperation.mapStopword = new Map(
        preprocessing.createArrayOfMaps(data[1], preprocessing.StopWord)
      );

      FlagOperation.mapStemming.clear();
      FlagOperation.mapStemming = new Map(
        preprocessing.createArrayOfMaps(data[2], preprocessing.Stemming)
      );
    });

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


      await Promise.all([
        extraction_fitur.tf_df(dataset_All, FlagOperation.feature),
        extraction_fitur.tf_df(datasetPenghinaan, FlagOperation.feature),
        extraction_fitur.tf_df(datasetProvokasi, FlagOperation.feature),
        extraction_fitur.tf_df(datasetPositif, FlagOperation.feature),
      ]).then((resultTf) => {
        FlagOperation.tfDataset = resultTf[0];

        FlagOperation.tfPenghinaan = resultTf[1];

        FlagOperation.tfProvokasi = resultTf[2];

        FlagOperation.tfPositif = resultTf[3];
      });

      await Promise.all([
        extraction_fitur.idf(FlagOperation.tfDataset, FlagOperation.feature),
        extraction_fitur.idf(FlagOperation.tfPenghinaan, FlagOperation.feature),
        extraction_fitur.idf(FlagOperation.tfProvokasi, FlagOperation.feature),
        extraction_fitur.idf(FlagOperation.tfPositif, FlagOperation.feature),
      ]).then((resultTf) => {
        FlagOperation.idfDataset = resultTf[0];

        FlagOperation.idfPenghinaan = resultTf[1];

        FlagOperation.idfProvokasi = resultTf[2];

        FlagOperation.idfPositif = resultTf[3];
      });

      await Promise.all([
        extraction_fitur.countWeight(
          FlagOperation.tfPositif,
          FlagOperation.idfPositif,
          FlagOperation.feature
        ),
        extraction_fitur.countWeight(
          FlagOperation.tfPenghinaan,
          FlagOperation.idfPenghinaan,
          FlagOperation.feature
        ),
        extraction_fitur.countWeight(
          FlagOperation.tfProvokasi,
          FlagOperation.idfProvokasi,
          FlagOperation.feature
        ),
      ]).then((resultTf) => {
        FlagOperation.wPositif = resultTf[0];
        FlagOperation.wPenghinaan = resultTf[1];
        FlagOperation.wProvokasi = resultTf[2];

      });

      await Promise.all([
        extraction_fitur.countAllWeight(
          FlagOperation.wPositif,
          FlagOperation.feature
        ),
        extraction_fitur.countAllWeight(
          FlagOperation.wPenghinaan,
          FlagOperation.feature
        ),
        extraction_fitur.countAllWeight(
          FlagOperation.wProvokasi,
          FlagOperation.feature
        ),
       
      ]).then((resultTf) => {
        sumPositif = resultTf[0];
        sumPenghinaan = resultTf[1];
        sumProvokasi = resultTf[2];
      });

      for (i = 0; i < FlagOperation.feature.length; i++) {
        FlagOperation.mapPositif.set(FlagOperation.feature[i], sumPositif[i]);
        FlagOperation.mapPenghinaan.set(
          FlagOperation.feature[i],
          sumPenghinaan[i]
        );
        FlagOperation.mapProvokasi.set(
          FlagOperation.feature[i],
          sumProvokasi[i]
        );
       
        FlagOperation.weight[0] = FlagOperation.weight[0] + sumPositif[i];
        FlagOperation.weight[1] = FlagOperation.weight[1] + sumPenghinaan[i];
        FlagOperation.weight[2] = FlagOperation.weight[2] + sumProvokasi[i];
        FlagOperation.weight[3] = FlagOperation.weight[3] + FlagOperation.idfDataset[i];
      }
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
  },
};
