
var wordCount = function(document) {
  return document.split(" ").length;
};

var freq = function(word,document){
  lst = document.split(" ");
  return _.filter(lst, function(wd){ return wd == word; }).length;
}