class FlagOperation{
    static cache = false;
    static mapSlangword = new Map() ;
    static mapStemming = new Map() ;
    static mapStopword = new Map();
    static mapPositif = new Map();
    static mapPenghinaan = new Map();
    static mapProvokasi = new Map();

    
    static tfPositif ;
    static tfProvokasi; 
    static tfPenghinaan;
    static tfDataset;

    static idfDataset;
    static idfPositif ; 
    static idfProvokasi;
    static idfPenghinaan;
    static idfDataset;   
    static bag_of_word;  
    static wPositif;
    static wPenghinaan;
    static wProvokasi;  

    static sumPositif;
    static sumPenghinaan;
    static sumProvokasi;  
    static weight=[0,0,0,0]; 
    
    static feature=[];
    static  probPositif;
    static probPenghinaan;
     static probProvokasi;
}
module.exports={FlagOperation};