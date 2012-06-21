var PROJECT_NAMESPACE = (typeof CN !== 'undefined' && CN) ? CN : MAGNET;

/*
On document ready:
1 - Grab the session store object from the cookie creating it if necessary
2 - If a cobrand id is present on the query string get new cobrand data and
store that in the session store, otherwise attempt to render cobrand info
with existing data.
*/
var lookupURL="/tools/cobranding/cobrand_lookup";
var sessionStoreCookieId="epi_session_store";


function renderCobrand(sessionObject){
    if (document.getElementById("dash-cobrand-container")){
        if (sessionObject && sessionObject.dashCoBrand){
            var scheme="http://";
            var cbLink=sessionObject.dashCoBrand.cbLink;
            var cbLogo=sessionObject.dashCoBrand.cbLogo;
            try{
                var parentContainer=jQuery("#dash-cobrand-container").empty();
                if (typeof cbLink !== 'undefined' && cbLink){
                    cbLink=(cbLink.indexOf(scheme)<0)?scheme.concat(cbLink):cbLink;
                    parentContainer=jQuery("<a href='CBLINK'></a>".replace(/CBLINK/,cbLink)).appendTo(parentContainer);
                }
                
                cbLogo=(cbLogo.indexOf(scheme)<0)?scheme.concat(cbLogo):cbLogo;
                var table=jQuery("<table/>").appendTo(parentContainer);
                var row=jQuery("<tr/>").appendTo(table);
                jQuery("<td/>").appendTo(row).append("<img src='BACKTO' id='BACKTODASH'/>".replace(/BACKTO/,"/rd_images/cobranding/back-to-dash.gif"));
                jQuery("<td/>").appendTo(row).append("<img src='CBLOGO' id='CBLOGO'/>".replace(/CBLOGO/,cbLogo));
                jQuery("#dash-header").css("display","block");
            } catch (e){
            }
        } else if (document.referrer.match(/dash(magazine|recipes)/)){
            jQuery("#dash-header").show();
        }
    }
}



var handlers={
    "MSIE 7.0":(new IEHandler()),
    "other":(new NonIEHandler())
};


jQuery(document).ready(
    function (){
        var handler=(navigator.userAgent && navigator.userAgent.indexOf("MSIE 7.0")>=0)?"MSIE 7.0":"other";
        handlers[handler].cobrand();
    });



/**
 * There are two versions of this routine, one to handle non-ie browsers like Mozilla
 * and Safari and one to handle IE, specifically version 7. Once IE 7 heads out to
 * pasture the code to handle it can be excised.
 */

function NonIEHandler(){
}

NonIEHandler.prototype.cobrand=function(){
    //Get session store object from cookie
    var sessionStoreCookieId="epi_session_store";
    var epiSessionStore= PROJECT_NAMESPACE.cookie.get(sessionStoreCookieId);
    var epiSessionObject=null;
    
    //Create it if necessary
    if (PROJECT_NAMESPACE.isNull(epiSessionStore) || epiSessionStore==""){
        epiSessionObject=new Object();
    } else {
        epiSessionObject=JSON.parse(epiSessionStore);
    }
    
    //npid comes from Parade (their existing partners are used to that)
    //cobrand is a bit more generic/meaningful and should be used everywhere else
    var cobrandid=PROJECT_NAMESPACE.url.params("npid");
    cobrandid=(cobrandid)?cobrandid:(epiSessionObject.seasonalMapPartnerId)?epiSessionObject.seasonalMapPartnerId:null;
    if (!PROJECT_NAMESPACE.isNull(cobrandid) && cobrandid!=""){
        var callback=function(cobrandObject){
            if (cobrandObject["cbLogo"]){
                epiSessionObject["dashCoBrand"]=cobrandObject;
                PROJECT_NAMESPACE.cookie.set(sessionStoreCookieId,JSON.stringify(epiSessionObject),{"path":"/"});
                renderCobrand(epiSessionObject);
            }
        };
        
        jQuery.getJSON(lookupURL,{"cobrandid":cobrandid},callback);
    } else {
        renderCobrand(epiSessionObject);
    }
}

function IEHandler(){
}

IEHandler.prototype.cobrand=function(){
    //Get session store object from cookie
    var epiSessionStore=this.getCookie(sessionStoreCookieId);
    var epiSessionObject=null;
    
    //Session store may contain other data besides the co-branding.
    if (PROJECT_NAMESPACE.isNull(epiSessionStore) || epiSessionStore==""){
        epiSessionObject=new Object();
    } else {
        epiSessionObject=JSON.parse(epiSessionStore);
    }
    
    var queryString=null;
    try {
        //this will throw an exception if the document.domain property has been
        //written to already.
        queryString=window.location.search.replace(/\?/,"");
    } catch (e){
        //pages know to mutate the document.domain property will set
        //documentQueryString before doing so.
        queryString=documentQueryString;
    }
    
    var parameters=this.parseParameters(queryString);
    //npid comes from Parade (their existing partners are used to that)
    //cobrand is a bit more generic/meaningful and should be used everywhere else 
    var cobrandid=parameters["npid"];
    cobrandid=(cobrandid)?cobrandid:(epiSessionObject.seasonalMapPartnerId)?epiSessionObject.seasonalMapPartnerId:null;
    if (cobrandid){
        var oReq = this.getXMLHttpRequest();
        if (oReq) {
            var ieHandler=this;
            var callback=function(cobrandObject){
                if (cobrandObject["cbLogo"]){
                    epiSessionObject["dashCoBrand"]=cobrandObject;
                    this.setCookie({"name":sessionStoreCookieId,"value":JSON.stringify(epiSessionObject),"path":"/","expires":1});
                    renderCobrand(epiSessionObject);
                }
            };
            
            oReq.onreadystatechange = function(){
                try{
                    if (oReq && oReq.status == 200) {
                        var cbObject=JSON.parse(oReq.responseText);
                        callback.call(ieHandler,cbObject);
                    }
                } catch (e){}
            };
            oReq.open("GET", lookupURL.concat("?cobrandid=").concat(cobrandid), true);
            oReq.send();
        }
    } else {
        renderCobrand(epiSessionObject);
    }
}

IEHandler.prototype.parseParameters=function(params){
    var parameters=new Object();
        
    if (params){
        var paramValues=params.split(/\&/);
        for (var i=0;i<paramValues.length;i++){
            var paramValue=paramValues[i].split(/=/);
            if (!(parameters[paramValue[0]])){
                parameters[paramValue[0]]=new Array();
            }
            parameters[paramValue[0]].push(paramValue[1]);
        }
    }
    
    return parameters;
}

IEHandler.prototype.getCookie=function (sName){
    var aCookie = document.cookie.split("; ");
    for (var i=0; i < aCookie.length; i++){
        var aCrumb = aCookie[i].split("=");
        if (sName == aCrumb[0]){ 
            return unescape(aCrumb[1]);
        }
    }
    return null;
}

// name, value, expires, path, domain, secure 
IEHandler.prototype.setCookie=function(cookieAttributes){
    // set time, it's in milliseconds
    var today = new Date();
    today.setTime(today.getTime());
    if (cookieAttributes.expires){
        cookieAttributes.expires = cookieAttributes.expires * 1000 * 60 * 60 * 24;
    }
    var expires_date = new Date(today.getTime() + (cookieAttributes.expires));
    
    document.cookie = cookieAttributes.name + "=" +escape(cookieAttributes.value) +
    ((cookieAttributes.expires) ? ";expires=" + expires_date.toUTCString() : "") +
    ((cookieAttributes.path) ? ";path=" + cookieAttributes.path : "") +
    ((cookieAttributes.domain) ? ";domain=" + cookieAttributes.domain : "") +
    ((cookieAttributes.secure) ? ";secure" : "");
}



IEHandler.prototype.getXMLHttpRequest=function() {
    var XHRObject=null;
    if (window.XMLHttpRequest) {
        XHRObject=new window.XMLHttpRequest;
    } else {
        try {
            XHRObject=new ActiveXObject("MSXML2.XMLHTTP.3.0");
        } catch(ex) {}
    }
    
    return XHRObject;
}

