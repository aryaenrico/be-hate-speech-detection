const service = require("../../../service/clasification");
const servicePreprocessing = require("../../../service/preprocessign");
const DataTraining = require("../../../../pojo/dataTrain");
const preprocessing = require("../../../../utils/utils");
const extraction_fitur = require("../../../../utils/featureExtraction");
const { FlagOperation } = require("../../../../pojo/flag");
module.exports = {
  async featureExtraction(req, res) {
    let bag_of_word = new Set();
    let mapSlangWord, mapStopWord, mapStemming;
    let cleanDataset = [];
    let random_dataset = new Set();
    let mapPositif = new Map();
    let mapPenghinaan = new Map();
    let mapProvokasi = new Map();
    let mapAncamanKekerasan = new Map();
    let arr_random_dataset = [];
    let dataset_All = [];
    let dataTest = [];
    let countTest;
    let feature;
    let datasetAncamanKekerasan = [];
    let datasetProvokasi = [];
    let datasetPenghinaan = [];
    let datasetPositif = [];
    let tfPositif, tfAncamanKekerasan, tfProvokasi, tfPenghinaan, tfDataset;
    let idfPositif,
      idfAncamanKekerasan,
      idfProvokasi,
      idfPenghinaan,
      idfDataset;
    let wPositif, wPenghinaan, wAncamanKekerasan, wProvokasi;
    let sumPositif, sumPenghinaan, sumProvokasi, sumAcnamanKekerasan;
    let probPositif, probPenghinaan, probAncamanKekerasan, probProvokasi;
    let weight = [0, 0, 0, 0, 0];
    let resultclasification = [];
    let calculationNhs = [];
    let calculationhs = [];
    let result = [];
    let TP = 0;
    let FP = 0;
    let TN = 0;
    let FN = 0;
    let akurasi, presisi, recal;
    let word;

    let positif = [];
    let penghinaan = [];
    let ancamankekerasan = [];
    let provokasi = [];

    let resultpositif = 1;
    let resultpenghinaan = 1;
    let resultprovokasi = 1;
    let resultancamankekerasan = 1;
    let maxData = [];
    let termPositif = [];
    let termPenghinaan = [];
    let termProvokasi = [];
    let termAncamanKekerasan = [];
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

    if (FlagOperation.cache == false) {
      let dataset = await service.getData();
      FlagOperation.cache = true;
      // preprocessing until line 113
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
      //datasetObj.tweet =preprocessing.removeOnlyOneCharacter(datasetObj.tweet);
      //countTest = Math.floor((data.length * test) / 100);

      // get all dataset
      for (i = 0; i < dataset.length; i++) {
        dataset_All.push(
          new DataTraining(
            dataset[i].dataValues.data_stopword,
            dataset[i].dataValues.klasifikasi
          )
        );
        let temp_feature = dataset[i].dataValues.data_stopword.split(" ");
        for (j = 0; j < temp_feature.length; j++) {
          bag_of_word.add(temp_feature[j]);
        }
      }

      // split dataset every class
      for (i = 0; i < dataset_All.length; i++) {
        if (dataset_All[i].klasifikasi == "penghinaan") {
          datasetPenghinaan.push(dataset_All[i]);
        } else if (dataset_All[i].klasifikasi == "provokasi") {
          datasetProvokasi.push(dataset_All[i]);
        } else if (dataset_All[i].klasifikasi == "ancaman kekerasan") {
          datasetAncamanKekerasan.push(dataset_All[i]);
        } else {
          datasetPositif.push(dataset_All[i]);
        }
      }
      

      //probPenghinaan = datasetPenghinaan.length / dataset_All.length;
      FlagOperation.probPenghinaan =
        datasetPenghinaan.length / dataset_All.length;

      //probProvokasi = datasetProvokasi.length / dataset_All.length;
      FlagOperation.probProvokasi =
        datasetProvokasi.length / dataset_All.length;

      //probPositif = datasetPositif.length / dataset_All.length;
      FlagOperation.probPositif = datasetPositif.length / dataset_All.length;

      // probAncamanKekerasan = datasetAncamanKekerasan.length / dataset_All.length;
      FlagOperation.probAncamanKekerasan =
        datasetAncamanKekerasan.length / dataset_All.length;

      FlagOperation.feature = [...bag_of_word];

      await Promise.all([
        extraction_fitur.tf_df(dataset_All, FlagOperation.feature),
        extraction_fitur.tf_df(datasetPenghinaan, FlagOperation.feature),
        extraction_fitur.tf_df(datasetAncamanKekerasan, FlagOperation.feature),
        extraction_fitur.tf_df(datasetProvokasi, FlagOperation.feature),
        extraction_fitur.tf_df(datasetPositif, FlagOperation.feature),
      ]).then((resultTf) => {
        FlagOperation.tfDataset = resultTf[0];

        FlagOperation.tfPenghinaan = resultTf[1];

        FlagOperation.tfAncamanKekerasan = resultTf[2];

        FlagOperation.tfProvokasi = resultTf[3];

        FlagOperation.tfPositif = resultTf[4];
      });

      await Promise.all([
        extraction_fitur.idf(FlagOperation.tfDataset, FlagOperation.feature),
        extraction_fitur.idf(FlagOperation.tfPenghinaan, FlagOperation.feature),
        extraction_fitur.idf(
          FlagOperation.tfAncamanKekerasan,
          FlagOperation.feature
        ),
        extraction_fitur.idf(FlagOperation.tfProvokasi, FlagOperation.feature),
        extraction_fitur.idf(FlagOperation.tfPositif, FlagOperation.feature),
      ]).then((resultTf) => {
        idfDataset = resultTf[0];
        FlagOperation.idfDataset = resultTf[0];

        FlagOperation.idfPenghinaan = resultTf[1];

        FlagOperation.idfAncamanKekerasan = resultTf[2];

        FlagOperation.idfProvokasi = resultTf[3];

        FlagOperation.idfPositif = resultTf[4];
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
        extraction_fitur.countWeight(
          FlagOperation.tfAncamanKekerasan,
          FlagOperation.idfAncamanKekerasan,
          FlagOperation.feature
        ),
      ]).then((resultTf) => {
        FlagOperation.wPositif = resultTf[0];
        FlagOperation.wPenghinaan = resultTf[1];
        FlagOperation.wProvokasi = resultTf[2];

        FlagOperation.wAncamanKekerasan = resultTf[3];
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
        extraction_fitur.countAllWeight(
          FlagOperation.wAncamanKekerasan,
          FlagOperation.feature
        ),
      ]).then((resultTf) => {
        sumPositif = resultTf[0];
        sumPenghinaan = resultTf[1];
        sumProvokasi = resultTf[2];
        sumAcnamanKekerasan = resultTf[3];
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
        FlagOperation.mapAncamanKekerasan.set(
          FlagOperation.feature[i],
          sumAcnamanKekerasan[i]
        );
        FlagOperation.weight[0] = FlagOperation.weight[0] + sumPositif[i];
        FlagOperation.weight[1] = FlagOperation.weight[1] + sumPenghinaan[i];
        FlagOperation.weight[2] = FlagOperation.weight[2] + sumProvokasi[i];
        FlagOperation.weight[3] =
          FlagOperation.weight[3] + sumAcnamanKekerasan[i];
        FlagOperation.weight[4] = FlagOperation.weight[4] + idfDataset[i];
      }

      word = datasetObj.tweet.split(" ");
      for (j = 0; j < word.length; j++) {
        let wtermPositif = FlagOperation.mapPositif.get(word[j]) ?? 0;
        termPositif.push(wtermPositif);
        let wtermPenghinaan = FlagOperation.mapPenghinaan.get(word[j]) ?? 0;
        termPenghinaan.push(wtermPenghinaan);
        let wtermProvokasi = FlagOperation.mapProvokasi.get(word[j]) ?? 0;
        termProvokasi.push(wtermProvokasi);
        let wtermAncamanKekerasan =
          FlagOperation.mapAncamanKekerasan.get(word[j]) ?? 0;
        termAncamanKekerasan.push(wtermAncamanKekerasan);

        let Positif =
          (wtermPositif + 1) /
          (FlagOperation.weight[0] + FlagOperation.weight[4]);
        let Penghinaan =
          (wtermPenghinaan + 1) /
          (FlagOperation.weight[1] + FlagOperation.weight[4]);
        let Provokasi =
          (wtermProvokasi + 1) /
          (FlagOperation.weight[2] + FlagOperation.weight[4]);
        let AncamanKekerasan =
          (wtermAncamanKekerasan + 1) /
          (FlagOperation.weight[3] + FlagOperation.weight[4]);

        resultpositif = resultpositif * Positif;
        resultpenghinaan = resultpenghinaan * Penghinaan;
        resultprovokasi = resultprovokasi * Provokasi;
        resultancamankekerasan = resultancamankekerasan * AncamanKekerasan;

        positif.push(Positif);
        penghinaan.push(Penghinaan);
        provokasi.push(Provokasi);
        ancamankekerasan.push(AncamanKekerasan);
      }
      resultpositif = resultpositif * FlagOperation.probPositif;
      resultpenghinaan = resultpenghinaan * FlagOperation.probPenghinaan;
      resultprovokasi = resultprovokasi * FlagOperation.probProvokasi;
      resultancamankekerasan =
        resultancamankekerasan * FlagOperation.probAncamanKekerasan;

      console.info(resultpositif);

      maxData = [
        resultpositif,
        resultpenghinaan,
        resultprovokasi,
        resultancamankekerasan,
      ];

      let max = extraction_fitur.compare(maxData[0], maxData[1]) ? 0 : 1;
      let max1 = extraction_fitur.compare(maxData[2], maxData[3]) ? 2 : 3;
      let resultMax = extraction_fitur.compare(maxData[max], maxData[max1])
        ? max
        : max1;

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
        case 3:
          klasifikasi = "ancaman kekerasan";
          break;
      }
    } else {
      resultpositif = 1;
      resultprovokasi = 1;
      resultancamankekerasan = 1;
      resultpenghinaan = 1;
      console.info(FlagOperation.mapSlangword.get('7an'));
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
      word = datasetObj.tweet.split(" ");
      for (j = 0; j < word.length; j++) {
        let wtermPositif = FlagOperation.mapPositif.get(word[j]) ?? 0;
        termPositif.push(wtermPositif);
        let wtermPenghinaan = FlagOperation.mapPenghinaan.get(word[j]) ?? 0;
        termPenghinaan.push(wtermPenghinaan);
        let wtermProvokasi = FlagOperation.mapProvokasi.get(word[j]) ?? 0;
        termProvokasi.push(wtermProvokasi);
        let wtermAncamanKekerasan =
          FlagOperation.mapAncamanKekerasan.get(word[j]) ?? 0;
        termAncamanKekerasan.push(wtermAncamanKekerasan);

        let Positif =
          (wtermPositif + 1) /
          (FlagOperation.weight[0] + FlagOperation.weight[4]);
        let Penghinaan =
          (wtermPenghinaan + 1) /
          (FlagOperation.weight[1] + FlagOperation.weight[4]);
        let Provokasi =
          (wtermProvokasi + 1) /
          (FlagOperation.weight[2] + FlagOperation.weight[4]);
        let AncamanKekerasan =
          (wtermAncamanKekerasan + 1) /
          (FlagOperation.weight[3] + FlagOperation.weight[4]);

        resultpositif = resultpositif * Positif;
        resultpenghinaan = resultpenghinaan * Penghinaan;
        resultprovokasi = resultprovokasi * Provokasi;
        resultancamankekerasan = resultancamankekerasan * AncamanKekerasan;

        positif.push(Positif);
        penghinaan.push(Penghinaan);
        provokasi.push(Provokasi);
        ancamankekerasan.push(AncamanKekerasan);
      }
      resultpositif = resultpositif * FlagOperation.probPositif;
      resultpenghinaan = resultpenghinaan * FlagOperation.probPenghinaan;
      resultprovokasi = resultprovokasi * FlagOperation.probProvokasi;
      resultancamankekerasan =
        resultancamankekerasan * FlagOperation.probAncamanKekerasan;
      maxData = [
        resultpositif,
        resultpenghinaan,
        resultprovokasi,
        resultancamankekerasan,
      ];

      let max = extraction_fitur.compare(maxData[0], maxData[1]) ? 0 : 1;
      let max1 = extraction_fitur.compare(maxData[2], maxData[3]) ? 2 : 3;
      let resultMax = extraction_fitur.compare(maxData[max], maxData[max1])
        ? max
        : max1;

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
        case 3:
          klasifikasi = "ancaman kekerasan";
          break;
      }
      console.info(FlagOperation.probPositif);
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
      probAncamanKekerasan: FlagOperation.probAncamanKekerasan,
      klasifikasi: klasifikasi,
      termPositif: termPositif,
      termProvokasi: termProvokasi,
      termPenghinaan: termPenghinaan,
      resultpositif,
      resultprovokasi,
      resultpenghinaan,
      resultancamankekerasan,
      termAncamanKekerasan: termAncamanKekerasan,
      perhitungan_postif: positif,
      perhitungan_penghinaan: penghinaan,
      perhitungan_provokasi: provokasi,
      perhitungan_ancaman_kekerasan: ancamankekerasan,
      weight: FlagOperation.weight,
    });
  },
};
