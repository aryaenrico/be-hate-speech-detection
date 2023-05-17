const { Dataset } = require("../../models");

module.exports = {
  async getData() {
    return Dataset.findAll({
      attributes: ["data_stopword", "klasifikasi"],
    });
  },
};
