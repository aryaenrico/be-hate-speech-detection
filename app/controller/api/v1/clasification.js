const service = require("../../../service/clasification");
const servicePreprocessing = require("../../../service/preprocessign");
const DataTraining = require("../../../../pojo/dataTrain");
const preprocessing = require("../../../../utils/utils");
const extraction_fitur = require("../../../../utils/featureExtraction");

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

    const { dataTesting } = req.body;
    const data = await service.getData();

    await Promise.all([
      servicePreprocessing.slangwordService(),
      servicePreprocessing.stopwordService(),
      servicePreprocessing.stemmingService(),
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

    const datasetObj = {
      tweet: dataTesting,
    };
    datasetObj.tweet = preprocessing.removeLineBreak(
      preprocessing.caseFolding(datasetObj.tweet)
    );
    datasetObj.tweet = preprocessing.operationMention(datasetObj, 2);
    datasetObj.tweet = preprocessing.operationSlangAndStopWord1Data(
      datasetObj.tweet,
      1,
      mapSlangWord
    );
    datasetObj.tweet = preprocessing.operationSlangAndStopWord1Data(
      datasetObj.tweet,
      1,
      mapStemming
    );
    datasetObj.tweet = preprocessing.operationSlangAndStopWord1Data(
      datasetObj.tweet,
      2,
      mapStopWord
    );
    //countTest = Math.floor((data.length * test) / 100);
    for (i = 0; i < data.length; i++) {
      dataset_All.push(
        new DataTraining(
          data[i].dataValues.data_stopword,
          data[i].dataValues.klasifikasi
        )
      );
      let temp_feature = data[i].dataValues.data_stopword.split(" ");
      for (j = 0; j < temp_feature.length; j++) {
        bag_of_word.add(temp_feature[j]);
      }
    }
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

    probPenghinaan = datasetPenghinaan.length / dataset_All.length;
    probProvokasi = datasetProvokasi.length / dataset_All.length;
    probPositif = datasetPositif.length / dataset_All.length;
    probAncamanKekerasan = datasetAncamanKekerasan.length / dataset_All.length;

    feature = [...bag_of_word];

    await Promise.all([
      extraction_fitur.tf_df(dataset_All, feature),
      extraction_fitur.tf_df(datasetPenghinaan, feature),
      extraction_fitur.tf_df(datasetAncamanKekerasan, feature),
      extraction_fitur.tf_df(datasetProvokasi, feature),
      extraction_fitur.tf_df(datasetPositif, feature),
    ]).then((resultTf) => {
      tfDataset = resultTf[0];
      tfPenghinaan = resultTf[1];
      tfAncamanKekerasan = resultTf[2];
      tfProvokasi = resultTf[3];
      tfPositif = resultTf[4];
    });

    await Promise.all([
      extraction_fitur.idf(tfDataset, feature),
      extraction_fitur.idf(tfPenghinaan, feature),
      extraction_fitur.idf(tfAncamanKekerasan, feature),
      extraction_fitur.idf(tfProvokasi, feature),
      extraction_fitur.idf(tfPositif, feature),
    ]).then((resultTf) => {
      idfDataset = resultTf[0];
      idfPenghinaan = resultTf[1];
      idfAncamanKekerasan = resultTf[2];
      idfProvokasi = resultTf[3];
      idfPositif = resultTf[4];
    });

    await Promise.all([
      extraction_fitur.countWeight(tfPositif, idfPositif, feature),
      extraction_fitur.countWeight(tfPenghinaan, idfPenghinaan, feature),
      extraction_fitur.countWeight(tfProvokasi, idfProvokasi, feature),
      extraction_fitur.countWeight(
        tfAncamanKekerasan,
        idfAncamanKekerasan,
        feature
      ),
    ]).then((resultTf) => {
      wPositif = resultTf[0];
      wPenghinaan = resultTf[1];
      wProvokasi = resultTf[2];
      wAncamanKekerasan = resultTf[3];
    });

    await Promise.all([
      extraction_fitur.countAllWeight(wPositif, feature),
      extraction_fitur.countAllWeight(wPenghinaan, feature),
      extraction_fitur.countAllWeight(wProvokasi, feature),
      extraction_fitur.countAllWeight(wAncamanKekerasan, feature),
    ]).then((resultTf) => {
      sumPositif = resultTf[0];
      sumPenghinaan = resultTf[1];
      sumProvokasi = resultTf[2];
      sumAcnamanKekerasan = resultTf[3];
    });

    for (i = 0; i < feature.length; i++) {
      mapPositif.set(feature[i], sumPositif[i]);
      mapPenghinaan.set(feature[i], sumPenghinaan[i]);
      mapProvokasi.set(feature[i], sumProvokasi[i]);
      mapAncamanKekerasan.set(feature[i], sumAcnamanKekerasan[i]);
      weight[0] = weight[0] + sumPositif[i];
      weight[1] = weight[1] + sumPenghinaan[i];
      weight[2] = weight[2] + sumProvokasi[i];
      weight[3] = weight[3] + sumAcnamanKekerasan[i];
      weight[4] = weight[4] + idfDataset[i];
    }

    let positif = [];
    let penghinaan = [];
    let ancamankekerasan = [];
    let provokasi = [];

    let resultpositif = 1;
    let resultpenghinaan = 1;
    let resultprovokasi = 1;
    let resultancamankekerasan = 1;
    let maxData = [];

    let word = datasetObj.tweet.split(" ");
    for (j = 0; j < word.length; j++) {
      let wtermPositif = mapPositif.get(word[j]) ?? 0;
      let wtermPenghinaan = mapPenghinaan.get(word[j]) ?? 0;
      let wtermProvokasi = mapProvokasi.get(word[j]) ?? 0;
      let wtermAncamanKekerasan = mapAncamanKekerasan.get(word[j]) ?? 0;
      let Positif = (wtermPositif + 1) / (weight[0] + weight[4]);
      let Penghinaan = (wtermPenghinaan + 1) / (weight[1] + weight[4]);
      let Provokasi = (wtermProvokasi + 1) / (weight[2] + weight[4]);
      let AncamanKekerasan =
        (wtermAncamanKekerasan + 1) / (weight[3] + weight[4]);
      resultpositif = resultpositif * Positif;
      resultpenghinaan = resultpenghinaan * Penghinaan;
      resultprovokasi = resultprovokasi * Provokasi;
      resultancamankekerasan = resultancamankekerasan * AncamanKekerasan;

      positif.push(Positif);
      penghinaan.push(Penghinaan);
      provokasi.push(Provokasi);
      ancamankekerasan.push(AncamanKekerasan);
    }
    resultpositif = resultpositif * probPositif;
    resultpenghinaan = resultpenghinaan * probPenghinaan;
    resultprovokasi = resultprovokasi * probProvokasi;
    resultancamankekerasan = resultancamankekerasan * probAncamanKekerasan;
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
    let klasifikasi;
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

    // resultNegatif = resultNegatif * probHs.toFixed(5);
    // resultpositif > resultNegatif ? result.push("nhs") : result.push("hs");
    // calculationNhs.push(nhs);
    // calculationhs.push(hs);

    // sampai sudah semua
    // while (random_dataset.size < countTest) {
    //   random_dataset.add(extraction_fitur.getRandomNumber(data.length - 1));
    // }

    // arr_random_dataset =extraction_fitur.mergeSort(arr_random_dataset=[...random_dataset]);
    // console.info(arr_random_dataset);

    // for (i = 0; i < data.length; i++) {
    //   // improve time complexity
    //   if (extraction_fitur.Search(arr_random_dataset,0,arr_random_dataset.length-1,i)) {
    //     dataTest.push(
    //       new DataTraining(
    //         data[i].dataValues.data_stopword,
    //         data[i].dataValues.klasifikasi
    //       )
    //     );
    //   } else {
    //     dataset_All.push(
    //       new DataTraining(
    //         data[i].dataValues.data_stopword,
    //         data[i].dataValues.klasifikasi
    //       )
    //     );
    //     let temp_feature = data[i].dataValues.data_stopword.split(" ");
    //     for (j = 0; j < temp_feature.length; j++) {
    //       bag_of_word.add(temp_feature[j]);
    //     }
    //   }
    // }

    // for (i = 0; i < dataset_All.length; i++) {
    //   dataset_All[i].klasifikasi == "hs"
    //     ? datasetNegatif.push(dataset_All[i])
    //     : datasetPositif.push(dataset_All[i]);
    // }

    // probHs = datasetNegatif.length / dataset_All.length;
    // probNhs = datasetPositif.length / dataset_All.length;

    // await Promise.all([
    //   extraction_fitur.tf_df(datasetPositif, feature),
    //   extraction_fitur.tf_df(datasetNegatif, feature),
    //   extraction_fitur.tf_df(dataset_All, feature),
    // ]).then((resultTf) => {
    //   tfNhs = resultTf[0];
    //   tfHs = resultTf[1];
    //   tfFull = resultTf[2];
    // });

    // await Promise.all([
    //   extraction_fitur.idf(tfNhs, feature),
    //   extraction_fitur.idf(tfHs, feature),
    //   extraction_fitur.idf(tfFull, feature),
    // ]).then((resultTf) => {
    //   idfHs = resultTf[1];
    //   idfNhs = resultTf[0];
    //   idfFull = resultTf[2];
    // });

    // await Promise.all([
    //   extraction_fitur.countWeight(tfNhs, idfNhs, feature),
    //   extraction_fitur.countWeight(tfHs, idfHs, feature),
    // ]).then((resultTf) => {
    //   wNhs = resultTf[0];
    //   wHs = resultTf[1];
    // });

    // await Promise.all([
    //   extraction_fitur.countAllWeight(wNhs, feature),
    //   extraction_fitur.countAllWeight(wHs, feature),
    // ]).then((resultTf) => {
    //   sumNhs = resultTf[0];
    //   sumHs = resultTf[1];
    // });

    // // create feature bag of word for each class respective with their value
    // for (i = 0; i < feature.length; i++) {
    //   mapNonhs.set(feature[i], sumNhs[i]);
    //   mapHs.set(feature[i], sumHs[i]);
    //   weight[0] = weight[0] + idfFull[i];
    //   weight[1] = weight[1] + sumNhs[i];
    //   weight[2] = weight[2] + sumHs[i];
    // }
    // const Konstanta =1;
    // // klasification process
    // for (i = 0; i < dataTest.length; i++) {
    //   let word = dataTest[i].tweet.split(" ");
    //   let hs = [];
    //   let nhs = [];
    //   let resultpositif = 1;
    //   let resultNegatif = 1;
    //   for (j = 0; j < word.length; j++) {
    //     let wtermPositrif = mapNonhs.get(word[j]) ?? 0;
    //     let wtermnegatif = mapHs.get(word[j]) ?? 0;
    //     let Postif = (wtermPositrif + 1) / (weight[1] + weight[0]);
    //     let Negatif = (wtermnegatif + 1) / (weight[2] + weight[0]);
    //     resultpositif = resultpositif * Postif.toFixed(5);
    //     resultNegatif = resultNegatif * Negatif.toFixed(5);
    //     nhs.push(Postif.toFixed(5));
    //     hs.push(Negatif.toFixed(5));
    //   }
    //   resultpositif = resultpositif * probNhs.toFixed(5);
    //   resultNegatif = resultNegatif * probHs.toFixed(5);
    //   resultpositif > resultNegatif ? result.push("nhs") : result.push("hs");
    //   calculationNhs.push(nhs);
    //   calculationhs.push(hs);
    // }

    // // confusion matrix process
    // for (i=0;i<dataTest.length;i++){
    //  if (result[i] === "nhs"){
    //   if (result[i] === dataTest[i].klasifikasi){
    //     TP++;
    //   }else{
    //     FP++;
    //   }
    //  }else{
    //   if (result[i] === "hs"){
    //     if (result[i] === dataTest[i].klasifikasi){
    //       TN++;
    //     }else{
    //       FN++;
    //     }
    //  }
    // }
    // }
    // akurasi =(TP+TN) /(TP+TN+FP+FN );
    // presisi =(TP)/(TP+FP);
    // recal=(TP)/(TP+FN);

    res.status(200).json({
      message: "berhasil",
      dataclean: datasetObj.tweet,
      feature_kata: feature,
      klasifikasi: klasifikasi,
      bobot_Term_Positif: sumPositif,
      bobot_Term_Penghinaan: sumPenghinaan,
      bobot_Term_AncamanKekerasan: sumAcnamanKekerasan,
      bobot_term_Provokasi: sumProvokasi,
      perhitungan_postif: positif,
      perhitungan_penghinaan: penghinaan,
      perhitungan_provokasi: provokasi,
      perhitungan_ancaman_kekerasan: ancamankekerasan,
    });
  },
};
