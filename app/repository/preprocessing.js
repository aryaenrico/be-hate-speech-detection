
const {Slangword,Stopword,stemming} = require("../../models");

module.exports={
        slangwordrepo(){
          return  Slangword.findAll({
                  attributes:['tidakbaku','katabaku']
            });
      },

      stopwordrepo(){
            return  Stopword.findAll({
                  attributes:['kata']
              });
        },

        stemmingRepo(){
            return stemming.findAll({
                  attributes:['kata_imbuhan','kata_dasar']
            })
        }
}