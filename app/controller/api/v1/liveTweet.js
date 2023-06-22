const preprocessing = require("../../../../utils/utils");
const { FlagOperation } = require("../../../../pojo/flag");
const serviceDataset = require("../../../service/clasification");
const { Dataset } = require("../../../../dataser");
const service = require("../../../service/preprocessign");
const extraction_fitur = require("../../../../utils/featureExtraction");
const Klasifikasi = require("../../../../utils/clasification");

module.exports = {
  async GetTweetFromTwiter(req, res) {
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
    try {
      await Klasifikasi.mappingHash();
      const { keyword = "pssi" } = req.body;
      const Twit = require("twit");
      const T = new Twit({
        consumer_key: "20nzU467ZwsY4QbnW6mFeIkN4",
        consumer_secret: "ODxWfkH8yf96WnqtJcjjP0u5bN7u5e3uKl3ESrF4r2dMuiEXpp",
        access_token: "108170270-c1fcsu1tbCurSgAwkDCj7aGqqshfO3mGZuPK08yg",
        access_token_secret: "ZE90nCfSWUbJZqcXu7rz6wztnDIAHm9zMZohRzTItGbP2",
      });
      const searchParams = {
        q: `${keyword}-filter:retweets`,
        count: 10,
        tweet_mode: "extended",
        lang: "in",
      };
      const responseTweet = await T.get("search/tweets", searchParams);
      for (i = 0; i < responseTweet.data.statuses.length; i++) {
        let temp = new Dataset(
          new Date(),
          responseTweet.data.statuses[i].full_text,
          ""
        );
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

      res.status(200).json({
        status: "sukses",
        message: "berhasil mendapatkan data",
        dataAsli: dataSource,
        klasifikasi: result_klasifikasi,
      });
    } catch (e) {
      res.status(500).json({
        status: "fail",
        message: e.message,
      });
    }
  },
};
