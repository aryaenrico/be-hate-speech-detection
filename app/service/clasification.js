
const repository = require('../repository/clasification');
module.exports={
          async getData(){
                    return repository.getData();
          }          
}