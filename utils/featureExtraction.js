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
        ? num.push((score / doc.length).toFixed(7))
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
      temp.push((tf[i][j] * idf[j]));
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
      score = (score+weight[j][i]);
    }
    result.push(score);
   }
   return result;

}

function compare(a,b){
  if (a>b){
    return true;
  }else{
    return false;
  }
}
function getRandomNumber(maximum){
  let random;
  random = Math.random()*maximum;
  random =Math.floor(random);
  return random;
}

function Search(data, start, end, x) {
  let mid = Math.floor((start + end) / 2);
  if (start > end) {
    return false;
  } else if (data[mid] == x) {
    return true;
  } else if (data[mid] > x) {
   return  Search(data, start, mid - 1, x);
  } else if (data[mid] < x) {
    return Search(data, mid + 1, end, x);
  }
}

function mergeSort(arr) {
  let arr_lenghth = arr.length;
  let midIndex = Math.floor(arr_lenghth / 2);

  if (arr_lenghth == 1) {
    return arr;
  }
  let leftArray = [];
  let RightArray = [];
  for (i = 0; i < midIndex; i++) {
    leftArray.push(arr[i]);
  }
  for (i = midIndex; i < arr_lenghth; i++) {
    RightArray.push(arr[i]);
  }
  let left = mergeSort(leftArray);
  let right = mergeSort(RightArray);
  let result = Sort(left, right);
  return result;
}

function Sort(left, right) {
  let sortedArr = [];
  let i = 0;
  let k = 0;

  while (i < left.length && k < right.length) {
    if (left[i] < right[i]) {
      sortedArr.push(left[i]);
      i++;
    } else {
      sortedArr.push(right[k]);
      k++;
    }
  }

  while (i < left.length) {
    sortedArr.push(left[i]);
    i++;
  }

  while (k < right.length) {
    sortedArr.push(right[k]);
    k++;
  }
  return sortedArr;
}

module.exports = { tf_df, idf,countWeight,countAllWeight,getRandomNumber,Search,mergeSort,Sort,compare };
