# [tf-idf](http://en.wikipedia.org/wiki/Tf*idf) in JavaScript

This is useful for looking at the top (most frequent words on a webpage)

This library has optimized for cooking recipes sites. 


## Requirements

* jquery https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
* underscoreJS http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.3.3/underscore-min.js 


## Thanks

* ported from [my python tf-idf library](https://github.com/spatzle/tf-idf) which was extended from [TimTrueman's](https://github.com/timtrueman/tf-idf) w/ the addition of [nltk](http://nltk.org/)
* stemmer - http://qaa.ath.cx/porter_js_demo.html
* sorting an object - http://wolfram.kriesing.de/blog/index.php/2008/javascript-sort-object-by-a-value
* stopwords library - http://tedserbinski.com/files/stopwords.js.txt with extensions for cooking recipe words

Add this to the head section your webpage (change the library paths acorddingly), to see how it works

	<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script>
  	<script src="http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.3.3/underscore-min.js"></script>
  	<script src="../lib/stopwords.js"></script>
  	<script src="../lib/tfidf.js"></script>
  	<script src="../lib/tokenize.js"></script>
  	<script src="../lib/corpus_tools.js"></script>
  	<script src="../lib/collections_tools.js"></script>
  	<script src="../lib/stemmer-min.js"></script>
  	<script src="../test_data/test_data.js"></script>
  	<script>
    	var analyze_web_text = function(corpus){
        tfidfs = tfidf_corpus(prepare_docs(prepare_corpus(corpus)));
        s = sortObj(tfidfs);
        return s;
    	}
  		$(function() {
        	var corpus  = document.title+". "+$('#ingredients').text()+". "+$('#preparation').text()+". "+$('body p').text()+". "+$('#nutritional_information').text();
        	alert(analyze_web_text(corpus));
    	});
  </script>

## BUG
* I think the tfidf_corpus function in tfidf.js is wrong, it should be all the tfs of a word wrt to a doc squared, and then take all the docs, sum them & sqrt them... in construction!

## TODO

* wholly inadequate testing :'(
* create a GreaseMonkey / Chrome Extension