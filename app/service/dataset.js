const repository = require("../repository/dataset");


module.exports={
     async addDataset(dataset){
        return repository.addData(dataset);
     },
     async getCountdata(){
      return repository.getCountData();
     }               
}