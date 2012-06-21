function addLoadEvent(func) {
  var oldonload = window.onload;
  if (func && typeof window.onload != 'function') 
  {
    window.onload = func;
  } 
  else if (func)
  {
    window.onload = function() 
    {
    oldonload();
    func();
    };
  }
}

jQuery(document).ready(function($) {
    // only show BA mag nav on non-tastebook recipes    
    if (jQuery('#recipe-cookbook-reader').length) {
        jQuery('#auxiliary_navigation').css('background-image', 'url(/rd_images/header/default/bg_auxiliary_navigation.png)');
        jQuery('#auxiliary_navigation').css('background-position', '0 0');
        jQuery('#magazine_nav').remove(); 
    }

    var cookieSafe = verifyCookieSafe();
    if (cookieSafe) {
        if ( getCookie("amg_user_info") == null || getCookie("amg_user_info") == '' ) {
            if (jQuery('#joinRecipeBox')) {
                jQuery('#joinRecipeBox').css('display', 'block');  
            }
        }
        else {
            if (jQuery('#goToRbox')) {
                jQuery('#goToRbox').css('display', 'block');  
            }
        }
    }
});

function getCheckedReviews() {
    var cookieSafe = verifyCookieSafe();
	if (cookieSafe)	{
		var selectedReviews = "";
		
		if (getCookie("checkedReviews")) {

			selectedReviews = getCookie("checkedReviews");
			
			var reviewIDarray = selectedReviews.split("#");
			         
            // check if check box exists
            if (typeof document.getElementById('reviews') !="undefined" && document.getElementById('reviews')!=null && document.getElementById('reviews').getElementsByTagName('INPUT').length>0)
            {               
                for (j = 0; j < document.getElementById('reviews').getElementsByTagName('INPUT').length; j++) { 				    
                    for (k = 0; k < reviewIDarray.length; k++) {	
                        if (document.getElementById('reviews').getElementsByTagName('INPUT')[j].value == reviewIDarray[k]) {
                            document.getElementById('reviews').getElementsByTagName('INPUT')[j].checked = true;
                        }
                    }
    			}		
                return true;    
            } else {
                return false;
            }    
	  	} else {
			return false;
        }    
	} else {
		return false;
	}
}


function setCheckedReviews(reviewID, recipeID) {

    // check if cookies are allowed
    if(epiCookies.allowed()==false) {
        return false;
    }
    
	//Get cookie value
	var cookieValue = getCookie("checkedReviews");
	
	//Initialize newCookieString
	var newCookieString = "";

	//Check if the checkbox with that reviewID is checked
	var checked = new Boolean(false);
	   
   // if (typeof document.printRecipe != "undefined" && typeof document.printRecipe.reviewID != "undefined")
    if (typeof document.getElementById('recipe_detail_module') !="undefined" && document.getElementById('recipe_detail_module')!=null && document.getElementById('recipe_detail_module').getElementsByTagName('INPUT').length>0)
    {

   		for (i = 0; i < document.getElementById('recipe_detail_module').getElementsByTagName('INPUT').length; i++)
    		{
    			if (document.getElementById('recipe_detail_module').getElementsByTagName('INPUT')[i].value == reviewID && document.getElementById('recipe_detail_module').getElementsByTagName('INPUT')[i].checked == true)
    			{
    				checked = true;
    			}
    		}
    }

	//If checked, add reviewID to cookie
	if (checked == true)
	{
		//If cookie value is null
		if (cookieValue == null)
		{
			//Add reviewID to new cookie string
			newCookieString += ( "#" + reviewID ); 

			//Set cookie value with new cookie string		
			setCookie("checkedReviews", newCookieString, false, "", "/", "", false);
			setCookie("recipeID", recipeID, false, "", "/", "", false);
		}
		
		//Else if cookie value is not null
		else
		{
			//Create an array from the cookie value
			var cookieValueArray = cookieValue.split("#");
			
			//Loop through array
			for (j = 0; j < cookieValueArray.length; j++)
			{	
				//Add array value to new cookie string
				if (cookieValueArray[j] != "")
				{
					
					newCookieString += ( "#" + cookieValueArray[j] ); 
					
				}
			}
			//Add reviewID to new cookie string
			newCookieString += ( "#" + reviewID );
			
			//Set cookie value with new cookie string
			setCookie("checkedReviews", newCookieString, false, "", "/", "", false);
			setCookie("recipeID", recipeID, false, "", "/", "", false);
			
		}
		
		
	}	
	//Else if not checked, delete reviewID value from cookie
	else
	{
		//Create an array from the cookie value
		var cookieValueArray = cookieValue.split("#");
		
		//Loop through array
		for (k = 0; k < cookieValueArray.length; k++)
		{	
			//Add array value to new cookie string
			if (cookieValueArray[k] != "" && cookieValueArray[k] != reviewID)
			{
				newCookieString += ( "#" + cookieValueArray[k] ); 
			}
		}
		//Set cookie value with new cookie string
		setCookie("checkedReviews", newCookieString, false, "", "/", "", false);
		setCookie("recipeID", recipeID, false, "", "/", "", false);
	}
}

function setCheckedNote(recipeID)
{
	// check if there is a recipeID in cookie
    var recipeIDfromCookie = getCookie("recipeID");
    
    if (recipeIDfromCookie != recipeID)
    {
       setCookie("recipeID", recipeID, false, "", "/", "", false);
    }
    
    if (document.printOptionsForm.userNote.checked)
	{
		//Set cookie value	
		setCookie("printNote", "true", false, "", "/", "", false);     
	}
	else
	{
		setCookie("printNote", "false", false, "", "/", "", false);
	}

}


function setBackToRecipe(recipe_title, recipe_link)
{
	var cookieSafe = verifyCookieSafe();
	if (cookieSafe)	{
        setCookie("recipeTitle", recipe_title, false, "", "/", "", false);
        setCookie("recipeLink", recipe_link, false, "", "/", "", false);
    } else {
		return false;
	}
    
    
}


if (typeof RegisterLoginBox != 'undefined') {
    Object.extend(RegisterLoginBox.prototype, {
        showRegisterLogin: function(element) {
            //get the div
            var parent = $(element).parentNode;
            var topPosition = parent.offsetTop + "px";

            // preload button image to prevent bug in IE6
            if (this.btnImage == undefined) {
                this.btnImage = new Image();
                this.btnImage.src = "/globalimages/opt/recipes/log_in.gif";
            }
           
            var registerLoginNodeHTML = "";
            var registerLoginNode = "";
            
            registerLoginNodeHTML = "<iframe id='login_iframe' scrolling='no' frameborder='0'></iframe>" 
                                   //'<div id="registerLogin">'
            if (this.loginTarget && this.loginTarget.options && this.loginTarget.options.shoppingListPromo) {
            	registerLoginNodeHTML += '<div id="shoppinglistPromo">Just want to print a shopping list? <a href="' + this.shoppingListUrl + '">Click here</a> &#8250;</div>';
            }
            registerLoginNodeHTML += '    <div id="signin">'
            registerLoginNodeHTML += '        <span style="background-color: #4a7cbc; overflow: hidden; display: block; height: 1px; margin: 0 4px 0 1px;"></span>'
            registerLoginNodeHTML += '        <h3>Member Sign In</h3>'
            registerLoginNodeHTML += '        <div class="sior_content" id="sior_signinform">'
            registerLoginNodeHTML += '        <form id="' + this.loginForm + '" name="userLoginForm" method="post" action="javascript:void(0);">'
            registerLoginNodeHTML += "               <input type='hidden' name='appAlias' value='" + this.loginTarget.appAlias + "' />";
            registerLoginNodeHTML += "               <input type='hidden' name='returnto' value='" + this.returnToUrl + "' />"
            registerLoginNodeHTML += '               <label for="sior_username">Email or Display Name</label>'
            registerLoginNodeHTML += '               <input name="username" id="sior_username" type="text"/>'
            registerLoginNodeHTML += '               <label for="sior_password">Password</label>'
            registerLoginNodeHTML += '               <input name="password" id="sior_password" type="password"/>'
            registerLoginNodeHTML += '               <label><input type="checkbox" value="true" name="rememberme" id="rememberMe"/> remember me next time</label>'
            registerLoginNodeHTML += "               <input type='hidden' name='recipeId' value='" + this.recipeId + "' />";
            registerLoginNodeHTML += '               <a href="javascript:void(0)" id="' + this.submitButton + '">sign in</a>';
            registerLoginNodeHTML += '            </form>'
            registerLoginNodeHTML += '            <a href="/user/forgot_password?returnto=' + this.returnToUrl + '" id="sior_forgot">forgot sign-in information?</a>'
            registerLoginNodeHTML += '        </div>'
            registerLoginNodeHTML += '    </div>'
            registerLoginNodeHTML += '    <div id="register">'
            registerLoginNodeHTML += '        <span style="background-color: #ff6600; display: block; height: 1px; overflow: hidden;  margin: 0 4px 0 1px;"></span>'
            registerLoginNodeHTML += '        <h3>Not A Member?</h3>'
            registerLoginNodeHTML += '        <div class="sior_content" id="sior_join_offer">'
            registerLoginNodeHTML += '            <p>Join Epicurious to create a personal Recipe Box for saving and sharing recipes; you can also rate and review recipes and meet other food lovers in the Epicurious community.</p><p>It\'s fast and free.</p>'
            registerLoginNodeHTML += '            <a id="sior_joinnow" href="/user/registration?appAlias=' + this.loginTarget.appAlias + '&returnto=' + this.returnToUrl + '">join now</a>'
            registerLoginNodeHTML += '        </div>'
            registerLoginNodeHTML += '    </div>'
            registerLoginNodeHTML += '    <div style="clear:both"></div>'
            registerLoginNodeHTML += '    <a id="close">close</a>'
            registerLoginNodeHTML += '</div>'     

			registerLoginNode = document.createElement("div");
			registerLoginNode.id = this.divId;
            
            /*
            registerLoginNode = document.createElement("div");
			registerLoginNode.id = this.divId;
            */
            if ( document.all ) {  
                registerLoginNode.style.filter="none";
            }

            //alert user if cookies are not enabled
            epiCookies.allowed();
            
            registerLoginNode.innerHTML = registerLoginNodeHTML;
            
			parent.appendChild(registerLoginNode);
            
            if ($('container')) {
                $('container').style.position = 'relative';
                $('container').style.zIndex = 201;
            }
            
            
            
            return void(0);
        },
        updateOnClose: function() {
            if ($('container')) {
                $('container').style.position = 'static';
                $('container').style.zIndex = 0;
            }
        }
    });
}

if (typeof UserLoginBox != 'undefined') {
    Object.extend(UserLoginBox.prototype, {
        showUserLogin: function(element) {
            var userLoginHTML = "";
            var userLoginNode = "";
                
            userLoginHTML = "<iframe id='login_iframe' scrolling='no' frameborder='0'></iframe>";         
            userLoginHTML += "<div id='pngDiv'><div><form id='" + this.loginForm + "' name='userLoginForm' method='post' action='javascript:void(0);'>";
            userLoginHTML += "<input type='hidden' name='appAlias' value='" + this.loginTarget.appAlias + "' />";            
            userLoginHTML += "<input type='hidden' name='returnto' value='" + this.returnToUrl + "' />";            
            userLoginHTML += "<a href=\"javascript:void(0);\" id='" + this.closeLink + "'></a>";            
            userLoginHTML += "<p id='usn'><span>USER NAME:</span></p><input type='text' name='username' tabindex='1' class='text' value='' maxlength='255'/>";
            userLoginHTML += "<a href='/user/forgot_password?returnto=" + this.returnToUrl + "'>(forgot your user name?)</a>";
            userLoginHTML += "<p id='pwd'><span>PASSWORD:</span></p><input type='password' name='password' tabindex='2' class='text' value='' maxlength='80'/>";
            userLoginHTML += "<a href='/user/forgot_password?returnto=" + this.returnToUrl + "'>(forgot your password?)</a>";
            userLoginHTML += "<input id='rememberMe' type='checkbox' name='rememberme' value='true' /> <span id='rememberText'>remember me next time</span>"; 
            userLoginHTML += "<input type='hidden' name='recipeId' value='" + this.recipeId + "' />";
           
            var agt = navigator.userAgent.toLowerCase();
            
            if (agt.indexOf("safari") != -1)
            {   
                userLoginHTML += "<button id='" + this.submitButton + "' />";
            }
            else
            {
                userLoginHTML += "<input id='" + this.submitButton + "' type='button' name='Submit' />";    
            }

            userLoginHTML += "</div></div></form>"; 
         
			userLoginNode = document.createElement("div");
			userLoginNode.id = this.divId;
            if ( document.all ) {  
                userLoginNode.style.filter="none";
            }

            userLoginNode.innerHTML = userLoginHTML;			
			$(element).parentNode.appendChild(userLoginNode);
            
            if ($('container')) {
                $('container').style.position = 'relative';
                $('container').style.zIndex = 201;
            }
            
            return void(0); 
            
        },
        updateOnClose: function() {
            if ($('container')) {
                $('container').style.position = 'static';
                $('container').style.zIndex = 0;
            }
            // Find node we're attached to
            /*var parent = $(this.divId).parentNode;
            if (document.all && parent.id.indexOf('tab') != -1) {
                $("tab_note").style.height = "22px";
                $("navTabs").style.height = "23px";
            }*/
        }
    });
}


if (typeof RateRecipeBox != 'undefined') {
    Object.extend(RateRecipeBox.prototype, {
        show: function(element) {
            var rateFormNode;
            //get the div
//            var rateRevDiv = document.getElementById(element.parentNode.id); 
            var rateRevDiv = element.parentNode; 
            
            rateFormNode = document.createElement("div");    
            rateFormNode.id = "rateForm";
        
            var rateFormHTML = "";
            rateFormHTML += "<form name=\"rateRecipeForm\" method=\"post\" id=\"thisForm\">";
            rateFormHTML += "<input id='hiddenRating' type='hidden' name='rating'/>";    
            rateFormHTML += "<input type='hidden' name='recipeId' value='" + this.recipeId + "' />";
            rateFormHTML += "<p>Rollover and click fork to rate</p>";
            rateFormHTML += "<a href=\"javascript:void(0);\" id='close'></a>";    
            rateFormHTML += "</form>"    
       
            rateFormNode.innerHTML = rateFormHTML;               
            rateRevDiv.appendChild(rateFormNode);
            
            return void(0);
        }
    });
}




if (typeof ReviewRecipeBox != 'undefined') {
    Object.extend(ReviewRecipeBox.prototype, {
        show: function(element) {
            var reviewFormNode;
            //get the div
//            var rateRevDiv = document.getElementById(element.parentNode.id);       
	    	var rateRevDiv = element.parentNode;        

            var topPosition = rateRevDiv.offsetTop + "px";
            reviewFormNode = document.createElement("div");
            reviewFormNode.id = this.reviewBox;
        
            var reviewFormHTML = "";        
            reviewFormHTML += "<iframe id='review_iframe' scrolling='no' frameborder='0'></iframe>";
            reviewFormHTML += "<form name=\"reviewRecipeForm\" method=\"post\" id=\"thisForm\" class=\"reviewForm\">";
            reviewFormHTML += "<a href=\"javascript:void(0);\" id='close'></a>";
            reviewFormHTML += "<div id='rateDiv'>";
            reviewFormHTML += "<p>Rollover and click fork to rate</p>";
            reviewFormHTML += "</div>";
            reviewFormHTML += "<p id='topText'>Enter Review</p>";
            reviewFormHTML += "<textarea name='text' WRAP=HARD></textarea>";
            reviewFormHTML += "<div id='user_name'><p><strong>Username:</strong> <span id='usernameDisplay'></span></p>";
            reviewFormHTML += "<input type='checkbox' name='displayUsername' value='true' /><label for='displayUsername'>Do not display my name with my review</label><div style='clear:both'></div></div>";
            reviewFormHTML += "<div id='user_location'><input type='text' name='location' value='' />";
            reviewFormHTML += "<p>Where are you from? <br><span>(for example:  boston, ma)</span></p></div>";
            reviewFormHTML += "<div id='make_again'><p>Would you make it again?&nbsp;&nbsp;";
            reviewFormHTML += "<input type='radio' name='willPrepareAgain' value='1' id='make_yes'>yes&nbsp;&nbsp;&nbsp;";
            reviewFormHTML += "<input type='radio' name='willPrepareAgain' value='0'>no</p></div>";
            reviewFormHTML += "<a href='javascript:void(0);' id='reviewPreview'>"; 
            reviewFormHTML += "Preview";
            reviewFormHTML += "<a href='javascript:void(0);' id='reviewSubmit'>"; 
            reviewFormHTML += "Submit</a>";
            reviewFormHTML += "<a href='javascript:void(0);' id='reviewCancel'>"; 
            reviewFormHTML += "Cancel</a>";
            reviewFormHTML += "<input type='hidden' name='rating'/>";
            reviewFormHTML += "<input type='hidden' name='username'/>";
            reviewFormHTML += "<input type='hidden' name='recipeId' value='" + this.recipeId + "' />";
            reviewFormHTML += "<input type='hidden' name='returnTo' value='" + this.returnToUrl + "?which=" + element.id + "'/>";
            reviewFormHTML += "</form>";
			reviewFormHTML += "<div id='reviewRules'>I understand and agree that registration on or use of this site constitutes agreement to its <a href=\"/services/useragreement\" target=\"_blank\"><u>User Agreement</u></a>, <a href=\"/services/privacypolicy\" target=\"_blank\"><u>Privacy Policy</u></a>, and <a href=\"/services/help/postingguidelines\"target=\"_blank\" ><u>Posting Guidelines</u></a>.</div>";
			  
            reviewFormNode.innerHTML = reviewFormHTML;        
            reviewFormNode.style.display = "block";
            reviewFormNode.style.top=element.offsetTop+"px";
            rateRevDiv.appendChild(reviewFormNode);
            reviewReceipeLength();
            document.getElementById("review_iframe").style.display = "block";         
            return void(0);
        },
        showValidationErrors: function(errors) {
            errors.each(function(error) {
                    if (error.propertyName == "text") {
                        var label = $('topText');
                        // remove all children
                        if (label.hasChildNodes()) {
                            $A(label.childNodes).each(function(node) { label.removeChild(node); });
                        }
                        label.style.color = "red";
                        label.appendChild(document.createTextNode(error.message));
                    }
            });
        }    
    });
}

if (typeof NotesComponent  != 'undefined') {
    Object.extend(NotesComponent.prototype, {
        addNoteHeader: " "
    })
}

if (typeof RecipeDetails == 'undefined') {
    RecipeDetails = {};
}

RecipeDetails.userMessage = "We're sorry--there was a problem completing the action you just requested.\n\n" +
        "We're doing our best to address this issue.  Please help us by clicking \"OK\" below.  " +
        "This will take you to our Technical Feedback form (unless your browser is set to block pop-ups).  " +
        "This form will record some technical details about the error you just experienced, " +
        "which will help us to investigate and hopefully resolve the specific issue occurring on your browser.  " +
        "To ignore this message and our feedback form, simply click the Cancel button.\n\n" +
        "We hope you continue to enjoy Epicurious!";

        
function swapIntroText(evt) {
    if(!recipeIntroText){return false;}
    var tmpTxt = $('truncatedText').innerHTML;
    var lnk = (window.event) ? evt.srcElement : evt.target;
    lnk.innerHTML=(lnk.innerHTML=='more')?'hide':'more';
    $('truncatedText').innerHTML = recipeIntroText + lnk;      
    recipeIntroText = tmpTxt;
    // need to re-round container for ie   
}

// print dropdown menu initialization: happens after on load event

function printRecipesMenuInit(){
    
      
    jQuery('#print-options').mouseenter(function() { 
       if ( jQuery('#print-options').hasClass('screen1024') == false ) { 
            jQuery('#print-options').addClass('flyout-menu');     
        }
        
        if ( jQuery('#print-options').hasClass('screen1024') == true ) { 
            jQuery('#print-options #print').addClass('hover-state');     
        }
        
        jQuery('#pf_dropdown').css('display', 'block');
    }).mouseleave(function(){
        if ( jQuery('#print-options').hasClass('flyout-menu') ) {
            jQuery('#print-options').removeClass('flyout-menu');
        }
        if ( jQuery('#print-options #print').hasClass('hover-state') ) {
            jQuery('#print-options #print').removeClass('hover-state');
        }
        jQuery('#pf_dropdown').css('display', 'none');
    });
    
}

runOnLoad(printRecipesMenuInit); 

function reviewReceipeLength() {
  jQuery('textarea', 'form[name="reviewRecipeForm"]').bind('keydown', function(e) {
      var count = this.value.length;
      if(e.keyCode !== 8 && count >= 2000) {
          this.value = this.value.substring(0,2000);
          e.preventDefault();
      }
  });
}


function closePromo() {
    if (document.getElementById('internalPromoUnit')) {
        internalPromoUnitSpace = document.getElementById('internalPromoUnit');
        internalPromoUnitSpace.style.display = 'none';
    }
}
  
