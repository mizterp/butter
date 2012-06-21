rndng_user_agent = getAgent();
/*  roundContainer() gets called after each rail has been been loaded.
    The id of the content container is sent as an argument. 
    This function reads the ids and classnames of all divs in the container in search of a match */
function roundContainer(containerID){
    var divsToRound = document.getElementById(containerID).getElementsByTagName("DIV");
    
    for(var i=0; i<divsToRound.length; i++){
        if( checkClassName(divsToRound[i]) ){
            try{round(divsToRound[i]);}
            catch(e){}
        }
    }
}

/*  checkClassName() checks the id and class attribute strings of the argument element 
    and matches them against a list of target classes and ids for elements that it needs to round. 
    If there is no match, the function returns false, and the rounding function will not be called on 
    the div element*/
function checkClassName(singleDiv){    
    var roundTargets = ['rounded', 'sweepstakes', 'luxury_link_promo', 'ba_sub_offer', 'recipe_of_the_day_module', 'related_content_module', 'recent_searches_module', 'module_content', 'content_unit', 'common_tools', 'recipe_stats', 'manageRecipes', 'section_search'];
    var innerbevelTargets = ['recipe_of_the_day_module', 'related_content_module', 'recent_searches_module', 'recipe_stats', 'manageRecipes', 'section_search'];
    var dropshadowTargets = ['content_unit', 'recipe_stats', 'manageRecipes', 'module_content'];
    
    for(var i=0; i<roundTargets.length; i++){
        if( singleDiv.id == roundTargets[i] || isMember(singleDiv,roundTargets[i]) ){
            for(var j=0; j<innerbevelTargets.length; j++){
                if( singleDiv.id == innerbevelTargets[j] || isMember(singleDiv,innerbevelTargets[j]) ){
                    singleDiv.className += " innerbeveled";
                }
            }
            for(var k=0; k<dropshadowTargets.length; k++){
                if( singleDiv.id == dropshadowTargets[k] || isMember(singleDiv, dropshadowTargets[k]) ){
                    singleDiv.className += " dropshadowed";
                }
            }
            return true;
        }
    }
    return false;
}


/*  round() rounds the borders of the argument div element */
function round(masterDiv){
    
    //set original div's positioning context
    var posContext = getStyle(masterDiv, 'position')
    if(  posContext != 'absolute' && posContext != 'relative'){
        masterDiv.style.position = 'relative';
    }

    //set original div's overflow so that the borders placed above and below the master can be seen
    masterDiv.style.overflow = 'visible';
    
    
    /* Handle Cross Browser Box Model Inconsistencies
     * ---------------------------------------------- */
     //IE6: Elements needs widths explicitly declared. Borders and padding must be subtracted from this width.
    if(rndng_user_agent == 'ie6'){ 
        //subtract borders and padding which are improperly added to an elements width by ie6
        var padL = parseInt(getStyle(masterDiv,'paddingLeft'));
        var padR = parseInt(getStyle(masterDiv,'paddingRight'));
        var brdL = 1;
        var brdR = 1;
        var calcWidth = masterDiv.offsetWidth - padL - padR - brdL - brdR;
        masterDiv.style.width = calcWidth + 'px';
    }
    
    //SAFARI: nested rounded elements will need additional treatment
    if(rndng_user_agent == 'safari'){
        //check to see if any of the children are members of the target classnames
        var targetedClasses = ['rounded', 'module_content', 'content_unit']; //potential nested classnames
        var hasNested = false;
        for(var i = 0; i<targetedClasses.length; i++){
            if( testElements(targetedClasses[i], 'DIV', masterDiv) ){
                hasNested = true;
            }
        }
        if(hasNested){masterDiv.className += ' r_hasNested';}   
        
        if(masterDiv.getElementsByTagName('IMG').length != 0){
            var childImages = masterDiv.getElementsByTagName('IMG');
        
            childImages[0].onload = function(){
                reround(masterDiv);
            }
        }
    }
    /********end cross browser box model********/
    
    //store the original div's background and border colors
    var masterBorderColor = getStyle(masterDiv,"border-top-color"); 
    var masterBackgroundColor = getStyle(masterDiv,"background-color");
    
    //create containers for the drawn borders
    var headerDiv = document.createElement("div"); 
    var footerDiv = document.createElement("div");
    
    //classify the containers
    headerDiv.className = "r_header"; 
    footerDiv.className = "r_footer";
    
    //create spans which will serve as drawn borders and gradients
    var span1=document.createElement("span");
    var span2=document.createElement("span");
    var span3=document.createElement("span");
    var span4=document.createElement("span");
 
    //classify the spans.
    span1.className="top_border";
    span2.className="top_gradient";
    span3.className="bottom_gradient";
    span4.className="bottom_border";
    
    //set container widths
    headerDiv.style.width = footerDiv.style.width = masterDiv.offsetWidth + "px";
    
    //set the colors of the drawn borders
    span2.style.backgroundColor = span3.style.backgroundColor = masterBackgroundColor;
    span1.style.backgroundColor = span4.style.backgroundColor = masterBorderColor;
    span1.style.borderColor = span2.style.borderColor = span3.style.borderColor = span4.style.borderColor = masterBorderColor;

    //color optional inner bevel
    if(masterDiv.className.indexOf("innerbeveled") != -1){
            span2.style.backgroundColor = span3.style.backgroundColor = "white";          
    }
    
    //insert the drawn borders into the containers
    headerDiv.appendChild(span1);
    headerDiv.appendChild(span2);
    footerDiv.appendChild(span3);
    footerDiv.appendChild(span4);

    //insert the containers into the document
    masterDiv.insertBefore(headerDiv,masterDiv.firstChild);
    masterDiv.appendChild(footerDiv);

    //remove the borders the drawn borders are replacing
    masterDiv.style.borderTop = masterDiv.style.borderBottom = 'none';  
}


/*  reround() is used by event handlers of vertically collapsing and expanding 
    elements which use round(). It is called by the onclick event handlers 
    for these expanding modules.
*/
function reround(ex_div, all){
    //store the old footer div
    var oldFooterDiv = ex_div.lastChild;
    var oldHeaderDiv = ex_div.firstChild;

    //create a new footer container
    var newFooterDiv = document.createElement("div");
    var newHeaderDiv = document.createElement("div");
    
    //classify the new footer container
    newFooterDiv.className = "r_footer";
    newHeaderDiv.className = "r_header";
    
    //set the container width
    newFooterDiv.style.width = newHeaderDiv.style.width = ex_div.offsetWidth + "px";   

    //create the drawn borders
    var span1=document.createElement("span");
    var span2=document.createElement("span");
    var span3=document.createElement("span");
    var span4=document.createElement("span");

    //classify the drawn borders
    span1.className="top_gradient";
    span2.className="top_border";
    span3.className="bottom_gradient";
    span4.className="bottom_border";
    
    //color the drawn borders
    var masterBorderColor2 = getStyle(ex_div,"border-right-color"); 
    var masterBackgroundColor2 = getStyle(ex_div,"background-color");

    span1.style.backgroundColor = span3.style.backgroundColor = masterBackgroundColor2;
    span2.style.backgroundColor = span4.style.backgroundColor = masterBorderColor2;
    span1.style.borderColor = span2.style.borderColor = span3.style.borderColor = span4.style.borderColor = masterBorderColor2;
    
    //color optional inner bevel
    if(ex_div.className.indexOf("innerbeveled") != -1){
        span2.style.backgroundColor = span3.style.backgroundColor = "white";          
    }

    //place the drawn borders into the container
    newHeaderDiv.appendChild(span2);
    newHeaderDiv.appendChild(span1);
    newFooterDiv.appendChild(span3);
    newFooterDiv.appendChild(span4);
    
    ex_div.replaceChild(newFooterDiv, oldFooterDiv);
    if (all) {
        ex_div.replaceChild(newHeaderDiv, oldHeaderDiv);
    }
}
