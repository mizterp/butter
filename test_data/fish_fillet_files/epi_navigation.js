/*  esmiling 11/7/07  */

/*  Site/Navigation Sections
    ------------------------ */
    function navSection(args){
        this.dropTrigger = document.getElementById(args.dropTrigger);
        this.triggerArea = this.dropTrigger.parentNode; 
        this.dropList = document.getElementById(args.dropList);
        this.init();
    }
    navSection.prototype.openList = function(){
        this.dropTrigger.className = 'active';
        this.dropList.style.visibility = 'visible';
		//ie6 selectbox fix for sortmemebersfound ddbox issue
		if(Epi.users_browser=='ie6' && document.getElementById('sortmembersfound') && this.dropList.id =='community_dropdown' )
		{
			var ieiframe = document.createElement("iframe");
			ieiframe.setAttribute('id','ieiframe');
			ieiframe.style.position = 'absolute';
			ieiframe.style.zIndex = this.dropList.style.zIndex-1;
			ieiframe.frameBorder = 0;
			this.dropList.parentNode.insertBefore(ieiframe,this.dropList);
			ieiframe.style.width = (this.dropList.offsetWidth) +"px";
			ieiframe.style.height = (this.dropList.offsetHeight) +"px";
			ieiframe.style.left = (getCoordinates(this.dropList).x) + "px";
			ieiframe.style.left = (this.dropList.offsetLeft) + "px";
		}			
    }
	
    navSection.prototype.closeList = function(){
		if(document.getElementById('ieiframe'))
			this.dropList.parentNode.removeChild(document.getElementById('ieiframe'));
        this.dropList.style.visibility = 'hidden';
        this.dropTrigger.className = '';
    }
    navSection.prototype.init = function(){
        if (this.dropList.nodeName === "UL"){
	        var end_cap = document.createElement("span");
	        end_cap.className = "end_cap";
	        end_cap.style.position = "absolute";
	        end_cap.style.display = "block";
	        this.dropList.appendChild(end_cap.cloneNode(false));
        }
        var list_items = this.dropList.getElementsByTagName("LI");
        list_items[list_items.length - 1].className = "last";
    }

/*  Navigation Controller
    --------------------- */
    function epiNav(){
        this.dropdownContainer = document.getElementById('primary_navigation_dropdowns');
        var recipesMenus = new navSection({dropTrigger: 'recipesandmenus', dropList: 'recipesandmenus_dropdown'});
        var articlesGuides = new navSection({dropTrigger: 'articlesandguides', dropList: 'articlesandguides_dropdown'});
        var community = new navSection({dropTrigger: 'community_rgn', dropList: 'community_dropdown'});
        this.sections = [recipesMenus, articlesGuides, community];
        this.registerHandlers();
        searchInit();
    }
    epiNav.prototype.registerHandlers = function(){
        var controller = this;
        var openMethod = function(event){controller.openDropdown(event)};
        var closeMethod = function(event){controller.closeDropdown(event)};
        for(var i=0; i<this.sections.length; i++){
            if(window.addEventListener){
                this.sections[i].dropTrigger.addEventListener('mouseover', openMethod, false);
                this.sections[i].dropTrigger.addEventListener('mouseout', closeMethod, false);
                this.sections[i].dropList.addEventListener('mouseout', closeMethod, false);
            }
            if(window.attachEvent){
                this.sections[i].dropTrigger.attachEvent('onmouseover', openMethod);
                this.sections[i].dropTrigger.attachEvent('onmouseout', closeMethod);
                this.sections[i].dropList.attachEvent('onmouseout', closeMethod);
            }
        }
        if(window.addEventListener){
            window.addEventListener('unload', function(){
                for(var i=0; i<controller.sections.length; i++){
					controller.sections[i].dropTrigger.removeEventListener('mouseover', openMethod, false);
					controller.sections[i].dropTrigger.removeEventListener('mouseout', closeMethod, false);
					controller.sections[i].dropList.removeEventListener('mouseout', closeMethod, false);
                }
            }, false);
        }
    }
    epiNav.prototype.openDropdown = function(event){
        if(this.snavOpen) return;
		
		var activeTrigger = event.srcElement || event.currentTarget;
		this.dropdownContainer.style.display = 'block';
		
        for(var i=0; i<this.sections.length; i++)
            this.sections[i].dropTrigger == activeTrigger ? this.activeSection = this.sections[i] : this.sections[i].closeList();
        this.activeSection.openList();
		
    }
    epiNav.prototype.closeDropdown = function(event){
        if(this.snavOpen) return;
		
        var destinationElement = event.relatedTarget || event.toElement;
        if( isDescendant(this.dropdownContainer, destinationElement) ){
            this.activeSection.dropTrigger.className = 'open_inactive';
            return;
        }
        this.dropdownContainer.style.display = 'none';
		if(document.getElementById("sortmembersfound"))//here
			document.getElementById("sortmembersfound").style.visibility = 'visible';
        for(var i=0; i<this.sections.length; i++)
            this.sections[i].closeList();
        delete this.activeSection;
    }
    

    /* search */
    function searchInit(){
        var searchBox = document.getElementById("global_search_box");
        searchBox.onfocus = function(){
            if(this.value == this.defaultValue) this.value = ""; 
        }
    };
    
/*  Instantiation
    ------------- */
     
    var nav = new epiNav();
    setTimeout( function(){
        if(window.addEventListener) window.addEventListener('load', function(){nav.registerHandlers()}, false);
        if(window.attachEvent) window.attachEvent('onload', function(){nav.registerHandlers()});
    }, 1000); 
/*    var nav = new epiNav(); */

// gets real page position of an object
function getCoordinates(obj){
  	var posx = 0;
	var posy = 0;
	if (obj.offsetParent){
		do{
			posx += obj.offsetLeft;
			posy += obj.offsetTop;	
		}
		while (obj = obj.offsetParent)// while offsetParent is true
    }
	return {x:posx,y:posy}
}