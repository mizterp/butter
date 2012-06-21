if (typeof CNP === 'undefined' || !CNP) {
    /**
    * Conde Nast Publications global namespace object
    * @namespace Conde Nast Publications global namespace object
    */
    var CNP = {};
}

CNP.ecom = (function() {
        return {
            displayCmPlacement: function(placement_id){
                if((typeof pageAds != 'undefined') && (typeof pageAds[placement_id] != 'undefined') && (CN.url.params('nojoy') !=1) ) {
                    var div = document.getElementById(placement_id);
                    div.innerHTML = pageAds[placement_id];
                }
                else { // If NO response from HEARST
                    //var failSafeArea = "${failsafeDiv}"; var displayFailsafeDiv = document.getElementById(failSafeArea); displayFailsafeDiv.style.display = "block";
                }
            },
            initEcomPlacement : function(ecomPlacementsList) {
             var positionList = (function(){
                 placement_ids = ecomPlacementsList;
                 placement_url_params = "";
                 for(i=0;i<placement_ids.length;){
                     placement_url_params += placement_ids[i];
                     if(++i < placement_ids.length){
                         placement_url_params += '%2C';
                     }
                 }
                 return placement_url_params;
             })();
            
             var _ghearst_vars = {};
             _ghearst_vars['ams_ads_script_src'] = 'http://subscribe.epicurious.com/ams/page-ads.js?ad_category_prefix=services&browser_path=%2FWEB-INF%2Fpages%2Fcn-fe-user%2Fgeneral%2Fregistration.jsp&cat_prefixes=%2CWEB-INF%2Cpages%2Ccn-fe-user%2Cgeneral%2Cregistration.jsp&keywords=dfgdfg&position_list='+positionList+'&site_prefix=25&subdomain=www&url_name=demographics';
              if (!window.$h) {window.$h = {}}(function(){
                     if (!$h.util){$h.util = {
                         buildScriptTag: function(src){
                         if (!!src){
                             document.write('<scr' + 'ipt src="'+src+'" language="javascript"></scr' + 'ipt>')
                                 }
                             }
                         }
                     }
                 $h.util.buildScriptTag(_ghearst_vars.ams_ads_script_src)})();
             }
        }
})();
/***************************************
 * Validate Registration URL
 * and Show Popup when validated success
 *
 */
CN.validateRegistration=(function(){
    var url_Param_ecomUpsellURL, url_window=window.location.href;
    return {
        checkSuccessURL : function() {
            if(CN.url.params("ecomUpsell", url_window)=="true") {
                url_Param_ecomUpsellURL=decodeURIComponent(decodeURIComponent(CN.url.params("ecomUpsellURL", url_window)));
                url_Param_ecomUpsellURL=url_Param_ecomUpsellURL.replace(/^https*:\/\//g, window.location.protocol+"//");
                window.open(url_Param_ecomUpsellURL, "PaymentPage", "menubar=1,status=0,resizable=0,toolbar=0,scrollbars=0,width=910,height=560,left="+((screen.width)/3)+",top="+((screen.height)/3));
            }
        }
    };
})();

jQuery(document).ready(function() {
    CN.validateRegistration.checkSuccessURL();
});