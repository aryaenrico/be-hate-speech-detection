const {Dataset} = require("../../models");


module.exports={
   async addData(dataset){
      return Dataset.create(dataset);
   } ,
   
   async getCountData(){
      const Sequelize = require('sequelize');
      const sequelize = new Sequelize('hate_speech_development', 'root', '', {
         host: 'localhost',
         dialect: 'mysql',
       });
      return Dataset.findAll({
         attributes: ['klasifikasi', [sequelize.fn('COUNT', sequelize.col('id')), 'jumlah']],
         group: 'klasifikasi',
       }) 
   }
}