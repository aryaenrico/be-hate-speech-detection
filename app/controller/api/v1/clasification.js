const service = require("../../../service/clasification");
const DataTraining = require("../../../../pojo/dataTrain");
const preprocessing = require("../../../../utils/utils");

module.exports = {
  async featureExtraction(req, res) {
    let bag_of_word = new Set();
    let dataset = [];
    let feature;
    let number_feature = [];
    let datasetNegatif=[];
    let datasetPositif=[];
    let tfHs=[];
    let dfNHs=[];
    let idfHs=[];
    let wHs=[];
    let wNhs=[];
    

    const data = await service.getData();
    for (i = 0; i < data.length; i++) {
      dataset.push(
        new DataTraining(
          data[i].dataValues.data_stopword,
          data[i].dataValues.klasifikasi
        )
      );
      let temp = data[i].dataValues.data_stopword.split(" ");
      for (j = 0; j < temp.length; j++) {
        bag_of_word.add(temp[j]);
      }
    }
    feature = [...bag_of_word];

    for (i=0;i<dataset.length;i++){
      dataset[i].klasifikasi == 'hs' ? datasetNegatif.push(dataset[i]):  datasetPositif.push(dataset[i]);
    }

    // perhitungan tf kelas hate speech
    for (i=0;i<datasetPositif.length;i++){
      let doc = datasetPositif[i].tweet.split(" ");
      let num=[];
      for (j=0;j<feature.length;j++){
          let score =0;
          for (k=0;k<doc.length;k++){
            if (doc[k] == feature[j]){
               score++;
            }
          }
          num.push((score/doc.length).toFixed(3));
      }
      tfHs.push(num);
    }

    // perhitungan df 
    for (i=0;i<datasetPositif.length;i++){
      let doc = datasetPositif[i].tweet.split(" ");
      let num=[];
      for (j=0;j<feature.length;j++){
          let score =0;
          for (k=0;k<doc.length;k++){
            if (doc[k] == feature[j]){
               score++;
               break;
            }
          }
          num.push(score);
      }
      dfNHs.push(num);
    }

     // perhitungan idf 
     for (i=0;i<feature.length;i++){
      let documentCount =0;
      for (j=0;j<dfNHs.length;j++){
        if (dfNHs[j][i] > 0){
          documentCount++;
         }
      }
      documentCount == 0 ?idfHs.push(0) : idfHs.push(Math.log(dfNHs.length/documentCount));
      
    }

    //perhitungan w untuk nhs
    for (i=0;i<tfHs.length;i++){
      let temp=[];
      for (j=0;j<feature.length;j++){
        temp.push(tfHs[i][j] * idfHs[j]);
      }
      wNhs.push(temp);
    } 


  

    // for (i = 0; i < 2; i++) {
                 
    //   let temp = dataset[i].tweet.split(" ");
    //   let num = [];
    //   for (k = 0; k < feature.length; k++) {
    //     let score = 0;
    //     for (j = 0; j < temp.length; j++) {
    //          if (temp[j] == feature[k]){
    //                 score ++;
    //          }
    //     }
    //     num.push((score/temp.length).toFixed(2));
    //   }
    //   number_feature.push(num);
    // }
      
    

    res.status(200).json({
      status: "ok",
      message: "berhasil",
      bag_of_word: feature,
      tf:tfHs,
      df:dfNHs,
      idfHs:idfHs,
      weight:wNhs
    });
  },
};
