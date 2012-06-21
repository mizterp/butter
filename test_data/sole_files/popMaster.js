var popAddress = '';
var popWidth = '';
var popHeight = '';
var popScrollbars = 'yes';
var popResizable = 'yes';

br=getBrowser();

function popMaster(name,type,queryString) {
var hostOverrideToUse = "";
if (typeof hostOverride == "string") {
	hostOverrideToUse = hostOverride;
}

    if (type == 'articleSlide') {
        popAddress = name;
        name = 'slideshow';
        popWidth = '910';
        popHeight = '570';
    }
    
    if (type == 'slideshow') {
        popAddress = '/recipesmenus/slideshows/' + name;
        popWidth = '880';
        popHeight = '570';
        popScrollbars = 'no';
        popResizable = 'no';
    }
	
	 

    if (type == 'default') {
    
        if (name =='disclaimerPop') {
            popAddress = '/popups/community/disclaimer.html';
            popWidth = '530';
            popHeight = '620';
        }
		
		 if (name =='tailgatingPop') {
            popAddress = '/community/contest/rules';
            popWidth = '530';
            popHeight = '620';
        }
        
		if (name == 'tour') {
       		 popAddress = '/popups/tour/index.html';
       		 popWidth = '880';
      		 popHeight = '580';
			 popScrollbars = 'no';
        	 popResizable = 'no';
    }
    		
        if (name == 'tipsPop') {
            popAddress = '/popups/community/tips.html';
            popWidth = '710';
            popHeight = '600';
        }
        
        if (name == 'arsCategories') {
            popAddress = '/popups/searchinfo/categories.html';
            popWidth = '525';
            popHeight = '325';
        }    
        
        if (name == 'arsDietary') {
            popAddress = '/popups/searchinfo/dietaryconsid.html';
            popWidth = '525';
            popHeight = '675';
        }
            
        if (name == 'arsExclude') {
            popAddress = '/popups/searchinfo/exclude.html';
            popWidth = '525';
            popHeight = '275';
        }
        
        if (name == 'feedback') {
            popAddress = '/services/feedback/general';
            popWidth = '510';
            popHeight = '700';
        }    
        
        if (name == 'technical') {
            popAddress = '/services/help/technical';
            popWidth = '510';
            popHeight = '700';
        } 

		if (name == 'eventsNL') { 
			popAddress = 'http://www.condenet.com/promo/epicurious/sweeps/nlsubformtest/entry/'; 
			popWidth = '510'; 
			popHeight = '600'; 
        } 

        if (name == 'videoupload') {
            popAddress = '/services/help/videoupload';
            popWidth = '510';
            popHeight = '700';
        }

        if (name == 'registration_form') {
            popAddress = '/services/help/registration_form';
            popWidth = '510';
            popHeight = '700';
        }  
      
         if (name == 'rsvp') {
            popAddress = '/bonappetit/contact/rsvp';
            popWidth = '465';
            popHeight = '700';
        } 
        
         if (name == 'inappropriate') {
            popAddress = hostOverrideToUse +'/services/reportproblem/submit';
            switch(br[0]){
                case "firefox":
                    popWidth = '504';
                    popHeight = '566';
                    break;    
                case "safari":
                    popWidth = '500';
                    popHeight = '562';
                    break;
                case "msie":
                    popWidth = '521';
                    popHeight = '571';
                    break; 
                default:
                    popWidth = '510';
                    popHeight = '564';
                  
            }
        }
                  
    }
    
    //window.open(popAddress,name,'toolbar=no,location=0,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width='+popWidth+',height='+popHeight);
    if (typeof queryString != 'undefined') {
        popAddress += "?" + queryString;
    }
    window.open(popAddress,name,'toolbar=no,location=0,directories=no,status=no,menubar=no,scrollbars='+popScrollbars+',resizable='+popResizable+',width='+popWidth+',height='+popHeight);
}

function popWindow(address,name,scroll,resize,width,height) { 
       var detWindow="" 
       //set defaults for width and height
       width = (width=="")?'1026':width;
       height = (height=="")?'880':height;
       detWindow=window.open(address,name,'toolbar=no,location=0,directories=no,status=no,menubar=0,scrollbars=' + scroll + ',resizable=' + resize +',width=' + width + ',height=' +height);
}