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

function removeMention(text){
      return text.replace(/[@]{1}(.*?) /g , '');
}
function removeLink(text){

      return text.replace(/(https:\/\/){1}(.*?) /g,'')

}

function removeLineBreak(text){
      return text.replace(/(\r\n|\n|\r)/gm, "");
}

function mappingArray(data,operation){
      let result =[];
      for (i = 0; i < data.length; i++) {
           result.push(operation(data[i])); 
      }
      return result;
}

function operationLower({tanggal,tweet,klasifikasi}){
      let tempTweet =removeLineBreak(tweet);
      return new Dataset(tanggal,caseFolding(tempTweet),klasifikasi);

}

function operationMention({tanggal,tweet,klasifikasi}){
      let tempTweet =`${tweet} `;
      let resultTweet = removeMention(tempTweet);
      return new Dataset(tanggal,removeLink(resultTweet),klasifikasi);

}

module.exports ={caseFolding,parseDate,removeMention,removeLineBreak,removeLink,parseDate2,mappingArray,operationLower,operationMention}