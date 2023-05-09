
const {Slangword} = require("../../models");

module.exports={
        slangwordrepo(text){
          return  Slangword.findOne({
                  where:{
                        tidakbaku:text
                  },
                  attributes:['katabaku']
            });
      }
}