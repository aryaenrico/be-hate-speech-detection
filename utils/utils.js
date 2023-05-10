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
  return text.replace((/\s{2,}/g, " "));
}

function removeMention(text) {
  return text.replace(/[@]{1}(.*?) /g, "");
}
function removeLink(text) {
  return text.replace(/(https:\/\/){1}(.*?) /g, "");
}

function removeLineBreak(text) {
  return text.replace(/(\r\n|\n|\r)/gm, "");
}

function removePunctuation(text) {
  return text.replace(/[.,\/#!$%\^&\*;:{}=_`~()?'"\[\]]/g, "");
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
  return new Dataset(tanggal, removePunctuation(result), klasifikasi);
}

async function operationSlangAndStopWord(data, operation, code) {
  let arrayWord = [];
  for (i = 0; i < data.length; i++) {
    let resultWord = "";
    let tweetSplit = splitTweet(data[i]);
    for (j = 0; j < tweetSplit.length; j++) {
      let word = await operation(tweetSplit[j]);
      if (word != undefined) {
        code == 1
          ? (tweetSplit[j] = word.dataValues.katabaku)
          : tweetSplit.splice(j, 1);
      }
    }
    for (kata of tweetSplit) {
      resultWord = `${resultWord} ${kata}`;
    }

    arrayWord.push(
      new Dataset(data[i].tanggal, resultWord.trim(), data[i].klasifikasi)
    );
  }
  return arrayWord;
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
};
