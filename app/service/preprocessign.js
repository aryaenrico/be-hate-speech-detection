const repository = require ('../repository/preprocessing');

module.exports={
     async slangwordService(){
             return repository.slangwordrepo();
      },

      async stopwordService(text){
            return repository.stopwordrepo();
     }
}