const { text } = require("express");
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
function removeNumber(text){
  return text.replace(/[4]/g, "A");
}
function replaceNumberToCharacter(text){
  let resultWord ="";
  let word = removeExcesSpace(text).split(" ");
  for (let i=0;i<word.length;i++){
      if (/[0-9]/g.test(word[i])){
            for (let k=0;k<word[i].length;k++){
              let temp = word[i];
              if(/[0-9]/g.test(temp.charAt(k))){
                //word[i].charAt(k) = mappingNumberToCharacter(word[i].charAt(k));
                word[i] = word[i].substring(0, k) + mappingNumberToCharacter(word[i].charAt(k)) + word[i].substring(k + 1);

              }
            }
      }
  }
  for (kata of word) {
    resultWord = `${resultWord} ${kata}`;
  }
  return resultWord;
}

function removeHastag(text) {
  return text.replace(/[#]{1}(.*?) /g, "");
}
function removeLink(text) {
  return text.replace(/(https:\/\/){1}(.*?) /g, "");
}

function removeWordNya(text){
  let word = text.split(" ");
  let result="";
  for (i=0;i<word.length;i++){
    result =`${result} ${word[i].replace('nya','')}`;
  }
  return result;
}

function removeLineBreak(text) {
  return text.replace(/(\r\n|\n|\r)/gm, " ");
}

function removeOnlyOneCharacter(text){
  return text.replace(/ [a-z]{1,3} /g," ");
 
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

function mappingNumberToCharacter(text){
  let result ="";
  switch(text){
    case "1": 
    result ="i";
    break;
    case "5":
      result ="s"
      break;
      case "4":
        result ="a"
        break;
        case "3":
          result ="e"
          break;
  }
  return result;
}

// function onlyText(text){
//   return text.replace(/[^a-z]/g, " ");
// }

function operationMention({ tanggal, tweet, klasifikasi },code=1) {
  let tempTweet = `${tweet} `;
  let resultMention = removeMention(tempTweet);
  let resultLink = removeLink(resultMention);
  let resultHastag = removeHastag(resultLink);
  let removeTandaBaca =removePunctuation(resultHastag);
  let replaceToCharacter = replaceNumberToCharacter(removeTandaBaca);
  //let resutltNumber = removeNumber(resultHastag);
 // let replaceToCharacter =replaceNumberToCharacter(resutltNumber)
  //let resultRemoveEmote =onlyText(resutltNumber);
 // let removeTandaBaca =removePunctuation(resutltNumber);
  let tempTweet2 = ` ${replaceToCharacter} `;
  if (code == 1){
    return new Dataset(tanggal,removeExcesSpace(tempTweet2), klasifikasi);
  }else{
    return removeExcesSpace(tempTweet2)
  }

  
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
   if (code == 1){
    arrayWord.push(
      new Dataset(data[i].tanggal, removeExcesSpace(resultWord.trim()), data[i].klasifikasi)
    );
   }else{
    arrayWord.push(
      new Dataset(data[i].tanggal, removeExcesSpace(removeOnlyOneCharacter(resultWord.trim())), data[i].klasifikasi)
    );
   }
    
  }
  return arrayWord;
}

function operationSlangAndStopWord1Data(data, code, map) {
  
    let resultWord = "";
    let result;
    let tweetSplit = data.split(" ");
    for (j = 0; j < tweetSplit.length; j++) {
      let word = map.get(tweetSplit[j]);
      if (word != undefined) {
        code == 1 ? (tweetSplit[j] = word) : tweetSplit[j]="";
      }
    }
    for (kata of tweetSplit) {
      resultWord = `${resultWord} ${kata}`;
    }

    if (code == 1){
      resultWord = removeExcesSpace(resultWord.trim());
     }else{
      
        resultWord = removeExcesSpace(resultWord.trim())
     }
     return resultWord;
 
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
  Slang,
  removeOnlyOneCharacter,
  operationSlangAndStopWord1Data,
  replaceNumberToCharacter,
  mappingNumberToCharacter
};
