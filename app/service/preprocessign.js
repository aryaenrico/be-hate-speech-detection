const repository = require ('../repository/preprocessing');

module.exports={
     async slangwordService(text){
             return repository.slangwordrepo(text);
      },

      async stopwordService(text){
            return repository.stopwordrepo(text);
     }
}