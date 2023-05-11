
const {Slangword} = require("../../models");
const {Stopword} = require("../../models");
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
        }
}