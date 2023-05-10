
const {Slangword} = require("../../models");
const {Stopword} = require("../../models");
module.exports={
        slangwordrepo(text){
          return  Slangword.findOne({
                  where:{
                        tidakbaku:text
                  },
                  attributes:['katabaku']
            });
      },

      stopwordrepo(text){
            return  Stopword.findOne({
                    where:{
                          kata:text
                    }
              });
        }
}