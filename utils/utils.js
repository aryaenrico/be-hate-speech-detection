const { Dataset } = require("../dataser");

function caseFolding(text) {
  return text.toLowerCase();
}

function parseDate(text) {
  return typeof text;
}
function parseDate2(text) {
  return text.split("T")[0];
}

function removeExcesSpace(text) {
  return text.replace(/\s{2,}/g, " ");
}

function removeMention(text) {
  return text.replace(/[@]{1}(.*?) /g, "");
}

function removeHastag(text) {
  return text.replace(/[#]{1}(.*?) /g, "");
}
function removeLink(text) {
  return text.replace(/(https:\/\/){1}(.*?) /g, "");
}

function removeLineBreak(text) {
  return text.replace(/(\r\n|\n|\r)/gm, "");
}

function removePunctuation(text) {
  return text.replace(/[.,\/#!$%\^&\*;:{}=_`~()?'"\[\]]/g, " ");
}

function mappingArray(data, operation) {
  let result = [];
  for (i = 0; i < data.length; i++) {
    result.push(operation(data[i]));
  }
  return result;
}

function splitTweet({ tweet }) {
  let splitTweet = tweet.split(" ");
  return splitTweet;
}

function operationLower({ tanggal, tweet, klasifikasi }) {
  let tempTweet = removeLineBreak(tweet);
  return new Dataset(tanggal, caseFolding(tempTweet), klasifikasi);
}

function operationMention({ tanggal, tweet, klasifikasi }) {
  let tempTweet = `${tweet} `;
  let resultTweet = removeMention(tempTweet);
  let result = removeLink(resultTweet);
  let resultHastag = removeHastag(result);
  return new Dataset(tanggal, removeExcesSpace(removePunctuation(resultHastag)), klasifikasi);
}

function operationSlangAndStopWord(data, code, map) {
  let arrayWord = [];
  for (i = 0; i < data.length; i++) {
    let resultWord = "";
    let tweetSplit = splitTweet(data[i]);
    for (j = 0; j < tweetSplit.length; j++) {
      let word = map.get(tweetSplit[j]);
      if (word != undefined) {
        code == 1 ? (tweetSplit[j] = word) : tweetSplit[j]="";
      }
    }
    for (kata of tweetSplit) {
      resultWord = `${resultWord} ${kata}`;
    }

    arrayWord.push(
      new Dataset(data[i].tanggal, removeExcesSpace(resultWord.trim()), data[i].klasifikasi)
    );
  }
  return arrayWord;
}

function createArrayOfMaps(data,pergi) {
  let map = [];
  for (i = 0; i < data.length; i++) {
    map.push(pergi(data[i]));
  }
  return map;
}
function Slang(data){
  return [data.dataValues.tidakbaku, data.dataValues.katabaku];
}

function Stemming(data){
  return [data.dataValues.kata_imbuhan, data.dataValues.kata_dasar];
}
function StopWord(data){
  return [data.dataValues.kata, 1];
}



module.exports = {
  caseFolding,
  parseDate,
  removeMention,
  removeLineBreak,
  removeLink,
  parseDate2,
  mappingArray,
  operationLower,
  operationMention,
  splitTweet,
  removePunctuation,
  removeExcesSpace,
  operationSlangAndStopWord,
  createArrayOfMaps,
  StopWord,
  Stemming,
  Slang
};
