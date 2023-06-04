const {Dataset} = require("../../models");


module.exports={
   async addData(dataset){
      return Dataset.create(dataset);
   }                 
}