if (typeof CN === 'undefined' || !CN) {
    var CN = {};
}

CN.ad = CN.ad || {};


CN.ad.recipeUtils=(function($At,$J,$CND){
    var ret = false,
        fromCookie=false,
    
        setDartZoneCookie   = function(){
            $At.setTopic();
            $CND.info(name + ' cookie saved',[ret])

            return true;
        },
        
        getDartZoneCookie   = function(key){
            var cook=$At.getTopic();
            if(!cook){return false;}
            if(key==='kws'){key='ad'}
            if(key && cook[key]){ return cook[key]}
            return cook;
        },
        
        adsFollowFor        = function(options){
            $J(options.node.replace(/^#|#/,'#') + ' a')
                .bind('click',function(){
                    if(this.href && this.href.match(options.urlMatcher)){
                        setDartZoneCookie()
                    }
                });
        },
        
        plugin              = function(){

            var pname="CN Ad Epi Recipe Plugin";
            fromCookie=getDartZoneCookie();
            
            if(location.pathname.indexOf('/recipesmenus/desserts')!==-1){
                setDartZoneCookie();
                $CND.info(pname + ' action :: cookie saved',[getDartZoneCookie()])
            }
            if(CN.dart.get('zone')==='recipeDetail' && fromCookie && fromCookie.zone==='rm.dessert.recipe'){
                ret ={zone:fromCookie.zone};
                $CND.info(pname + ' zone set from cookie',[ret])
            }
            
            return {
                init    : init() ? init : false,
                name    : pname
            }
        },
        
        init                = function(){
            return ret || fromCookie;
        };
            
    
    return {
        setDartZoneCookie   : setDartZoneCookie,
        getDartZoneCookie   : getDartZoneCookie,
        adsFollowFor        : adsFollowFor,
        plugin              : plugin
    }

})(CN.ad.topics,jQuery,CN.debug);


CN.ad.searchKws = {
    
    init    : function() {
    
        var stopwords=/(?:^|\+)(?:NOT\+\w+|OR|AND|A|AN|WITH|ON|THE)(?:$|\+)/gi,
            query=CN.url.params() || false,
            scrub="",
            param,
            
            cleaner = function(){
                var kws=CN.dart.get('ad').kws;
                
                kws= kws ? kws.join(';').replace(/\&|=/g,';').split(';') : [];

                return jQuery.map(kws, function(v,i){
                    return jQuery.inArray(v,scrub) ===-1 ? v : null;

                })
            };
        
        if(query){
            for(var q in query){
                scrub+= q + "= ";
                param=query[q].match(stopwords);
                scrub+= param ? CN.utils.trim(param.join('+').replace(/\++/g,' ')) : '';
            }
            scrub=scrub.split(' ');
        }
        
        
        return { 
            ad  : {
            
                kws : cleaner()
            }
        }
    
    },
    
    name    : "CN Ad Epi Search Kw Cleaner"

};


CN.dart.register([CN.ad.searchKws,CN.ad.recipeUtils.plugin()])


/*  Legacy recipe utils  can be removed after testing */
function addSearchKeywords(adTargetingParameters)
{
	targetingParams = adTargetingParameters || null;

	if(isFromSearchResults(targetingParams))
	{
		searchKeywords = parseSearchKeywords() || '';
		targetingParams = searchKeywords + targetingParams;
                
                //add kw parameters indicating the type of search.
                searchTypeParams = getSearchTypeParams();                
                targetingParams = targetingParams + searchTypeParams;
	}
        
    //eliminate duplicates
    
    targetingParams = eliminateDuplicates(targetingParams);
    targetingParams = targetingParams.replace(/['"]+/g, "");
        
	return targetingParams;
}

function setDartZoneCookie(dartZone, keywords){
	var cookieValues = [];
	if (dartZone) {
		cookieValues.push("dartZone:" + dartZone);
	}
	if (keywords) {
		cookieValues.push("keywords:" + keywords);
	}
    setCookie("dartZoneCookie", cookieValues.join("<&>"), true, "", "/", "", false);
}

function getDartZoneCookie(key){
	var cookieValue = getCookie('dartZoneCookie');
	if (cookieValue) {
		var cookieValues = cookieValue.split("<&>");
		var returnValue = {};
		for (var i = 0; i < cookieValues.length; i++) {
			var valueParts = cookieValues[i].split(":");
			var keyPart = valueParts.shift();
			var valuePart = valueParts.join(":");
			if (key) {
				if (key == keyPart) {
					return valuePart;
				}
			} else {
				returnValue[keyPart] = valuePart;
			}
		}
		
		return key ? null : returnValue;
	} else {
		return null;
	}
}

function deleteDartZoneCookie(){
    deleteCookie('dartZoneCookie', "/", "");
}

function adsFollowFor(options) {
	var links = findLinks(options.node, options.urlMatcher);
	for (var i = 0; i < links.length; i++) {
		Event.observe(links[i], "click", 
				function() { setDartZoneCookie(options.dartZone, options.keywords); });
	}
}

function findLinks(node, urlMatcher) {
	var node = $(node);
	var foundLinks = [];
	if (node) {
		for (var i = 0; i < node.childNodes.length; i++) {
			var child = node.childNodes[i];
			if (child.nodeType == 1) {
				if (child.nodeName == "A") {
					if (child.href && child.href.match(urlMatcher)) {
						foundLinks.push(node.childNodes[i]);
					}
				} else {
					foundLinks = foundLinks.concat(findLinks(child, urlMatcher));
				}
			}
		}
	}
	return foundLinks;
}

function eliminateDuplicates(parameterString) {
    cleanedString = '';
    
    paramArray = parameterString.split(';');    
    for(i=0; i<paramArray.length; i++) {
        candidateParam = paramArray[i].toLowerCase();
        duplicate = false;
        for(p= i + 1; p<paramArray.length; p++) {
            if(paramArray[p].toLowerCase() == candidateParam) {
                duplicate = true;
                break;
            }
        }
        if(!duplicate && paramArray[i] != '') {
            cleanedString = cleanedString + paramArray[i] + ';';
        }
    }
    
    return cleanedString;
}

function getSearchTypeParams() {
        searchType = null;
        returnParams = '';
        
    	searchURL = getCookie('BackToSearch') || null;        
	if(!searchURL || searchURL.indexOf('?') == -1) return '';
        querystring = searchURL.substr(searchURL.indexOf('?')+1, searchURL.length-1);
        
        re = /type=(.*)/;
        reqAttrArray = querystring.split('&');
	for(i=0; i<reqAttrArray.length; i++) {
            if(reqAttrArray[i].match(re)) {
                keyValuePair = reqAttrArray[i].split('=');
                searchType = keyValuePair[1];
            }
        }        
        
        //add another kw for browsing.
        if (searchType == 'browse') {
            returnParams = 'kw=browse;';
        } 
        
        return returnParams;
}

function parseSearchKeywords()
{	
        searchURL = getCookie('BackToSearch') || null;
        
	if(!searchURL || searchURL.indexOf('?') == -1) return null;
	
	querystring = searchURL.substr(searchURL.indexOf('?')+1, searchURL.length-1).replace(/ /, '+');
	reqAttrArray = querystring.split('&');
	keywordArray = [];
	re = /^search2?=(.*)/;
        re2 = /extra=(.*)/;        
	allKeywords = null;
	
	for(i=0;i<reqAttrArray.length;i++)
	{
		if(reqAttrArray[i].match(re))
		{			
                        keywds = reqAttrArray[i].replace(re, '$1');
			keywordArray = keywds.split('+');
			if(keywordArray.length == 0) return null;
			
			keywds = 'kw=' + keywds + ';';
			if(keywordArray.length > 1)
			{
				skip = false;
				
				for(p=0;p<keywordArray.length;p++)
				{
					keywordValue = keywordArray[p];
					
					//Stop word logic. If the stop word is NOT skip the stop
					//word as well as the keyword after it. All other stop words
					//just skip the stop word.
					
					if(keywordValue.toUpperCase() == 'NOT'){
						skip=true;
					}
					else if(!skip && !isStopWord(keywordValue)){						
						keywds += 'kw=' + keywordValue + ';';	
					}else{
						skip = false;
					}
				}
			}
			//return keywds;
                        //add them.
			if(allKeywords == null) {
                            allKeywords = keywds;
                        } else {
                            allKeywords = allKeywords + keywds;
                        }                        
		} else if (reqAttrArray[i].match(re2)) {                    
                    keywds = reqAttrArray[i].replace(re2, '$1');
                    extraKeywords = '';
                    
                    keywordArray = keywds.split('|');
                    if(keywordArray.length == 0) return null;			
                    //loop through the thing and add a kw= for each
                    for(q=0;q<keywordArray.length;q++)
                    {
                        extraKeywords += 'kw=' + keywordArray[q] + ';';
                    }
                    
                    //add them.
                    if(allKeywords == null) {
                        allKeywords = extraKeywords;
                    } else {
                        allKeywords = allKeywords + extraKeywords;
                    }
                }
	}
        return allKeywords;
}

function isStopWord(keywordValue)
{
    stopwords = new Array("NOT","OR","AND","A","AN","WITH","ON","THE");

    for(x=0;x<stopwords.length;x++)
    {
    	if(keywordValue.toUpperCase() == stopwords[x]){
    	  return true;
    	}
    }

    return false;
}


function isFromSearchResults(adTargetingParameters) {
	searchRecipeID = getCookie('SearchRecipeID') || null;        
	re = /rid=([0-9]+).*/;
        
	if(adTargetingParameters && adTargetingParameters.match(re))
	{
                //pageRecipeId = paramSequence.replace(re, '$1');
		pageRecipeId = adTargetingParameters.match(re)[1];
		return pageRecipeId > 0 && pageRecipeId == searchRecipeID;
	}
	return false;
}

//determines whether the given element contains a single 1px image
function contains1pxImage(imageContainerElemName) {
    var imageContainerElem = document.getElementById(imageContainerElemName);
    if (imageContainerElem)
    {
        var imageElem = imageContainerElem.getElementsByTagName('img');
        if (imageElem) 
        {
            return (imageElem.length == 1 && imageElem[0].width == 1 && imageElem[0].height == 1);
        } 
    }
    return false;
}

