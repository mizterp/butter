
var fulltrim=function(wd){return wd.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,'').replace(/\s+/g,' ');}

var tokenize= function(str){
  tokens= fulltrim(str).split(/(\w+|\!|\'|\"")/i);
  tokens2 =_.filter(tokens, function(wd){ 
    return (wd != "" && wd!=" "); 
  });
  return tokens2;
}