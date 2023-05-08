function caseFolding(text) {
      let temp = removeLineBreak(text);
      return temp.toLowerCase();
      
}

function parseDate(text) {
      return typeof text;
}

function removeMention(text){
      return text.replace(/[@]{1}(.*?) /g , '');
}
function removeLink(text){

      return text.replace(/(https:\/\/){1}(.*?) /g,'')

}

function removeLineBreak(text){
      return text.replace(/(\r\n|\n|\r)/gm, "");
}

module.exports ={caseFolding,parseDate,removeMention,removeLineBreak,removeLink}