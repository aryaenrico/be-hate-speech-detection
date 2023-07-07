const readExcel = require("read-excel-file/node");
const path = require("path");
const { Dataset } = require("../../../../dataser");
const preprocessing = require("../../../../utils/utils");
const service = require("../../../service/preprocessign");
const serviceDataset = require("../../../service/clasification");
const DatasetData = require("../../../../pojo/dataser");
const date = require("date-and-time");
const { FlagOperation } = require("../../../../pojo/flag");
const extraction_fitur = require("../../../../utils/featureExtraction");
const Klasifikasi = require("../../../../utils/clasification");

module.exports = {
  async Matrix(req, res) {
    let dataSource = [];
    let dataSourceLower = [];
    let dataSourceRemoveMention = [];
    let sumPositif, sumPenghinaan, sumProvokasi;
    let dataSourceRemoveSlang = [];
    let dataStemming = [];
    let dataSourceStopWord = [];
    let dataset_All = [];
    let datasetProvokasi = [];
    let datasetPenghinaan = [];
    let datasetPositif = [];
    let resultpositif;
    let resultpenghinaan;
    let resultprovokasi;
    let result_klasifikasi = [];
    let result_perhitungan = [];
    let klasifikasi_actual=[];
    let confusionMatrix = new Array(3).fill(0).map(() => new Array(3).fill(0));
    let resultMatrix={};


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

      await Klasifikasi.mappingHash();

      dataSourceRemoveSlang = await preprocessing.operationSlangAndStopWord(
        dataSourceRemoveMention,
        1,
        FlagOperation.mapSlangword
      );

      dataStemming = await preprocessing.operationSlangAndStopWord(
        dataSourceRemoveSlang,
        1,
        FlagOperation.mapStemming
      );
      dataSourceStopWord = await preprocessing.operationSlangAndStopWord(
        dataStemming,
        2,
        FlagOperation.mapStopword
      );

      if (FlagOperation.cache == false) {
        let dataset = await serviceDataset.getData();
        FlagOperation.cache = true;

        dataset_All = Klasifikasi.mappingDataset(dataset);
        FlagOperation.feature = Klasifikasi.mappingBag_of_word(dataset_All);

        for (i = 0; i < dataset_All.length; i++) {
          if (dataset_All[i].klasifikasi == "penghinaan") {
            datasetPenghinaan.push(dataset_All[i]);
          } else if (dataset_All[i].klasifikasi == "provokasi") {
            datasetProvokasi.push(dataset_All[i]);
          } else {
            datasetPositif.push(dataset_All[i]);
          }
        }

        FlagOperation.probPenghinaan =
          datasetPenghinaan.length / dataset_All.length;

        FlagOperation.probProvokasi =
          datasetProvokasi.length / dataset_All.length;

        FlagOperation.probPositif = datasetPositif.length / dataset_All.length;

        await Klasifikasi.GetTF(
          dataset_All,
          datasetPenghinaan,
          datasetProvokasi,
          datasetPositif
        );
        await Klasifikasi.GetIdf();
        await Klasifikasi.GetTfIdf();
        sumPositif = await Klasifikasi.GetSumTFIdf(
          FlagOperation.wPositif,
          FlagOperation.feature
        );
        sumPenghinaan = await Klasifikasi.GetSumTFIdf(
          FlagOperation.wPenghinaan,
          FlagOperation.feature
        );
        sumProvokasi = await Klasifikasi.GetSumTFIdf(
          FlagOperation.wProvokasi,
          FlagOperation.feature
        );
        await Klasifikasi.MappingmapKata(
          sumPositif,
          sumPenghinaan,
          sumProvokasi
        );
      }
      for (i = 0; i < dataSourceStopWord.length; i++) {
        let word = dataSourceStopWord[i].tweet.split(" ");
        resultpositif = 1;
        resultpenghinaan = 1;
        resultancamankekerasan = 1;
        resultprovokasi = 1;
        let maxData = [];
        for (j = 0; j < word.length; j++) {
          let wtermPositif = FlagOperation.mapPositif.get(word[j]) ?? 0;
          let wtermPenghinaan = FlagOperation.mapPenghinaan.get(word[j]) ?? 0;
          let wtermProvokasi = FlagOperation.mapProvokasi.get(word[j]) ?? 0;
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
        }

        resultpositif = resultpositif * FlagOperation.probPositif;
        resultpenghinaan = resultpenghinaan * FlagOperation.probPenghinaan;
        resultprovokasi = resultprovokasi * FlagOperation.probProvokasi;

        maxData = [resultpositif, resultpenghinaan, resultprovokasi];
        result_perhitungan.push(maxData);

        let max = extraction_fitur.compare(maxData[0], maxData[1]) ? 0 : 1;
        let resultMax = extraction_fitur.compare(maxData[2], maxData[max])
          ? 2
          : max;
        switch (resultMax) {
          case 0:
            result_klasifikasi.push("non hs");
            break;
          case 1:
            result_klasifikasi.push("penghinaan");
            break;
          case 2:
            result_klasifikasi.push("provokasi");
            break;
        }
      }

      for (i=0;i<dataSource.length;i++){
        if (dataSource[i].klasifikasi == "non hs"){
          if (result_klasifikasi[i] == "non hs"){
            confusionMatrix[0][0] =confusionMatrix[0][0]+1;
          }else if (result_klasifikasi[i] == "penghinaan"){
            confusionMatrix[0][1] =confusionMatrix[0][1]+1;
          }else{
            confusionMatrix[0][2] =confusionMatrix[0][2]+1;
          }
        } else if (dataSource[i].klasifikasi == "penghinaan"){
          if (result_klasifikasi[i] == "penghinaan"){
            confusionMatrix[1][1] =confusionMatrix[1][1]+1;
          }else if (result_klasifikasi[i] == "provokasi"){
            confusionMatrix[1][2] =confusionMatrix[1][2]+1;
          }{
            confusionMatrix[1][0] =confusionMatrix[1][0]+1;
          }
        } 
        else{
          if (result_klasifikasi[i] == "provokasi"){
            confusionMatrix[2][2] =confusionMatrix[2][2]+1;
          }else if (result_klasifikasi[i] == "penghinaan"){
            confusionMatrix[2][1] =confusionMatrix[2][1]+1;
          }else if (result_klasifikasi[i] == "non hs"){
            confusionMatrix[2][0] =confusionMatrix[2][0]+1;
          }
        } 
      }
      const TP =confusionMatrix[0][0]+confusionMatrix[1][1]+confusionMatrix[2][2];
      const FP =(confusionMatrix[1][0]+confusionMatrix[2][0])+(confusionMatrix[0][1]+confusionMatrix[2][1])+(confusionMatrix[0][2]+confusionMatrix[1][2]);
      const FN =(confusionMatrix[0][1]+confusionMatrix[0][2])+(confusionMatrix[1][0]+confusionMatrix[1][2])+(confusionMatrix[2][0]+confusionMatrix[2][1]);
      resultMatrix.akurasi = (TP* 100) / dataSource.length;
      resultMatrix.presisi =(TP/(TP+FP)) *100;
      resultMatrix.recall =(TP/(TP+FN))*100;
      

      res.status(200).json({
        status: "sukses",
        message: "file berhasil di upload",
        dataAsli: dataSource,
        perhitungan: result_perhitungan,
        klasifikasi: result_klasifikasi,
        Tabel:confusionMatrix,
        resultMatrix
      });
    } catch (err) {
      res.status(500).json({
        status: "fail",
        message: err.message,
      });
    }
  },
};
