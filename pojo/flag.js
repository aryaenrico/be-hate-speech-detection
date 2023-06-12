class FlagOperation{
    static cache = false;
    static mapSlangword = new Map() ;
    static mapStemming = new Map() ;
    static mapStopword = new Map();
    static mapPositif = new Map();
    static mapPenghinaan = new Map();
    static mapProvokasi = new Map();
    static mapAncamanKekerasan = new Map(); 
    
    static tfPositif ;
    static tfAncamanKekerasan;
    static tfProvokasi; 
    static tfPenghinaan;
    static tfDataset;

    static idfDataset;
    static idfPositif ;
    static idfAncamanKekerasan; 
    static idfProvokasi;
    static idfPenghinaan;
    static idfDataset;   
    static bag_of_word;  
    static wPositif;
    static wPenghinaan;
    static wAncamanKekerasan;
    static wProvokasi;  

    static sumPositif;
    static sumPenghinaan;
    static sumAncamanKekerasan;
    static sumProvokasi;  
    static weight=[0,0,0,0,0]; 
    
    static feature=[];
    static  probPositif;
    static probPenghinaan;
    static probAncamanKekerasan;
     static probProvokasi;
}
module.exports={FlagOperation};