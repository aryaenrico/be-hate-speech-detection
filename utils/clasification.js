const DataTraining = require("../pojo/dataTrain");
const { FlagOperation } = require("../pojo/flag");

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

function mappingBag_of_word(dataset){
  let bag_of_word = new Set();
  let word;
  let result=[];
 
  for (j=0;j<dataset.length;j++){
    word = dataset[j].tweet.split(" ");
    for (i=0;i<word.length;i++){
      bag_of_word.add(word[i]);
    }
  }
  result=[...bag_of_word];
  return result;
}

function offFlag(){
    FlagOperation.cache = false;
  FlagOperation.mapPositif.clear();
  FlagOperation.mapPenghinaan.clear()
  FlagOperation.mapProvokasi.clear()
  FlagOperation.mapAncamanKekerasan.clear()

  FlagOperation.tfPositif=[];
  FlagOperation.tfAncamanKekerasan=[];
  FlagOperation.tfProvokasi=[]; 
  FlagOperation.tfPenghinaan=[];
  FlagOperation.tfDataset=[];

     FlagOperation.idfDataset =[];
     FlagOperation.idfPositif  =[] ;
     FlagOperation.idfAncamanKekerasan  =[]; 
     FlagOperation.idfProvokasi =[];
     FlagOperation.idfPenghinaan  =[];
     FlagOperation.idfDataset  =[];

     FlagOperation.probPositif=0;
     FlagOperation.probPenghinaan=0;
     FlagOperation.probAncamanKekerasan=0;
     FlagOperation.probProvokasi=0;


     FlagOperation.sumPositif=[];
     FlagOperation.sumPenghinaan=[];
     FlagOperation.sumAncamanKekerasan=[];
     FlagOperation.sumProvokasi=[];

    FlagOperation.wPositif=[];
    FlagOperation.wPenghinaan=[];
    FlagOperation.wAncamanKekerasan=[];
    FlagOperation.wProvokasi=[]; 

    FlagOperation.weight=[0,0,0,0,0];

    FlagOperation.feature=[];


}

module.exports={mappingDataset,mappingBag_of_word,offFlag}
