const preprocessing = require('./utils/utils');
const {Slangword} = require("./models");
const {Stopword} = require("./models");
const{WordSlang} =require("./pojo/slangword");
const {WordStop} = require("./pojo/stopwords");


const lineReader = require('line-reader');
  

      let slangword=[];
     lineReader.eachLine('./pujangga_slang_word.txt', (line, last) => {
            let arr_temp = line.split(":");
            Slangword.create(new WordSlang(arr_temp[0],arr_temp[1]));
     
        });
     
       


// Slangword.bulkCreate(slangword).then(()=>{
//       console.log("success");
// })
