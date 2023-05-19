async function tf_df(dataset, feature, operation = 1) {
  let result = [];
  for (i = 0; i < dataset.length; i++) {
    let doc = dataset[i].tweet.split(" ");
    let num = [];
    for (j = 0; j < feature.length; j++) {
      let score = 0;
      for (k = 0; k < doc.length; k++) {
        if (doc[k] == feature[j]) {
          score++;
          if (operation == 2) {
            break;
          }
        }
      }
      operation == 1
        ? num.push((score / doc.length).toFixed(3))
        : num.push(score);
    }
    result.push(num);
  }

  return result;
}

async function idf(df, feature) {
  let result = [];
  for (i = 0; i < feature.length; i++) {
    let documentCount = 0;
    for (j = 0; j < df.length; j++) {
      if (df[j][i] > 0) {
        documentCount++;
      }
    }
    documentCount == 0
      ? result.push(0)
      : result.push(Math.log(df.length / documentCount));
  }
  return result;
}

async function countWeight(tf,idf,feature) {
 let result=[];
  for (i = 0; i < tf.length; i++) {
    let temp = [];
    for (j = 0; j < feature.length; j++) {
      temp.push(tf[i][j] * idf[j]);
    }
    result.push(temp);
  }
  return result;
}

async function countAllWeight(weight,feature){
  let result=[];
  for (i=0;i<feature.length;i++){
    let score=0;
    for(j=0;j<weight.length;j++){
      score = score+weight[j][i]
    }
    result.push(score);
   }
   return result;

}

module.exports = { tf_df, idf,countWeight,countAllWeight };
