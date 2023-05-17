const service = require("../../../service/clasification");
const DataTraining = require("../../../../pojo/dataTrain");
const preprocessing = require("../../../../utils/utils");

module.exports = {
  async featureExtraction(req, res) {
    let bag_of_word = new Set();
    let dataset = [];
    let feature;
    let number_feature = [];

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
  

    for (i = 0; i < 2; i++) {
                 
      let temp = dataset[i].tweet.split(" ");
      let num = [];
      for (k = 0; k < feature.length; k++) {
        let score = 0;
        for (j = 0; j < temp.length; j++) {
             if (temp[j] == feature[k]){
                    score ++;
             }
        }
        num.push((score/temp.length).toFixed(2));
      }
      number_feature.push(num);
        

     
    }
      
    

    res.status(200).json({
      status: "ok",
      message: "berhasil",
      bag_of_word: number_feature,
      data:feature.length,
      kata:dataset[1].tweet,
      word:feature
    });
  },
};
