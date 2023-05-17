class DatasetData{
  constructor(tanggal,data_asli,data_case_folding,data_remove_mention_ling,data_slangword,data_stemming,data_stopword,klasifikasi){
     this.tanggal =tanggal;
     this.data_asli =data_asli;
     this.data_case_folding = data_case_folding;
     this.data_slangword =data_slangword;
     this.data_stemming =data_stemming;
     this.data_remove_mention_ling =data_remove_mention_ling;
     this.data_stopword =data_stopword;
     this.klasifikasi =klasifikasi;               
  }
}
module.exports =DatasetData;