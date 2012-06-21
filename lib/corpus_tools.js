
var accentsTidy = function(s){
        var r=s.toLowerCase();
        r = r.replace(new RegExp("\\s", 'g'),"");
        r = r.replace(new RegExp("[àáâãäå]", 'g'),"a");
        r = r.replace(new RegExp("æ", 'g'),"ae");
        r = r.replace(new RegExp("ç", 'g'),"c");
        r = r.replace(new RegExp("[èéêë]", 'g'),"e");
        r = r.replace(new RegExp("[ìíîï]", 'g'),"i");
        r = r.replace(new RegExp("ñ", 'g'),"n");                            
        r = r.replace(new RegExp("[òóôõö]", 'g'),"o");
        r = r.replace(new RegExp("œ", 'g'),"oe");
        r = r.replace(new RegExp("[ùúûü]", 'g'),"u");
        r = r.replace(new RegExp("[ýÿ]", 'g'),"y");
        r = r.replace(new RegExp("\\W", 'g'),"");
        return r;
};


var prepare_doc = function(document_string){

  	// tokenize
	tokens = tokenize(document_string.toLowerCase().replace( /[^a-z]/, " "));

	// remove numbers & stem 
        tokens = _.map(tokens, function(wd){ return stemmer(accentsTidy(wd).replace(/\d+/g, '')); });

        // remove words that are too long
	tokens = _.filter(tokens, function(wd){ return wd.length<10; });

	// remove stop words
	tokens = removeStopWords(tokens);
	return tokens;
};

var prepare_docs = function(docs){
	prepped= _.map(docs, function(doc){return prepare_doc(doc) });
	return prepped;
}

var prepare_corpus = function(str){
	// split into sentences
	splitted_by_sentence = str.split(/[.|!|?]\s/gi);
	return splitted_by_sentence;
}


