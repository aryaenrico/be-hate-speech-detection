const {slangwordrepo} = require ('../repository/preprocessing');

module.exports={
     async slangwordService(text){
             return slangwordrepo(text)
      }
}