const preprocessing = require('./utils/utils');
const {Slangword} = require("./models");
const {Stopword} = require("./models");
const{WordSlang} =require("./pojo/slangword");
const {WordStop} = require("./pojo/stopwords");


const lineReader = require('line-reader');
  

      let slangword=[];
      lineReader.eachLine('./stopword.txt', (line, last) => {
            Stopword.create(new WordStop(line));
        });
     
       


// Slangword.bulkCreate(slangworldData).then(()=>{
//       console.log("success");
// })
