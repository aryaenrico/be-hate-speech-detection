const DataTraining = require("../pojo/dataTrain");
const { FlagOperation } = require("../pojo/flag");
const preprocessing = require("./utils");
const service = require("../app/service/preprocessign");
const extraction_fitur = require("./featureExtraction");


function mappingDataset(dataset) {
  let result = [];
  for (i = 0; i < dataset.length; i++) {
    result.push(
      new DataTraining(
        dataset[i].dataValues.data_stopword,
        dataset[i].dataValues.klasifikasi
      )
    );
  }
  return result;
}

function mappingBag_of_word(dataset) {
  let bag_of_word = new Set();
  let word;
  let result = [];

  for (j = 0; j < dataset.length; j++) {
    word = dataset[j].tweet.split(" ");
    for (i = 0; i < word.length; i++) {
      bag_of_word.add(word[i]);
    }
  }
  result = [...bag_of_word];
  return result;
}

function offFlag() {
  FlagOperation.cache = false;
  FlagOperation.mapPositif.clear();
  FlagOperation.mapPenghinaan.clear();
  FlagOperation.mapProvokasi.clear();

  FlagOperation.tfPositif = [];
  FlagOperation.tfProvokasi = [];
  FlagOperation.tfPenghinaan = [];
  FlagOperation.tfDataset = [];

  FlagOperation.idfDataset = [];
  FlagOperation.idfPositif = [];
  FlagOperation.idfProvokasi = [];
  FlagOperation.idfPenghinaan = [];
  FlagOperation.idfDataset = [];

  FlagOperation.probPositif = 0;
  FlagOperation.probPenghinaan = 0;
  FlagOperation.probAncamanKekerasan = 0;
  FlagOperation.probProvokasi = 0;

  FlagOperation.sumPositif = [];
  FlagOperation.sumPenghinaan = [];
  FlagOperation.sumProvokasi = [];

  FlagOperation.wPositif = [];
  FlagOperation.wPenghinaan = [];
  FlagOperation.wProvokasi = [];

  FlagOperation.weight = [0, 0, 0, 0];

  FlagOperation.feature = [];
}

async function mappingHash() {
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
}

async function GetTF(dataset_All,datasetPenghinaan,datasetProvokasi,datasetPositif){
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
}

async function GetIdf(){
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

}

async function GetTfIdf(){
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
}

async function GetSumTFIdf(TFIDF,Feature){
  let result =  await extraction_fitur.countAllWeight (TFIDF,Feature);
  return result;
}

async function MappingmapKata(sumPositif,sumPenghinaan,sumProvokasi){
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

module.exports = { mappingDataset, mappingBag_of_word, offFlag, mappingHash,GetTF,GetIdf,GetTfIdf,GetSumTFIdf,MappingmapKata};
