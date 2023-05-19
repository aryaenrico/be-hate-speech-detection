const service = require("../../../service/clasification");
const DataTraining = require("../../../../pojo/dataTrain");
const preprocessing = require("../../../../utils/utils");
const extraction_fitur = require("../../../../utils/featureExtraction");

module.exports = {
  async featureExtraction(req, res) {
    let bag_of_word = new Set();
    let dataset_All = [];
    let feature;
    let datasetNegatif = [];
    let datasetPositif = [];
    let tfHs;
    let tfNhs;
    let dfNHs;
    let dfHs;
    let idfHs;
    let idfNhs;
    let wHs;
    let wNhs;

    const data = await service.getData();
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

    feature = [...bag_of_word];

    for (i = 0; i < dataset_All.length; i++) {
      dataset_All[i].klasifikasi == "hs"
        ? datasetNegatif.push(dataset_All[i])
        : datasetPositif.push(dataset_All[i]);
    }
    await Promise.all([
      extraction_fitur.tf_df(datasetPositif, feature, 1),
      extraction_fitur.tf_df(datasetNegatif, feature, 1),
    ]).then((resultTf) => {
      tfNhs = resultTf[0];
      tfHs = resultTf[1];
    });

    await Promise.all([
      extraction_fitur.tf_df(datasetPositif, feature, 2),
      extraction_fitur.tf_df(datasetNegatif, feature, 2),
    ]).then((resultTf) => {
      dfNHs = resultTf[0];
      dfHs = resultTf[1];
    });

    await Promise.all([
      extraction_fitur.idf(dfNHs, feature),
      extraction_fitur.idf(dfHs, feature),
    ]).then((resultTf) => {
      idfHs = resultTf[1];
      idfNhs = resultTf[0];
    });

    await Promise.all([
      extraction_fitur.countWeight(tfNhs, idfNhs, feature),
      extraction_fitur.countWeight(tfHs, idfHs, feature),
    ]).then((resultTf) => {
      wNhs = resultTf[0];
      wHs = resultTf[1];
    });
    console.info(dfNHs.length);

    res.status(200).json({
      status: "ok",
      message: "berhasil",
      bag_of_word: feature,
      wpositif: wNhs,
      wnegatif:wHs
    });
  },
};
