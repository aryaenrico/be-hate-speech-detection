const preprocessing = require('./utils/utils');
const {Slangword} = require("./models");
const{WordSlang} =require("./pojo/slangword");


const lineReader = require('line-reader');
  

      let slangword=[];
      lineReader.eachLine('./slangword.txt', (line, last) => {
            let slangArray =line.split(":");
            Slangword.create(new WordSlang(slangArray[0],slangArray[1]));
        });
        console.info(slangword);
       


// Slangword.bulkCreate(slangworldData).then(()=>{
//       console.log("success");
// })
