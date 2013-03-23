# Butter 
### A [tf-idf](http://en.wikipedia.org/wiki/Tf*idf) JavaScript library

[![Butter](https://raw.github.com/spatzle/butter/master/butter.jpg)]()

### Purpose

This is a javascript library that can be used for finding out (the most frequently used words on a webpage using tf-idf).   It was initially made for recognizing cooking ingredients from recipes web sites, please modify for use in other domains.


### Requirements

* jquery https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
* underscoreJS http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.3.3/underscore-min.js 


### Thanks

* ported from [my python tf-idf library](https://github.com/spatzle/tf-idf) which was extended from [TimTrueman's](https://github.com/timtrueman/tf-idf) but w/ the addition of [nltk](http://nltk.org/)
* stemmer - http://qaa.ath.cx/porter_js_demo.html
* sorting an object - http://wolfram.kriesing.de/blog/index.php/2008/javascript-sort-object-by-a-value
* stopwords library - http://tedserbinski.com/files/stopwords.js.txt with extensions for cooking recipe words
* fast dictionary look up js - http://stevehanov.ca/blog/index.php?id=120

Add this to the head section your webpage (change the library paths acorddingly), to see how it works

### To Test this

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
        $(function() {
          var corpus = "";
          // if($('li.ingredient.type').length>0){
          //  alert(getTextNodesIn('.ingredient.type').text());
          // }
          if($('li.ingredient').length>0){ // here use recipes microformats
            var items = getTextNodesIn('li.ingredient').text()
            alert(items);
          }
          else{ // don't use recipes microformat, scan the whole text
            corpus  = getTextNodesIn('div').text();
            alert(analyze_web_text(corpus));
          }
      });
      </script>

### TODO

* create a GreaseMonkey / Chrome Extension

### resources

* [food ingredients dictionary](http://www.gourmetsleuth.com/Dictionary.aspx)

#### more info about recipes
This library doens't need to make use of recipes microformat to work, but if you would like more info
[Recipes Microformat](http://microformats.org/wiki/hrecipe)

### Licence
[MIT](http://joyce.mit-license.org/)

### changelog
2013-03-01  Joyce Chan  <joyce.sz.chan at gmail.com>

* initial release
