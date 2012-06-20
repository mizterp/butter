
var wordCount = function(document) {
  return document.split(" ").length;
};

var freq = function(word,document){
  lst = document.split(" ");
  return _.filter(lst, function(wd){ return wd == word; }).length;
};

var numDocsContaining = function(word,documentList){
  return _.filter(documentList, function(doc){ return freq(word,doc) > 0; }).length;
};

var tf = function(word,document){
  return freq(word,document)/parseFloat(wordCount(document));
} ;

var idf = function(word,documentList){
  word_in_doc = parseFloat(numDocsContaining(word,documentList));
  if (word_in_doc > 0){
    return Math.log(documentList.length/word_in_doc);
  }return 0;
} ;

var tfidf = function(word,document,documentList){
  return (tf(word, document) * idf(word, documentList));
};