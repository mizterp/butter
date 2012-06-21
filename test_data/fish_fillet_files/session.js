    //nshah 20070404: show not logged by default
    $('notlogged').style.display = "block";
    $('loggedin').style.display = "none";
    $('user-utilities').style.display = "none";
    
    function updateSessionStateModule() {
        var userName = getCookie("amg_user_info");
        var recipeBoxCounter = getCookie("recipe_box_counter");
    
        if (userName != null && userName != '') {
   
            if(userName.length > 18){
                userName = userName.substring(0,15);
                userName = userName + "..."
            }
    
            $('sessionUserName').innerHTML = userName + "!";
            if (recipeBoxCounter == null) recipeBoxCounter = "0";
            $('recipeBoxCount').innerHTML = "(" + recipeBoxCounter + ")";
            $('loggedin').style.display = "block"; 
            showUserUtilities();             
            $('notlogged').style.display = "none";
            
        } else {
            $('notlogged').style.display = "block";
            $('loggedin').style.display = "none";
        }
    }
    
    if (typeof LoginEventListener != "undefined") {
        var SessionStateModule = Class.create();
        Object.extend(Object.extend(SessionStateModule.prototype, LoginEventListener.prototype), {
            handleUserLoggedIn: updateSessionStateModule,
            handleNoUserLoggedIn: updateSessionStateModule
        });
        new SessionStateModule(true, true, "SessionStateModule");
   }
  
   function showUserUtilities() {
               
        var userNameTabWidth = jQuery('#hi-user').width();
        
        jQuery('#hi-user').mouseenter(function() {
            jQuery('#user-utilities').css('display', 'block');
            jQuery('#user-utilities').css('width', userNameTabWidth);    
        }).mouseleave(function(){
            jQuery('#user-utilities').css('display', 'none');
        });
        
        jQuery('#user-utilities').mouseenter(function() {
            jQuery('#user-utilities').css('display', 'block');
        }).mouseleave(function(){
            jQuery('#user-utilities').css('display', 'none');
        });
      
        jQuery('#hi-user').mouseover(function() {
            jQuery('#user-utilities').css('display', 'block');  
        });

   }
   
   updateSessionStateModule(); 
   
   function myepibar() { 
   $('myepiloggedin').style.display = "none";

    var userName = getCookie("amg_user_info");
    var recipeBoxCounter = '(' + getCookie("recipe_box_counter") + ')';

    if (userName != null && userName != '') {

        if(userName.length > 18){
            userName = userName.substring(0,15);
            userName = userName + "...";
        }
        
        if ( $('siflogged_username') ) {
            $('siflogged_username').innerHTML = userName;
        }

        if ( $('siflogged_username2') ) {
            $('siflogged_username2').innerHTML = $('siflogged_username2').innerHTML.replace('username', userName);
        }
        
        /* forums welcome in left nav */
        if ( $('myepisessionUserName') ) {
            $('myepisessionUserName').innerHTML = userName;
        }
        
        if (recipeBoxCounter == null) recipeBoxCounter = "0";
        
        if ( $('myepirecipeBoxCount') ) {
            $('myepirecipeBoxCount').innerHTML = recipeBoxCounter;
        }
        
        $('myepiloggedin').style.display = "block";
        
    } else {
    
        $('myepiloggedin').style.display = "none";
    }    
}

function logout() {
    var options = {
		method: 'post',
		onSuccess: function(response) {
            $('notlogged').style.display = "block";
            $('loggedin').style.display = "none";

            // EPI-307. Here, we have to remove the ecomUpsell param because it causes an overlay to show following user registration.
            var existingUrl = window.location.href;
            var newUrl = existingUrl.replace(/ecomUpsell=[^&]*&/, '');
            window.location.href = newUrl;
        }
	}
	new Ajax.Request('/user/logout', options);
}

// Temporary workaround
if (typeof RecipeDetails == 'undefined') {
    RecipeDetails = {};
}


/* isLoggedIn function returns boolean based on existance of the user name in the cookie "amg_user_info" */
function isLoggedIn() {
    return (getCookie("amg_user_info")==null||getCookie("amg_user_info")=='')?false:true;
}

/* light reg code for login layer */
function inlineEpiLogin(loginSuccess, event) {
	var signInForm = {
		username: document.forms['userLoginForm'].username.value,
		password: document.forms['userLoginForm'].password.value,
		rememberme: document.forms['userLoginForm'].rememberme.checked
	};

    // 2 ajax call
	SignInController.signIn(signInForm, handleLogin.bind(this, loginSuccess));
}

function handleLogin(loginSuccess, response) {
	if (response == "LoginSuccess") {
        // 1 - hide the layer
        hideLayer()
        // cal back to the binded function
        loginSuccess.call();
	} else {
        // 1 - submit the form to the full reg page
        document.forms['userLoginForm'].action="/user/login";
        document.forms['userLoginForm'].submit();
	}
}

/* 
    function showLogInLayer(e)
    this function creates the same layer for login used in recipe detail pages. 
    e is the id of the element whose parent has the position where you want the layer to start.
    the click of this form goes to the lightRegLogin function
    note: the form below needs to be redone to remove styling dependencies with recipe detail pages.
*/
function showLogInLayer(e,loginSuccess) {

    var parent = $(e).parentNode;    

//    if(typeof(e)!='string'){parent = e.parentNode.parentNode;}

    
    var topPosition = parent.offsetTop + "px";
    // preload button image to prevent bug in IE6
    if (this.btnImage == undefined) {
            this.btnImage = new Image();
            this.btnImage.src = "/globalimages/opt/recipes/log_in.gif";
        }
        
        if($('registerLogin')==null) {
            
            var registerLoginNodeHTML = "";
            var registerLoginNode = "";
    
            registerLoginNodeHTML = "<iframe id='login_iframe' scrolling='no' frameborder='0'></iframe>" 
            registerLoginNodeHTML += '    <div id="signin">'
            registerLoginNodeHTML += '        <span style="background-color: #4a7cbc; overflow: hidden; display: block; height: 1px; margin: 0 4px 0 1px;"></span>'
            registerLoginNodeHTML += '        <h3>Member Sign In</h3>'
            registerLoginNodeHTML += '        <div class="sior_content" id="sior_signinform">'
            registerLoginNodeHTML += '        <form id="" name="userLoginForm" method="post" action="javascript:void(0);">'
            registerLoginNodeHTML += "               <input type='hidden' name='appAlias' value='profileComments' />";
            registerLoginNodeHTML += "               <input type='hidden' name='returnto' value='"+document.URL+"' />"
            registerLoginNodeHTML += '               <label for="sior_username">Email or Display Name</label>'
            registerLoginNodeHTML += '               <input name="username" id="sior_username" type="text"/>'
            registerLoginNodeHTML += '               <label for="sior_password">Password</label>'
            registerLoginNodeHTML += '               <input name="password" id="sior_password" type="password"/>'
            registerLoginNodeHTML += '               <label><input type="checkbox" value="true" name="rememberme" id="rememberMe"/> remember me next time</label>'
            registerLoginNodeHTML += '               <a href="javascript:void(0)" id="loginSubmit">sign in</a>';
            registerLoginNodeHTML += '            </form>'
            registerLoginNodeHTML += '            <a href="/user/forgot_password?returnto='+document.URL+'" id="sior_forgot">forgot sign-in information?</a>'
            registerLoginNodeHTML += '        </div>'
            registerLoginNodeHTML += '    </div>'
            registerLoginNodeHTML += '    <div id="register">'
            registerLoginNodeHTML += '        <span style="background-color: #ff6600; display: block; height: 1px; overflow: hidden;  margin: 0 4px 0 1px;"></span>'
            registerLoginNodeHTML += '        <h3>Not A Member?</h3>'
            registerLoginNodeHTML += '        <div class="sior_content" id="sior_join_offer">'
            registerLoginNodeHTML += '            <p>Join Epicurious to create a personal Recipe Box for saving and sharing recipes; you can also rate and review recipes and meet other food lovers in the Epicurious community.</p><p>It\'s fast and free.</p>'
            registerLoginNodeHTML += '            <a id="sior_joinnow" href="/user/registration?appAlias=profileComments&returnto='+document.URL+'">join now</a>'
            registerLoginNodeHTML += '        </div>'
            registerLoginNodeHTML += '    </div>'
            registerLoginNodeHTML += '    <div style="clear:both"></div>'
            registerLoginNodeHTML += '    <a id="close" href="#" onclick="hideLayer()">close</a>'
            registerLoginNodeHTML += '</div>'     
    
            registerLoginNode = document.createElement("div");
            registerLoginNode.id = 'registerLogin';
            if ( document.all ) {  
                registerLoginNode.style.filter="none";
            }
       
            //alert user if cookies are not enabled
            epiCookies.allowed();
        
            registerLoginNode.innerHTML = registerLoginNodeHTML;			
            parent.appendChild(registerLoginNode);
         } else {
               $('registerLogin').style.display="block";   
         }
         if ($('container')) {
             $('container').style.position = 'relative';
             $('container').style.zIndex = 201;
         }
        
         // bind event listeners
         Event.observe('loginSubmit', 'click', inlineEpiLogin.bind(this, loginSuccess));
         return void(0);
}

function hideLayer(){
    $('registerLogin').style.display="none";        
}

