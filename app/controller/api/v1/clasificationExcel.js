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
  async Upload(req, res) {
    let mapSlangWord;
    let mapStopWord;
    let mapStemming;
    let dataSource = [];
    let dataSourceLower = [];
    let dataSourceRemoveMention = [];
    let sumPositif, sumPenghinaan, sumProvokasi, sumAcnamanKekerasan;
    let dataSourceRemoveSlang = [];
    let dataStemming = [];
    let dataSourceStopWord = [];
    let dataset_All = [];
    let datasetAncamanKekerasan = [];
    let datasetProvokasi = [];
    let datasetPenghinaan = [];
    let datasetPositif = [];
    let resultpositif;
    let resultpenghinaan;
    let resultprovokasi;
    let resultancamankekerasan;
    let result_klasifikasi = [];
    let result_perhitungan = [];
    const dir = path.join(
      __dirname,
      `../../../../datasetData/${res.locals.fileName}`
    );
    try {
      const data = await readExcel(dir);

      for (i = 1; i < data.length; i++) {
        let temp = new Dataset(data[i][0], data[i][1], " ");
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
          } else if (dataset_All[i].klasifikasi == "ancaman kekerasan") {
            datasetAncamanKekerasan.push(dataset_All[i]);
          } else {
            datasetPositif.push(dataset_All[i]);
          }
        }

        FlagOperation.probPenghinaan =
          datasetPenghinaan.length / dataset_All.length;

        FlagOperation.probProvokasi =
          datasetProvokasi.length / dataset_All.length;

        FlagOperation.probPositif = datasetPositif.length / dataset_All.length;

        FlagOperation.probAncamanKekerasan =
          datasetAncamanKekerasan.length / dataset_All.length;

        await Promise.all([
          extraction_fitur.tf_df(dataset_All, FlagOperation.feature),
          extraction_fitur.tf_df(datasetPenghinaan, FlagOperation.feature),
          extraction_fitur.tf_df(
            datasetAncamanKekerasan,
            FlagOperation.feature
          ),
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
          extraction_fitur.idf(
            FlagOperation.tfPenghinaan,
            FlagOperation.feature
          ),
          extraction_fitur.idf(
            FlagOperation.tfAncamanKekerasan,
            FlagOperation.feature
          ),
          extraction_fitur.idf(
            FlagOperation.tfProvokasi,
            FlagOperation.feature
          ),
          extraction_fitur.idf(FlagOperation.tfPositif, FlagOperation.feature),
        ]).then((resultTf) => {
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
          FlagOperation.weight[4] =
            FlagOperation.weight[4] + FlagOperation.idfDataset[i];
        }
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
          let wtermAncamanKekerasan =
            FlagOperation.mapAncamanKekerasan.get(word[j]) ?? 0;

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
        result_perhitungan.push(maxData);

        let max = extraction_fitur.compare(maxData[0], maxData[1]) ? 0 : 1;
        let max1 = extraction_fitur.compare(maxData[2], maxData[3]) ? 2 : 3;
        let resultMax = extraction_fitur.compare(maxData[max], maxData[max1])
          ? max
          : max1;

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
          case 3:
            result_klasifikasi.push("ancaman kekerasan");
            break;
        }
      }

      res.status(200).json({
        status: "sukses",
        message: "file berhasil di upload",
        dataAsli: dataSourceStopWord,
        perhitugan: result_perhitungan,
        klasifikasi: result_klasifikasi,
      });
    } catch (error) {
      res.status(500).json({
        status: "fail",
        message: error.message,
      });
    }
  },
};
