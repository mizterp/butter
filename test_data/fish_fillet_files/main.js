// Setup Epi Namespace
if (typeof Epi === "undefined" || !Epi) {
    var Epi = {};
}


/* Dart Site modifier class for iPad ua detection.
 * Appends the suffic '.ipad' to the dart site for ipad
 * specific targeting.
 */
var dartSiteModifier = (function(ua){
    var suff="",
        pat=/.*\.[\w\.]+\/.*/;

    //If browser is iPad based, add the iPad specific dart string.
    if (ua.indexOf('ipad')!==-1){
            suff ='.ipad';
    }

    return {
        setSite : function(dartCall){
            return dartCall.match(pat)[0].split('/').join(suff+'/');
        }
    }
 })(navigator.userAgent.toLowerCase());


/*  esmiling 2007619 
    Function:   runOnLoad(f)
    Purpose:    Portable event registration for onload event handlers
    Usage:      Send functions which need to be attached to the document onload event to this function as a parameter:
    Example:    runOnLoad(yourFunction);
*/
function runOnLoad(f){
    if(runOnLoad.loaded) f();
    else runOnLoad.funcs.push(f);
}
runOnLoad.funcs = [];
runOnLoad.loaded = false;

runOnLoad.run = function() {
    if (runOnLoad.loaded) return;
    
    for(var i = 0; i < runOnLoad.funcs.length; i++){
        try{runOnLoad.funcs[i]();}
        catch(e) {}
    }
        
    runOnLoad.loaded = true;
    delete runOnLoad.funcs;
    delete runOnLoad.run;
};

if(window.addEventListener)
    window.addEventListener("load", runOnLoad.run, false);
else if (window.attachEvent) 
    window.attachEvent("onload", runOnLoad.run);
else window.onload = runOnLoad.run;
/* END portable event registration for onload event handlers */

/* browser detection and setup */
/*  esmiling    20070802 
    Support:    FFX (MAC/PC), Safari, IE6, IE7, IE8 */

function detectMacXFF() {
    var userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.indexOf('mac') != -1 && userAgent.indexOf('firefox')!=-1) {return true;}
    return false;
}

function getBrowser(obj) {
    var browser=new Array("unknown", "unknown", "unknown", "unknown");
    (isEmpty(obj) ? brs=navigator.userAgent.toLowerCase() : brs=obj);
    if (brs.search(/msie\s(\d+(\.?\d)*)/) != -1) {
        browser[0]="msie";
        browser[1]=getMSIEVersion();
        browser[2]="msie";
        browser[3]=browser[1];
    } 
    else if (brs.search(/safari\/(\d)*/) != -1) {
        browser[0]="safari";
        browser[1]=brs.match(/safari\/(\d+(\.?\d*)*)/)[1];
        browser[2]="khtml";
        browser[3]=brs.match(/applewebkit\/(\d+(\.?\d*)*)/)[1];
    } 
    else if (brs.search(/firefox[\/\s](\d+([\.-]\d)*)/) != -1) {
        browser[0]="firefox";
        browser[1]=brs.match(/firefox[\/\s](\d+([\.-]\d)*)/)[1];
        browser[2]="gecko";
        browser[3]=getGeckoVersion();
    }
    return browser;
}
function getMajorVersion(v) {return (isEmpty(v) ? -1 : (hasDot(v) ? v : v.match(/(\d*)(\.\d*)*/)[1]))}
function getMinorVersion(v) {return (!isEmpty(v) ? (!hasDot(v) ? v.match(/\.(\d*([-\.]\d*)*)/)[1] : 0) : -1)}
function getMSIEVersion() {return brs.match(/msie\s(\d+(\.?\d)*)/)[1];}
function getGeckoVersion() {return brs.match(/gecko\/([0-9]+)/)[1];}
function getFullUAString(obj) {(isEmpty(obj) ? brs=navigator.userAgent.toLowerCase() : brs=obj);return brs;}
function isEmpty(input) {return (input==null || input =="")}
function hasDot(input) {return (input.search(/\./) == -1)}

// getAgent(): returns user agent as a string
function getAgent(){
    var br=new Array(4);
    br=getBrowser();    
    switch(br[0]){
        case "firefox":
            var nameversion = (detectMacXFF())? 'mac_ffx' : 'ffx';
            if(getMajorVersion(br[1]) == 3) nameversion += '3';
            return nameversion;
            break;    
        case "safari":
            return 'safari';
            break;
        case "msie":
            if( getMajorVersion(br[1]) == '6') return 'ie6';
            if( getMajorVersion(br[1]) == '7') return 'ie7';
            if( getMajorVersion(br[1]) == '8') return 'ie8';
            break;    
    }
}

// browser specific stylesheet includes
Epi.users_browser = getAgent();
var hostOverrideToUse = "";
if (typeof hostOverride == "string") {
    hostOverrideToUse = hostOverride;
}
switch(Epi.users_browser){
    case "mac_ffx":
       jQuery('head').append('<link rel="stylesheet" type="text/css" media="screen, print" href="' + hostOverrideToUse + '/styles/legacy/mac_firefox.css" />');
       break; 
           
    case "mac_ffx3":       
       jQuery('head').append('<link rel="stylesheet" type="text/css" media="screen, print" href="' + hostOverrideToUse + '/styles/legacy/mac_firefox.css" />');
       jQuery('head').append('<link rel="stylesheet" type="text/css" media="screen" href="' + hostOverrideToUse + '/styles/legacy/firefox3.css" />');   
       break;
        
    case "ffx":
       jQuery('head').append('<link rel="stylesheet" type="text/css" media="screen" href="' + hostOverrideToUse + '/styles/legacy/firefox.css" />');
       break;
        
    case "ffx3": 
       jQuery('head').append('<link rel="stylesheet" type="text/css" media="screen" href="' + hostOverrideToUse + '/styles/legacy/firefox3.css" />');
       break;
    
    case "safari":
       jQuery('head').append('<link rel="stylesheet" type="text/css" media="screen, print" href="' + hostOverrideToUse + '/styles/legacy/mac_safari.css" />');
       break;   
              
    case "ie6":
       jQuery('head').append('<link rel="stylesheet" type="text/css" media="screen" href="' + hostOverrideToUse + '/styles/legacy/win_ie6.css" />');
       jQuery('head').append('<SCR'+'ipt type="text/javascript" language="Javascript 1.5" src="' + hostOverrideToUse + '/rd_scripts/backgroundImageCaching.js"></SCR'+'ipt>');
       break;
        
    case "ie7":
       jQuery('head').append('<link rel="stylesheet" type="text/css" media="screen" href="' + hostOverrideToUse + '/styles/legacy/win_ie7.css" />');
       break;
       
    case "ie8":
       jQuery('head').append('<link rel="stylesheet" type="text/css" media="screen" href="' + hostOverrideToUse + '/styles/legacy/win_ie8.css" />');
       break;   
}


/* social enhancements screen resolution detection and setup */
Epi.screen1024 = "false";

function setUpForSmallerScreen() {

    if (jQuery('#social-toolbar').length) {   
        
        if (jQuery('#social-toolbar').hasClass('fixed')) {
            jQuery('#social-toolbar').removeClass('fixed');
        }   
            
        jQuery('#social-toolbar').addClass('screen1024');
                  
        if (jQuery('#backToSearchResultsText').length) {                                        
            jQuery('#backToSearchResultsText').before(jQuery('#social-toolbar'));
        }
        
        jQuery('#social-toolbar').css('display', 'block'); 
       
        if (jQuery('#print-options').length) {
        
            if (jQuery('#print-options').hasClass('fixed')) {
                jQuery('#print-options').removeClass('fixed');
            }
        
            jQuery('#print-options').addClass('screen1024');
            jQuery('#social-toolbar').append(jQuery('#print-options'));
            jQuery('#print-options').css('display', 'block');
                           
        }
    }
    
    Epi.screen1024 = "true";

}

function setUpForLargerScreen() {

    if (jQuery('#social-toolbar').length) {
        
        if (jQuery('#social-toolbar').hasClass('screen1024')) {
            jQuery('#social-toolbar').removeClass('screen1024');
        }   
        
        if (jQuery('#primary').length) {
        
            jQuery('#primary').after(jQuery('#social-toolbar'));
            jQuery('#social-toolbar').css('display', 'block'); 
                  
        } 
            
        if (jQuery('#print-options').length) {
        
            if (jQuery('#print-options').hasClass('screen1024')) {
                jQuery('#print-options').removeClass('screen1024');
            }
        
            jQuery('#social-toolbar').before(jQuery('#print-options'));
            jQuery('#print-options').css('display', 'block');
            
        }
    }
}

function detectScreenSize() {

    if (jQuery('#social-toolbar').length) {

        if ( Epi.users_browser === "ie7" ) {
            jQuery('#social-toolbar #stb-googleplus').remove();
            jQuery('#social-toolbar #stb-pinit').remove();
        }
    }
    
    if  ( jQuery(window).width() <= 1160 ) {
        setUpForSmallerScreen();
    }
    else {
        setUpForLargerScreen();
    }    
}

runOnLoad(detectScreenSize);

jQuery(window).resize(function() {
    if  ( jQuery(window).width() <= 1160 ) {
        if (Epi.screen1024 === "false" ) {
            setUpForSmallerScreen();
        }    
    }
    else {
        Epi.screen1024 = "false";
        setUpForLargerScreen();
    }
});

/* scrolling */
jQuery(function($){

var printOptions = $( "#print-options" );
var printOptionsHeight = printOptions.height();
var socialToolbar = $( "#social-toolbar" );
var socialToolbarHeight = socialToolbar.height();
var primaryContent = $( "#primary_content" );
var primaryContentTop = primaryContent.offset().top;
var pcBottom = $( "#pc_bottom" );
var pcBottomTop = pcBottom.offset().top;
var viewPort = $( window );

viewPort.bind (

    "scroll",
    
        function() {
        
            if ( Epi.screen1024 === "false" )
            {
                var viewPortTop = viewPort.scrollTop();
                
                if ( (viewPortTop > primaryContentTop) )
                {
                   
                   if ( !printOptions.is( ".fixed" ) )
                        printOptions.addClass( "fixed" );
                    
                   if ( !socialToolbar.is( ".fixed" ) )
                        socialToolbar.addClass( "fixed" );
                    
                } 
                
                else if ( (viewPortTop <= primaryContentTop) )           
                {
                    
                    if ( printOptions.is( ".fixed" ) )
                        printOptions.removeClass( "fixed" );
                    
                    if ( socialToolbar.is( ".fixed" ) )
                        socialToolbar.removeClass( "fixed" );
     
                }
                
                if ( (printOptionsHeight + socialToolbarHeight + viewPortTop)  > pcBottomTop )
                {                      
                    printOptions.css("display", "none");
                    socialToolbar.css("display", "none");
                }
                else
                {
                    printOptions.css("display", "block");
                    socialToolbar.css("display", "block");
                }
            
            } // close if screen1024
        }
    );

    // Omniture call once the user successfully saved the recipes to receipe box
    if(jQuery(".epiRecipe #saved").length === 1) {
        s.events='event36';
        s.tl(this,'o','AjaxCall');
    }
});


function displayEpiAppStorePromo() {
 
    if ( (navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i)) ) {
		var promoNode = document.getElementById("epiAppStorePromo");
		promoNode.className = "appStorePromoVisible";
	}
	
	if ( navigator.userAgent.match(/iPad/i) ) {
		var promoNode = document.getElementById("epiAppStorePromo");
		promoNode.className = "appStoreIpadPromoVisible";
	}
 
}


//check if no ad is being served and hide container div if so
function detectPushdownAd() {
    if (document.getElementById('pushDownAd'))
    {
		var pushDownAd = document.getElementById('pushDownAd');
		
		var pushDownAdHeight = pushDownAd.offsetHeight;
		
		if ( pushDownAdHeight <= 60)
			pushDownAd.style.display = "none";
    }
}

// check for sweepstakes and promotions ad unit and display if needed
function detectPromotionAdUnit() {
    var sweepstakesContainer = document.getElementById('sweepstakes');
    if (sweepstakesContainer) { 
        var sweepstakesContent = document.getElementById('sweepstakes_content');
        var showSweepsAndPromotionsUnit = false;
        if (sweepstakesContent) { 
            var spacers = sweepstakesContent.getElementsByTagName('img'); 
            if (spacers.length > 0) {
                showSweepsAndPromotionsUnit = false;
            } else {
                showSweepsAndPromotionsUnit = true;
            }

            if (showSweepsAndPromotionsUnit) { 
                sweepstakesContainer.style.display = "block";
                var rndng_user_agent = getAgent();
                if (rndng_user_agent == 'ie6') {
                    round(sweepstakesContent);
                    round(sweepstakesContainer);
                } else {
                    reround(sweepstakesContent, true);
                    reround(sweepstakesContainer, true);
                }
            } 
        } 
    } 
}

/* begin common cookie functions.  see http://techweb/javascript_commons/docs/cookies.html for documentation. */
/*
Set cookie value
*/

function setCookie(name, value, escapeValue, expires, path, domain, secure) {
    // alert("test: name="+name+" |value"+value+" |escapeValue="+escapeValue+" |expires="+expires+" |path="+path+" |domain="+domain+" |secure="+secure)
	var cookieToken = name + '=' + ((escapeValue) ?  escape(value) : value) + ((expires) ? '; expires=' + expires.toGMTString() : '') + ((path) ? '; path=' + path : '') + ((domain) ? '; domain=' + domain : '') + ((secure) ? '; secure' : '');
	document.cookie = cookieToken;

}

/*
Get cookie value
*/
function getCookie(name) {
    var allCookies = document.cookie;
	
	var cookieName = name + "=";
	var start = allCookies.indexOf("; " + cookieName);
	
	if (start == -1) {
		start = allCookies.indexOf(cookieName);
		if (start != 0) return null;
	}
	else start += 2;
	
	var end = document.cookie.indexOf(";", start);
	if (end == -1) end = allCookies.length;
	
	return unescape(allCookies.substring(start + cookieName.length, end));
}

/*
Delete a cookie
*/
function deleteCookie(name, path, domain) {
	var value = getCookie(name);
	if (value != null) document.cookie = name + '=' + ((path) ? '; path=' + path : '') + ((domain) ? '; domain=' + domain : '') + '; expires=Thu, 01-Jan-70 00:00:01 GMT';
	return value;
}

/*
Test for cookie support
*/
function verifyCookieSafe() {
	setCookie('pingCookies', 'hello');
	if (getCookie('pingCookies')) return true;
	else return false;
}

/* end common cookie functions. */

// -->

// adList variables
var dartCalls = new Array();
var dartCounter = 0;
var dartSite = '';
var dartZone = '';
var dartKeywords = '';
var statCall = '';



/*  esmiling 2007613 
    Function:   getStyle(htmlElement, some-dash-delimited-css-property)
    Purpose:    returns the computed style/value of a style property for an element
    Usage:      Send your html element or document node to this function as parameter 1, and a css property as parameter 2
    Example:    'getStyle(yourElement, border-top-color)' will return the value of the border-top-color for yourElement
    Support:    IE6, IE7, Safari (mac), Firefox( mac + PC)
*/
function getStyle(element, cssproperty){
    if(element.currentStyle){ 
    	/*internet explorer's alternative to computed styles*/
        try{
            var css2props = element.currentStyle;
            var cssProperty = convertToCamelCase(cssproperty);
            if( cssProperty in css2props ){
                var value = css2props[cssProperty];
                return value;
            }
        }
        catch(e){
            return;
        }
    } 
    else if (window.getComputedStyle){ 
    	/*firefox's syntax for reading computed styles*/
        var css2prop = window.getComputedStyle(element, null);
        var value = css2prop.getPropertyValue(cssproperty);
        if(value != null) return value;
    }
    else{
    	/*safari's syntax for reading computed styles*/
        try{
            var value = document.defaultView.getComputedStyle(element, null).getPropertyValue(cssproperty);
            return value;
        }
        catch(e){
            return;
        }
    }
}
/*end getStyle*/


/*  esmiling 20070613 
    Function:   convertToCamelCase(dash-delmited-text)
    Purpose:    converts a dash delimited string to camelCase. This function is used by getStyle();
    Usage:      Send dash delimited text as a parameter, and its camelCase equivalent will be returned
    Support:    IE6, IE7, Safari (mac), Firefox( mac + PC)
*/
function convertToCamelCase(some_css_property){ 
    var words = some_css_property.split("-");
    var someCssProperty="";
    for(var i=0; i<words.length; i++){someCssProperty += words[i].charAt(0).toUpperCase() + words[i].slice(1);}
    someCssProperty = someCssProperty.charAt(0).toLowerCase() + someCssProperty.slice(1);
    return someCssProperty;
}
/*end convertToCamelCase*/


/*  esmiling 20070802 
    Function:   id(string id)
    Purpose:    convenience method for getting an element by id
    Usage:      Send a string as a parameter, returns the element whose id matches the string
    Support:    All Browsers
*/
function id(x) {
    if(typeof x == "string") return document.getElementById(x);
    return x;
}
/*end id*/


/*  esmiling 20070802 
    Function:   getElements(string classname, string tagname, element root)
    Purpose:    convenience method for getting groups of elements by classname or tagname
    Usage:      Returns all elements which extend the class. Can be refined by using optional tagname and root arguments
    Support:    All Browsers
*/
function getElements(classname, tagname, root){
	if(!root) root = document;
	else if (typeof root == "string") root = document.getElementById(root);
	
	if(!tagname) tagname = "*";
	
	var all = root.getElementsByTagName(tagname);
	
	if(!classname) return all;
	
	var elements = [];
	
	for(var i = 0; i < all.length; i++){
		var element = all[i];
		if(isMember(element,classname))
			elements.push(element)
	}
	return elements;
}

function testElements(classname, tagname, root){
	if(!root) root = document;
	else if (typeof root == "string") root = document.getElementById(root);
	
	if(!tagname) tagname = "*";
	
	var all = root.getElementsByTagName(tagname);
	
    if(!classname) return all;
    
	var result = false;
	
	for(var i = 0; i < all.length; i++){
		var element = all[i];
		if(isMember(element,classname))
		var result = true;	
	}
    return result;
}

function isMember(element, classname){
    var classes = element.className;
    if(!classes) return false;
    if(classes ==classname) return true;
    
    var whitespace = /\s+/;
    if (!whitespace.test(classes)) return false;
    
    var c = classes.split(whitespace);
    for(var i = 0; i < c.length; i++){
        if (c[i] == classname) return true;
    }
    
    return false;
}
/*end getElements*/

/*  esmiling 20070802 
    Function:   listClassifier()
    Purpose:    convenience method for automatically adding an id to the first and last items of an unordered list
    Usage:      Give your ul a classname of 'autoclassed' and an id of 'your choice'. First and last items will be given an id of the following format:
                idOfYourUL_first, idOfYourUL_last 
    Support:    All Browsers
*/
function listClassifier(){
    allLists = document.getElementsByTagName("UL");
    for(var i=0;i<allLists.length;i++){
        if(allLists[i].className == 'autoclassed'){
            allLists[i].getElementsByTagName("LI")[0].id = allLists[i].id + "_first";
            allLists[i].getElementsByTagName("LI")[allLists[i].getElementsByTagName("LI").length-1].id = allLists[i].id + "_last";
        }
    }
}
runOnLoad(listClassifier);
/*end list classifier*/

/*esmiling 20070802
    written specifically for the select form control in the footer. Is used to allow selects to hold urls as values which
    are opened in a new window upon selecting the associated option/value. Can be easily modified for your own uses.
*/
function fslSelect(){
    fsl = document.getElementById('footer_sub_links').getElementsByTagName('SELECT')[0];
    fsl.onchange = fslRedirect;
}
function fslRedirect(){
    if(this.options[this.selectedIndex].value.match(/http.*/)){ 
        window.open(this.options[this.selectedIndex].value)
    }
}
runOnLoad(fslSelect);
/*end footer select*/


/*  esmiling 20070802 
    Object/Method:     SynthEvent.send
    Purpose:    Tool for creating and dispatching/firing synthetic events
    Usage:      Send an element/id, event sub-interface, and event type to this function and it will
                fire a synthetic event which corresponds to the indicated arguments.
    Examples:   SynthEvent.send('yourid', 'MouseEvents', 'click');
                SynthEvent.send('yourid', 'MouseEvents', 'over');
    Support:    All Browsers
*/
var SynthEvent = {};

SynthEvent.send = function(target, subInterface, eventType){
    if (typeof target == "string") target = document.getElementById(target);
    
    if (document.createEvent) {
        var e = document.createEvent(subInterface);
        e.initEvent(eventType, true, false);
    }
    else if (document.createEventObject) {
        var e = document.createEventObject();
    }
    else return;
    
    if (target.dispatchEvent) target.dispatchEvent(e);
    else if (target.fireEvent) target.fireEvent("on"+eventType, e);
};

/*vertically aligns page headlines*/
function headlineAligner(){
    var pctop2 = document.getElementById('pc_top2');
    var headlineArea = document.getElementById('headline');
    if(pctop2 && headlineArea){
        if(pctop2.offsetHeight < 60){
        headlineArea.style.paddingTop = 65 - pctop2.offsetHeight + "px"
        }
    }
}
/* END UTILITY FUNCTIONS */

/* Parses URL Pathname
	Author: Jamie L. Marin, Senior Web Developer
	Date: June 15, 2005
*/

/* Sets varibles for URI pathname and pathname length */
var browserURI = location.pathname;
var uriLength = browserURI.length;

/* Creates Array */
var directories = new Array();

/* Find out indexes of first, next, and last slashes */
var startSlash = browserURI.indexOf('/');
var nextSlash =  browserURI.indexOf('/', startSlash + 1);
var lastSlash = browserURI.lastIndexOf('/');
var slashCount = 0;

/* test for one deep section */ 
if (startSlash == lastSlash)
{
	directories[slashCount] = location.pathname.slice(startSlash + 1);
}


/* Loop to define sections from 1 to N */
while (startSlash != lastSlash || nextSlash != -1)
{
	directories[slashCount] = location.pathname.substring(startSlash + 1,nextSlash);	
	
	if (lastSlash + 1 != uriLength)
		directories[slashCount +1] = browserURI.slice(nextSlash + 1);
		
	startSlash = nextSlash;
	nextSlash =  browserURI.indexOf('/', startSlash + 1);		
	slashCount++;	
}

/* Set User Friendly Variables */
var firstDir = directories[0];
var lastDir = directories[directories.length-1];


/* set Omni-friendly path */
var omniHierarchy = "";
for (var i=0; i<directories.length; i++) {
    omniHierarchy += directories[i];
    if (i != directories.length - 1)
        omniHierarchy += ",";
}

var setProp6 = "";
var setProp7 = "";
var setProp8 = "";
var setProp9 = "";

if (directories[0] == "")
   // setProp6 = "homepage";
if (directories.length >= 1 && directories[0] != "")
    setProp6 = directories[0];
if (directories.length >= 2)
    setProp7 = setProp6 + ':' + directories[1];
if (directories.length >= 3)
    setProp8 = setProp7 + ':' + directories[2];    
if (directories.length >= 4)
    setProp9 = setProp8 + ':' + directories[3];   
/* end of Omniture variables */




function toggleDisplay(targetElem, forceDisplay){
    //forceDisplay is optional to switch the display to a specific value
    targetElem.style.display == "block" ? targetElem.style.display = "none" : targetElem.style.display = "block";
	if(forceDisplay)
		targetElem.style.display = forceDisplay;
}

function toggleDisplayByTagAndClass(parentElem,childTag,childClass){
    childArr = parentElem.getElementsByTagName(childTag);
    for(var i = 0; i < childArr.length; i++)
        if(childArr[i].className == childClass)
            toggleDisplay(childArr[i]);
}


function toggleDisplayById(elemId, forceDisplay){
	//forceDisplay is optional to switch the display to a specific value
    toggleElem = document.getElementById(elemId);
    forceDisplay ? toggleDisplay(toggleElem, forceDisplay) : toggleDisplay(toggleElem); 
}

/* deletes cookie used to override dart zone when going to recipe detail from custom browse */
function deleteDartZoneCookie(){
    deleteCookie('dartZoneCookie', "/", "");
}

/* 
    added by Rpinales Aug. 15th 07
    Function is used from the slideshows popups to refresh parent window and close popup window.
    
*/
function refreshParent(u) {
    //set paretns url
    this.opener.location = u
    // close child window
    this.window.close();
}

function dynamicWrapperByTagAndClass(tagN,classN,wrapperName,numWrappers){
    elemByTagArr = document.getElementsByTagName(tagN);
    for(i = 0; i < elemByTagArr.length; i++){
        if(elemByTagArr[i].className == classN){
            referencedElem = elemByTagArr[i];
            if(numWrappers){
                wrapperArr = new Array();
                for(x = 0; x < numWrappers; x++){
                    wrapperElem = wrapperName + "-" + (x + 1);
                    wrapperArr[x] = document.createElement(wrapperElem);
                    if(x > 0){
                        wrapperArr[x - 1].appendChild(wrapperArr[x]);
                    }
                }
                elemByTagArr[i].parentNode.replaceChild(wrapperArr[0],elemByTagArr[i]);
                wrapperArr[x-1].appendChild(referencedElem);
            }else{
                wrapperElem = document.createElement(wrapperName);
                elemByTagArr[i].parentNode.replaceChild(wrapperElem,elemByTagArr[i]);
                wrapperElem.appendChild(referencedElem);
            }
        }
    }
}

/*  Exit Popup

     removed from main 

end Exit Popup */

/*  Header
    ------ */
    function isDescendant(ancestor, descendant){
        if(!ancestor || !descendant) return false;
        var similarDescendants = ancestor.getElementsByTagName(descendant.nodeName);
        for(var i=0; i<similarDescendants.length; i++)
            if( similarDescendants[i] == descendant ) return true;
        return false;
    }

/*                  *
    cookies check
*                   */

var epiCookies = {
    cookieList:document.cookie,
    noCookiesMsg:'Your browser is not allowing cookies\nSome epicurious.com functionality requires browser cookies.\nPlease add epicurious to your trusted sites list',
    cookieNotSetMsg:'There was a problem setting a cookie\n the cookie : ',
    cookiesAllowed:function(n) {
        if(this.allowed()==true){
            if(n!=''&&n!=null) {
                (this.cookieList.indexOf(n)>-1)?'':this.alertMsg(this.cookieNotSetMsg + n);
            }
        }
    },
    alertMsg:function(msg){
       (msg!='')?alert(msg):'';
    },
    allowed:function(){
        if(this.cookieList==""||this.cookieList==null) {
            cStr = "testCookie=cookiecheck";
            document.cookie = cStr;
            if(document.cookie.indexOf(cStr)==-1) {
                this.alertMsg(this.noCookiesMsg);
                return false;
            }    
        
        }else{
            return true;
        }
    }

}

/*  offermatica script inclussion  Feb 08. */
function includeJS(url) { document.writeln("<script type=\"text/javascript\" src=\"" + url + "\"></script>"); }
var hostOverrideToUse = "";
if (typeof hostOverride == "string") {
	hostOverrideToUse = hostOverride;
}
includeJS(hostOverrideToUse + "/rd_scripts/mbox.js");


/* 
    cookies functionality for remembering if the user wants to see certain layers 
    cookie name : showhidelayers
    cookie values : value1|value2|value3......
    expires in : ?
    should always pass a string to check againts
    can add a value to the cookie
*/

var layerRules = { 
    cookieName:'showhidelayers', 
    cookieValue:'', 
    cookieExpires:new Date(), 
    cookieExpiresOverride:'', 
    addValue:function(v){ 
        
        if(this.cookieExpiresOverride == ''){// no override 
             // standard one Month 
             this.cookieExpires.setMonth(this.cookieExpires.getMonth()+1) 
        } 
        else{ //apply date override 
            switch (this.cookieExpiresOverride){ 
                case 'month': 
                    this.cookieExpires.setMonth(this.cookieExpires.getMonth()+1) 
                break; 
                
                case 'week': 
                    this.cookieExpires.setDate(this.cookieExpires.getDate()+7) 
                break; 
                
                case 'day': 
                    this.cookieExpires.setDate(this.cookieExpires.getDate()+1) 
                break; 
                        
                case 'session': 
                    this.cookieExpires = '' 
                break; 
                
                default : // must be a valid date in THE FUTURE! 
                    this.cookieExpires = this.cookieExpiresOverride; 
                break; 
            } 
        } 
        this.cookieValue=getCookie(this.cookieName); 
        this.cookieValue = (this.cookieValue==''||this.cookieValue==null)?v:(this.cookieValue.indexOf(v)>-1)?this.cookieValue:this.cookieValue+'|'+v;

        setCookie(this.cookieName, this.cookieValue, false, this.cookieExpires, '/', document.domain, false) 
    }, 
    checkAgainstValue:function(v){ 
        return (getCookie(this.cookieName)!=null)?(getCookie(this.cookieName).indexOf(v)>-1):false; 
    }, 
    removeValue:function(v){ }, /* to do ;*/
    ShouldHideLayer:function(v){return this.checkAgainstValue(v)}, 
    hideLayer:function(v,id){this.hide(id);this.addValue(v);}, 
    hide:function(id){$(id).style.display='none';}, 
    showHideLayer:function(v,id){ if(this.ShouldHideLayer(v)){this.hide(id)}} 
}



function variableTabsInit(containerId){
	var tabbedNav = document.getElementById(containerId);
	var tabs = tabbedNav.getElementsByTagName("A");
	for(var i=0; i<tabs.length; i++)
		createTab(tabs[i]);
}
function createTab(tab){
    var rd_tab_header = document.createElement("div");
    rd_tab_header.className = "tab_header";
    var border_span = document.createElement("span");
    border_span.className = "border";
    var inner_stroke_span = document.createElement("span");
    inner_stroke_span.className = "inner_stroke";
    rd_tab_header.appendChild(border_span);
    rd_tab_header.appendChild(inner_stroke_span);
	var userAgent = getAgent();
	if(userAgent == "ie6" || userAgent == "ie7") rd_tab_header.style.width = tab.offsetWidth + "px";
    tab.parentNode.insertBefore(rd_tab_header, tab);
    if(tab.className == "current"){
        rd_tab_header.style.position = "relative";
        rd_tab_header.style.top = getStyle(tab,"top");
        inner_stroke_span.style.backgroundColor = "white";
    }
    border_span.style.backgroundColor = getStyle(tab,"border-top-color");
    tab.style.borderTop = "none";
}

/* this here is for search 2 */
function initSearchDropDown() {
    var lnkList = $('search_section_droplist').getElementsByTagName('A');
    for(var x = 0; x<lnkList.length; x++) {lnkList[x].onclick=setSelection;}
}

var global_activeLnk = '';

function userSearchEntered()
{
    var entered =   ( 
                    document.forms['global_search'].search.value == "" 
                    ||  ( 
                        document.forms['global_search'].search.value.indexOf("search") != -1 
                        && 
                            (
                            document.forms['global_search'].search.value.indexOf("recipes") != -1
                            ||  document.forms['global_search'].search.value.indexOf("epicurious") != -1
                            ||  document.forms['global_search'].search.value.indexOf("articles & guides") != -1
                            ) 
                        )
                    )? false : true;
    return entered;
}

var EpiHeaderSearchForm = {
	setAction: function(selectId) {
		var originalAction = EpiHeaderSearchForm.getOriginalAction(selectId);
		if (selectId=='food') {
			document.forms['global_search'].action = originalAction;
		} else {
			document.forms['global_search'].action = originalAction + "/" + selectId;     
		}
	},
	getOriginalAction: function(selectId) {
		if (typeof EpiHeaderSearchForm.originalAction == "undefined") {
			var action = document.forms['global_search'].action;
			// strip out trailing slash
			action.replace(/\/$/, "");
	 		EpiHeaderSearchForm.originalAction = action;
	 	}
	 	return EpiHeaderSearchForm.originalAction;
	}
}

function setSelection() {
	var sr_txt = "search";
  	global_activeLnk.className = '';
  	EpiHeaderSearchForm.setAction(this.id);
    if(userSearchEntered() == false)
    {
            if(this.id=='members')
            {
                document.forms['global_search'].search.value = "search member recipes";
            }
            else if(this.id=='drinks')
            {
                document.forms['global_search'].search.value = "search drink recipes";
            }
            else
            {
                document.forms['global_search'].search.value = (this.id=='articles')?"search articles & guides":"search "+this.id+" recipes";
            }
    }
   /* document.forms['global_search'].type.value=(this.id!='all')?this.id:'';*/
    global_activeLnk = this;
    global_activeLnk.className = 'active';
    toggleDisplayById('search_section_droplist');
    document.forms['global_search'].search.onclick=clearDefault;
    return false;
}

function clearDefault() 
{
       
    if(userSearchEntered() == false )
        this.value="";
}

/* toggle class on particular element */
function toggleElementClass(e, eClassName) {
	var targetElement = (typeof(e) == 'string')?$(e):e;
    targetElement.className = (targetElement.className.match(eClassName))?targetElement.className.replace(eClassName,''):targetElement.className+' '+eClassName;
   // alert("className " + targetElement.className)

}
function goTo(url){ (url!='')?window.location=url:'';}


/*** Generic functions for use anywhere ***/ 

// Global Items 
var gItems = { 
    pageBody: (document.documentElement)? document.documentElement : document.body // handy for Cross browser issues 
} 

/*   
    Function:       controlBodySelection(onoff) 
    Arguments:      onoff = "on" || "off"
    Purpose:        turns body text selection on or off on the page
    Usage:          useful when draging elements    
    Support:        All Browsers
*/
function controlBodySelection(onoff) //sets whether body text is selectable set to off for a drag event 
{
    if(onoff == 'on') 
        var arrSettings = ['none','on',false]; 
    if(onoff == 'off') 
        var arrSettings = ['','off',true]; 
    (gItems.pageBody)?gItems.pageBody.style.MozUserSelect = arrSettings[0]:gItems.pageBody.style.MozUserSelect = arrSettings[0];
    (gItems.pageBody)?gItems.pageBody.unselectable=arrSettings[1]:gItems.pageBody.unselectable = arrSettings[1]; 
    (gItems.pageBody)?gItems.pageBody.onselectstart = function() {return arrSettings[2];}:gItems.pageBody.onselectstart = function() {return arrSettings[2];};

} 

/*   
    Function:       objTimer(whichObj, iterations, msecs, repeatFunction, finalFunction, args)
    Arguments:      whichObj                =       the objecton the page you want to influence 
                    iterations              =       how many times you want to run the function 
                    msecs                   =       how many milliseconds betwqeen iterations 
                    repeatFunction          =       the specific function you want to run on the internval
                    finalFunction           =       the function you want called when the interval is over
                    args                    =       any misc args you want to pass to the repeatFunction or finalFunction
                       
    
    Purpose:        Runs any function a set number of times (iterations) on an interval of a given time (msecs) then ececutes a final function on the end.
    Usage:          Element fade in and out
    Support:        All Browsers
*/

function objTimer(whichObj, iterations, msecs, repeatFunction, finalFunction, args){ 
    var t //Interval Obj 
    var i = 0; 
    function recurrFn() 
    { 
    i += 1; 
        if(i <= iterations) 
            repeatFunction({'whichObj' : whichObj, 'i' : i, 'iterations' : iterations , 'msecs' : msecs, 'args': [args] });

      else 
      { 
        clearInterval(t); 
        if(finalFunction) 
            finalFunction({'whichObj' : whichObj, 'i' : i, 'iterations' : iterations , 'msecs' : msecs, 'args': [args] })

      } 
    } 
   t = setInterval(recurrFn,msecs); 
} 

/*use with objTimer to fade item in or out */ 
function fadeIn(params) 
{ 
    if(!params.whichObj.filters) 
        { 
        var f = (params.iterations/100) 
                var g = params.whichObj.style.opacity + (params.whichObj.style.opacity  + f); 
                params.whichObj.style.opacity = g 
    } 
        else 
            params.whichObj.filters.alpha.opacity = params.whichObj.filters.alpha.opacity + params.iterations; 

        params.whichObj.style.filter = 'alpha(opacity=' + value*10 + ')'; 
} 

function fadeOut(params) 
{ 
    if(!params.whichObj.filters) 
            params.whichObj.style.opacity = (params.whichObj.style.opacity - ((100/params.iterations)/100)); 
        else 
            params.whichObj.style.filter = 'alpha(opacity=' +(params.whichObj.filters.alpha.opacity -10) + ')'; 
} 

/*makeFloatObj
    appends a generic element to the body with any tag, class and innerHTML
    makeFloatObj
    (
    objType         = element tag "div" "span" etc..
    objId           = id of the element
    objClass        = class of the element
    objInnerHTML    = Text or markup inserted inside the object
    )
*/
function makeFloatObj(objType, objId, objClass, objInnerHTML)
{ 
    if(document.getElementsByTagName("body")[0] && !document.getElementById(objId))
    { 
        var obj = document.createElement(objType); 
        obj.setAttribute('id',objId); 
        obj.className = objClass; // make class abspos_nodisplay to make an element styled as psoition:absolute and display:none  
        obj.innerHTML = objInnerHTML; 
        document.getElementsByTagName("body")[0].appendChild(obj);   
    } 
} 

/*
    getMouseCoords(event)
    returns the x and y mouse coordinates when an event is fired.
*/
function getMouseCoords(event)
{ 
    var e = event || window.event; 
    var xPos = 0; 
    var yPos = 0; 
        
    if(e.pageX || e.pageY)
    { 
        xPos = e.pageX; 
        yPos = e.pageY; 
    } 
    else
    { 
        xPos = e.clientX + gItems.pageBody.scrollLeft - gItems.pageBody.clientLeft, 
        yPos = e.clientY + gItems.pageBody.scrollTop  - gItems.pageBody.clientTop 
    } 
    return{x:xPos,y:yPos} 
} 

/*
    getPagePosition(whatObj) whatObj is the document element you want to find the true x and y position of
    returns the true x and y coodrinates of an element on the page regardless of positioning.
*/
function getPagePosition(whatObj)
{ 
    var xPos = 0; 
    var yPos = 0; 
    if (whatObj.offsetParent)
    { 
        do
        { 
            xPos += whatObj.offsetLeft; 
            yPos += whatObj.offsetTop; 
        } 
        while (whatObj = whatObj.offsetParent);         
    } 
    return{x:xPos,y:yPos} 
} 

function getScrollCoords(event)
{ 
    var xPos = 0;
    var yPos = 0;
    if(window.pageYOffset || window.pageXOffset) 
    {
        xPos = window.pageXOffset; 
        yPos = window.pageYOffset; 
    } 
    else
    { 
        xPos = gItems.pageBody.scrollLeft; 
        yPos = gItems.pageBody.scrollTop; 
    } 
    return{x:xPos,y:yPos} 
}

/*  IE 6 Select box issues functions
    makeIEiframe, makeIEiframe
    add an iframe behind the layered element and remove it from the dom                                                 
*/
function makeIEiframe(whichObj, iframeID) // puts an iframe behind a pop in object. whichObj is the object you want the iframe behind
{
    iframeID = (iframeID == null)? iframeID : "ieiframe";
    var ieiframe = document.createElement("iframe");
    ieiframe.setAttribute('id',iframeID);
    ieiframe.style.position = 'absolute';
 
    if(whichObj.id == "epi_overlay") // total hack
        whichObj.style.zIndex = 999;
    ieiframe.style.zIndex = whichObj.style.zIndex -1;
    ieiframe.frameBorder = 0;
    ieiframe.style.filter = 'alpha(opacity=0)';
    
    whichObj.parentNode.insertBefore(ieiframe, whichObj);
    ieiframe.style.width = (whichObj.offsetWidth) + "px";
    ieiframe.style.height = (whichObj.offsetHeight) + "px";
    ieiframe.style.left = (getPagePosition(whichObj).x) + "px";
    ieiframe.style.left = (whichObj.offsetLeft) + "px";
    ieiframe.style.top = (getPagePosition(whichObj).y) + "px";
    ieiframe.style.top = (whichObj.offsetTop) + "px";

}

function removeIEiframe(iframeID) // Removes an iframe from the page DOM
{
    iframeID = (iframeID == null)? iframeID : "ieiframe";
    $(iframeID).parentNode.removeChild($(iframeID));
}


/** SBM Open Window function ***/

function sbm_Window(url)
{
     var Newsbm=window.open(url,'name',"width=1000,height=500,directories=no,menubar=no,toolbar=no,scrollbars=yes,left=0,top=0,screenX=0,screenY=0");
}

function encodeSBMTitle(title)
{
   title = encodeURIComponent(title); 
   title = decodeURIComponent(title);
   if(title.indexOf('&#244;')!=-1 || title.indexOf('&ocirc;')!=-1 || title.indexOf('&Ocirc;')!=-1 || title.indexOf('&Eacute;')!=-1 || title.indexOf('&egrave;')!=-1 || title.indexOf('&Egrave;')!=-1 || title.indexOf('&#218;')!=-1 || title.indexOf('&#206;')!=-1 || title.indexOf('&#232;')!=-1 || title.indexOf('&#237;')!=-1 || title.indexOf('&#233;')!=-1 || title.indexOf('+')!=-1) 
    {
        title=title.replace(/&#244;/g,"o");
        title=title.replace(/&ocirc;/g,"o");
        title=title.replace(/&Ocirc;/g,"O");
        title=title.replace(/&eacute;/g,"e");
        title=title.replace(/&egrave;/g,"e"); 
        title=title.replace(/&Eacute;/g,"E");
        title=title.replace(/&Egrave;/g,"E"); 
        title=title.replace(/&#218;/g,"u");
        title=title.replace(/&#232;/g,"e");
        title=title.replace(/&#233;/g,"e");
        title=title.replace(/&#206;/g,"I");
        title=title.replace(/&#237;/g,"i"); 
        title=title.replace(/\+/g,"and");
    }
    return title;
}

/** Form Utils **/
if (typeof Epi.FormUtils === 'undefined' || !Epi.FormUtils) {
	Epi.FormUtils = {}
}

Epi.FormUtils.submitForm = function(options) {
    if (options.formName && document.forms[options.formName]) {
    	if (options.url) {
        	document.forms[options.formName].action = options.url;
        }
        document.forms[options.formName].submit();
    }

    return false;
}

/** origin policy **/
function pegToParentDomain() {
	var originalDomain = document.domain;
	var forumsDomainIndex = originalDomain.search(/boards/);
	var parentDomainIndex = originalDomain.search(/[^.]+\.[^.]+$/);
	if (forumsDomainIndex == -1 && parentDomainIndex != -1) {
		document.domain = originalDomain.substring(parentDomainIndex);
	}
}
pegToParentDomain();

/**** Microsoft Audience Extension ****/
function writeMicrosoftAudienceTag() {
    MSEXT_domain = document.location.host.split('.');
    MSEXT_domain = MSEXT_domain[(MSEXT_domain.length - 2)];
    MSEXT_path = document.location.pathname.split('/');
    MSEXT_request = document.location.protocol + "//view.atdmt.com/action/MSFT_CondeNet_AE_ExtData/v3/atc1." + MSEXT_domain;
    MSEXT_request += (MSEXT_path[1] != '') && (MSEXT_path[1] != undefined) ? "/atc2." + MSEXT_path[1] : '';
    MSEXT_request += (MSEXT_path[2] != '') && (MSEXT_path[2] != undefined) ? "/atc3." + MSEXT_path[2] : '';
    MSEXT_request += '/';
    var footerId = document.getElementById("legal_information");
    var newElem = document.createElement("img");
    newElem.src = MSEXT_request;
    newElem.height = "1";
    newElem.width = "1";
    if(footerId)
        footerId.appendChild(newElem);
}
runOnLoad(writeMicrosoftAudienceTag);
/**************************************/

// hp right rail ba unit is hidden until
// atg returns with data to show it. This
// is the atg callback.
function showHomePageRightRailBAUnit() {
    var baOfferDiv = document.getElementById('ba_sub_offer');
    if (baOfferDiv) {
        baOfferDiv.style.display = 'block';
    }
}

Epi.text = (function($) {
    return {
        truncatedVersion: (function() {
            var nextValueMap = {};
            var updateContainer = function() {
                var parentContainer = $(this).closest('div')[0];
                if (nextValueMap[parentContainer.id]) {
                    $(this).text($(this).text() == 'more' ? 'hide' : 'more');
                    var tmpHtml = $('.truncatedTextModuleText', parentContainer).html();
                    $('.truncatedTextModuleText', parentContainer).html(nextValueMap[parentContainer.id]);
                    nextValueMap[parentContainer.id] = tmpHtml;
                }
            }
            return function(elementId, text) {
                var hideShowLink = $('<span class="greenLnk"><a>hide</a> &#8250;</span>')
                $('a', hideShowLink).click(updateContainer);
                nextValueMap[elementId] = text;
                $('#' + elementId).append(hideShowLink);
                $('a', hideShowLink).click();
            }
        })()
    };
})(jQuery);

Epi.products = (function($) {
    var findValidPrice = function(prices) {
        var result = null;
        $.each(prices, function(index, price) {
            var startString = $('Date[type=start]', price).attr('value');
            var endString = $('Date[type=end]', price).attr('value');
            var now = new Date();
            if ((!startString || Date.parse(startString)) <= now &&
                    (!endString || Date.parse(endString) > now)) {
                result = $(price).attr('value');
                // breaks out of each
                return false;
            }
        });
        return result;
    }
    
    var randomizeList = function(maxVal){
    	var randomList = new Array( maxVal );
    	//randomize the index values
		for ( var counter = randomList.length - 1; counter > 0; counter-- ){
			var rand =  Math.floor( Math.random() * ( counter + 1  ));
			// Swap the elements 
			var temp = randomList[counter]?randomList[counter]:counter+1;
			randomList[counter] = randomList[rand]?randomList[rand]:rand+1;
			randomList[rand] = temp;
		} 
		return randomList;
    }
    
    var handleProductContent = function(xml, carousel) {
    	var randomArrayList = randomizeList($('product', xml).length);
        $(randomArrayList).each(function(index, value){
        	var tempProduct = $('product:eq('+(value-1)+')', xml);
			var name = tempProduct.find('name').text();           
			var link = $('url[type=detail]', tempProduct).attr('value');
			var imageSrc = $('Medium[name=largesearch]', tempProduct).attr('value');
			var listPrice = findValidPrice($('Price[type=list]', tempProduct));
			var salePrice = findValidPrice($('Price[type=sale]', tempProduct));
			var priceHtml = (listPrice ? ('<span class="' + (salePrice ? 'product-widget-disabled-price' : 
					'product-widget-actual-price') + '">$' + Number(listPrice).toFixed(2) + '</span>&nbsp;') : '') +
					(salePrice ? ('<span class="product-widget-actual-price">' + Number(salePrice).toFixed(2) + 
					'</span>') : '');
			var anchorHtml = '<a target="_new" href="' + link + '">'
			carousel.add((index+1),anchorHtml + '<img src="' + imageSrc + '"/></a>' +
					'<p class="product-widget-title">' + anchorHtml + name + '</a></p>' +
					'<p class="product-widget-price">' + priceHtml + '</p>');      
					
        });
        
        carousel.size($('product', xml).length);
    }
    
    var handleCarouselLoaded = function(carousel, state) {
        if (state != 'init') {
            return;
        }
        
        $.get("/feeds/products/ProductFeed.xml", function(xml) { handleProductContent(xml, carousel); });
         
    };

    var init = function() {
    
        if ($('#product-widget-carousel').length) {
    
            $('#product-widget-carousel').jcarousel({
                itemFallbackDimension: 228,
                itemLoadCallback: handleCarouselLoaded,
                scroll: 1
            });   
            
        }     
    };
    $(init);

})(jQuery);