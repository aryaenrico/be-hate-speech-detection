const service = require("../../../service/clasification");
const DataTraining = require("../../../../pojo/dataTrain");
const preprocessing = require("../../../../utils/utils");
const extraction_fitur = require("../../../../utils/featureExtraction");

module.exports = {
  async featureExtraction(req, res) {
    const { test = 20 } = req.query;

    let bag_of_word = new Set();
    let random_dataset = new Set();
    let mapHs = new Map();
    let mapNonhs = new Map();
    let arr_random_dataset = [];
    let dataset_All = [];
    let dataTest = [];
    let countTest;
    let feature;
    let datasetNegatif = [];
    let datasetPositif = [];
    let tfHs;
    let tfNhs;
    let tfFull;
    let idfHs;
    let idfNhs;
    let idfFull;
    let wHs;
    let wNhs;
    let sumHs;
    let sumNhs;
    let probHs;
    let probNhs;
    let weight=[0,0,0];
    
    

    const data = await service.getData();
    countTest = Math.floor((data.length * test) / 100);

    // sampai sudah semua
    while (random_dataset.size < countTest) {
      random_dataset.add(extraction_fitur.getRandomNumber(data.length - 1));
    }

    arr_random_dataset = [...random_dataset];

    for (i = 0; i < data.length; i++) {
      if (arr_random_dataset.includes(i)) {
        dataTest.push(
          new DataTraining(
            data[i].dataValues.data_stopword,
            data[i].dataValues.klasifikasi
          )
        );
      } else {
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
    }

    feature = [...bag_of_word];

    for (i = 0; i < dataset_All.length; i++) {
      dataset_All[i].klasifikasi == "hs"
        ? datasetNegatif.push(dataset_All[i])
        : datasetPositif.push(dataset_All[i]);
    }

    probHs = datasetNegatif.length / dataset_All.length;
    probNhs = datasetPositif.length / dataset_All.length;
    await Promise.all([
      extraction_fitur.tf_df(datasetPositif, feature),
      extraction_fitur.tf_df(datasetNegatif, feature),
      extraction_fitur.tf_df(dataset_All, feature),
    ]).then((resultTf) => {
      tfNhs = resultTf[0];
      tfHs = resultTf[1];
      tfFull = resultTf[2];
    });

    await Promise.all([
      extraction_fitur.idf(tfNhs, feature),
      extraction_fitur.idf(tfHs, feature),
      extraction_fitur.idf(tfFull, feature),
    ]).then((resultTf) => {
      idfHs = resultTf[1];
      idfNhs = resultTf[0];
      idfFull = resultTf[2];
    });

    await Promise.all([
      extraction_fitur.countWeight(tfNhs, idfNhs, feature),
      extraction_fitur.countWeight(tfHs, idfHs, feature),
    ]).then((resultTf) => {
      wNhs = resultTf[0];
      wHs = resultTf[1];
    });

    await Promise.all([
      extraction_fitur.countAllWeight(wNhs, feature),
      extraction_fitur.countAllWeight(wHs, feature),
    ]).then((resultTf) => {
      sumNhs = resultTf[0];
      sumHs = resultTf[1];
    });

    for (i=0;i<feature.length;i++){
      mapNonhs.set(feature[i],sumNhs[i])
      mapHs.set(feature[i],sumHs[i])
      weight[0] = weight[0]+idfFull[i];
      weight[1] =weight[1]+sumNhs[i];
      weight[2] =weight[2]+sumHs[i];
    }
    
    
    res.status(200).json({
      status: "ok",
      message: "berhasil",
      weight:weight 
    });
  },
};
