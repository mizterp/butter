/*  NOTES:
        Fix saf 2 premature measurement (see init call)
*/
var isSafari = (navigator.userAgent. indexOf('WebKit')!=-1 ? true : false); //temp fix

function setCssOpacity(targetedElement, opacity) {
	opacity = (opacity == 100)?99.999:opacity;
	targetedElement.style.filter = "alpha(opacity: "+opacity+")";
	targetedElement.style.opacity = opacity/100;    
}
function resetCssOpacity(targetedElement) {
	targetedElement.style.filter = "alpha(opacity:)";
	targetedElement.style.opacity = 1;    
}


function Slider(args){
    var slider = this;
    this.args = args;
    this.setArgs();
    this.container = document.getElementById(args.containerId);
    this.contentWrapper = getElements('content_wrapper','DIV',this.container)[0];
    this.contentLists = this.container.getElementsByTagName('UL');
    this.setContext(0);
    //temp timing solution to prem. measurements
    if(isSafari){
        var slider = this;
       // runOnLoad(function( ){slider.initialize( )});
       window.setTimeout(function( ){slider.initialize( )}, 1000);
    }
    else this.initialize( );
	if(this.imageData){
		if(window.addEventListener) window.addEventListener('load', function(event){slider.loadHiddenImages(event)}, false);
		if(window.attachEvent) window.attachEvent('onload', function(event){slider.loadHiddenImages(event)});
	}
}
Slider.prototype.setArgs = function(){
    this.groupSize = this.args.groupSize;
    this.direction = this.args.direction;
    this.effectType = this.args.effect || false;
    this.hasGroupNav = (this.args.hasGroupNav === null) ? true : this.args.hasGroupNav; 
    this.hasLoop = this.args.hasLoop || false;
    this.speed = this.args.speed || 7;
    if(isSafari) this.speed--;
    this.imageData = this.args.imageData || null;
}
Slider.prototype.initialize = function(){
	if(this.numItems == 0) return;
    this.activeGroup = 1;
    this.assembleScrollControls();
    this.updateControlDisplay();
    this.setupLayout();
    this.speed = this.calculateSpeed(this.speed);
}
Slider.prototype.setContext = function(context_index){        
    this.contentList = this.contentLists[context_index];
    this.contentItems = this.contentList.getElementsByTagName('LI');
    this.numItems = this.contentItems.length;
    this.numGroups = Math.ceil(this.numItems/this.groupSize);
}
Slider.prototype.assembleScrollControls = function(){
    var slider = this;
	this.nextTrigger = this.createTrigger('slide_control_next');
	this.prevTrigger = this.createTrigger('slide_control_previous');
	if( this.numGroups > 1 ){
		if(window.addEventListener){
			this.nextTrigger.addEventListener("click", function(event){ slider.advance(1); }, false);
			this.prevTrigger.addEventListener("click", function(event){ slider.retract(1); }, false);
		}
		if(window.attachEvent){
			this.nextTrigger.attachEvent("onclick", function(event){ slider.advance(1); });
			this.prevTrigger.attachEvent("onclick", function(event){ slider.retract(1); });
		}
		if( this.hasGroupNav ){
			this.groupNav = this.createGroupNav();
			this.groupTriggers = this.groupNav.getElementsByTagName('A');
			for(var i=0; i<this.groupTriggers.length; i++){
				if(window.addEventListener)
					this.groupTriggers[i].addEventListener("click", function(event){ slider.switchGroup(event); }, false);
				if(window.attachEvent)
					this.groupTriggers[i].attachEvent("onclick", function(event){ slider.switchGroup(event); });
			}
		}
	}
}
Slider.prototype.createTrigger = function(){
    var triggerClass = arguments[0];
    var control = document.createElement('A');
    control.className = triggerClass;
    this.container.appendChild(control);
    return control;
}
Slider.prototype.createGroupNav = function(){
    var groupNav = document.createElement('DIV');
    groupNav.className = 'group_nav';
    this.container.appendChild(groupNav);
    for(var i=0; i<this.numGroups; i++){
        var navButton = document.createElement('A');
        navButton.className = 'group_activator';
        navButton.id = this.container.id + '_group_' + (i+1);
        groupNav.appendChild(navButton);
    }
    return groupNav;
}
Slider.prototype.updateControlDisplay = function(){
    if( this.hasGroupNav && this.numGroups >1 ) {
        for(var i=0; i<this.groupTriggers.length; i++)
            this.groupTriggers[i].className = '';
        this.groupTriggers[this.activeGroup - 1].className = 'active';
    }
    if( !this.hasLoop ){
        this.activeGroup == 1 ? this.prevTrigger.className += ' previous_disabled' : this.prevTrigger.className = 'slide_control_previous';
        this.activeGroup == this.numGroups ? this.nextTrigger.className += ' next_disabled' : this.nextTrigger.className = 'slide_control_next';
    }
}
Slider.prototype.destroyScrollControls = function(){
    this.groupNav ? this.groupNav.parentNode.removeChild(this.groupNav) : '';
    this.nextTrigger ? this.nextTrigger.parentNode.removeChild(this.nextTrigger) : '';
    this.prevTrigger ? this.prevTrigger.parentNode.removeChild(this.prevTrigger) : '';
    delete this.groupNav;
    delete this.nextTrigger;
    delete this.prevTrigger;
}
Slider.prototype.setupLayout = function(){
    this.itemWidth = this.getItemWidth();
    this.itemHeight = this.getItemHeight();
    switch(this.direction){
        case 'horizontal':
            this.groupWidth = this.setContentWrapperWidth();
            this.setScrollingListWidth();
            break;
        case 'vertical':
            this.groupHeight = this.setContentWrapperHeight(); break;
    }
}
Slider.prototype.getItemWidth = function(){return this.contentItems[0].offsetWidth}
Slider.prototype.getItemHeight = function(){return this.contentItems[0].offsetHeight}
Slider.prototype.calcuateScrollingListWidth = function(){return this.numItems * this.itemWidth}
Slider.prototype.setScrollingListWidth = function(){
    var activeListWidth = this.calcuateScrollingListWidth();
    this.contentList.style.width = activeListWidth + 'px';
}
Slider.prototype.setContentWrapperWidth = function(){
    this.contentWrapper.style.width = (this.itemWidth * this.groupSize) + 'px';
    return (this.itemWidth * this.groupSize)
}
Slider.prototype.setContentWrapperHeight = function(){    
    this.contentWrapper.style.height = (this.itemHeight * this.groupSize) + 'px';
    return (this.itemHeight * this.groupSize)
}
Slider.prototype.getPositionLeft = function(){
    var leftValue = parseInt(this.contentList.style.left) || 0;
    return leftValue;
}
Slider.prototype.getPositionTop = function(){
    var topValue = parseInt(this.contentList.style.top) || 0;
    return topValue;
}
Slider.prototype.advance = function(freq){    
    if( this.activeGroup == this.numGroups && !this.hasLoop ) return;
    var currentPosition = (this.direction == 'horizontal' ? this.getPositionLeft() : this.getPositionTop());
    var groupDimension = (this.direction == 'horizontal' ? this.groupWidth : this.groupHeight);
    if( currentPosition != 0 && Math.abs(currentPosition) % groupDimension != 0 ) return;
    var numScroll = freq || 1;
    var destinationPosition = currentPosition - (groupDimension * numScroll);
    var cssDirection = (this.direction == 'horizontal' ? 'left' : 'top');
    var contentList = this.contentList;
    var speed = this.speed;
    var slider = this;
    if( this.activeGroup == this.numGroups ){this.retract(this.numGroups - 1); return;}
    this.activeGroup = this.activeGroup + numScroll;
    if( this.effectType) this.effectStart();
    var clearer = setInterval(function(){
            if(currentPosition - speed >= destinationPosition){
                contentList.style[cssDirection] = (currentPosition-speed) + 'px';
                currentPosition = currentPosition - speed;
            }
            if(currentPosition == destinationPosition){ 
                clearInterval(clearer);
                if( slider.effectType ) slider.effectEnd();
            }
    },10);
    this.updateControlDisplay();
}
Slider.prototype.retract = function(freq){
    if( this.activeGroup == 1 && !this.hasLoop ) return;
    var currentPosition = (this.direction == 'horizontal' ? this.getPositionLeft() : this.getPositionTop());
    var groupDimension = (this.direction == 'horizontal' ? this.groupWidth : this.groupHeight);
    if( Math.abs(currentPosition) % groupDimension != 0 ) return;
    if( this.activeGroup == 1){ this.advance(this.numGroups - 1); return;}
    var numScroll = freq || 1;
    var destinationPosition = currentPosition + (groupDimension * numScroll);
    var cssDirection = (this.direction == 'horizontal' ? 'left' : 'top');
    var contentList = this.contentList;
    var speed = this.speed;
    var slider = this;
    this.activeGroup = this.activeGroup - numScroll;
    if( this.effectType) this.effectStart();
    var clearer = setInterval(function(){
            if(currentPosition + speed <= destinationPosition){ 
                contentList.style[cssDirection] = (currentPosition + speed) + 'px';
                currentPosition = currentPosition + speed;
            }
            if(currentPosition == destinationPosition){
                clearInterval(clearer);
                if( slider.effectType ) slider.effectEnd();
            }
    },10);
    this.updateControlDisplay();
}
Slider.prototype.switchGroup = function(event){
    var focusElement = event.currentTarget || event.srcElement;
    var startingGroup = this.activeGroup;
    var destinationGroup = focusElement.id.replace(/\D+/,'');
    var distance = Math.abs(startingGroup - destinationGroup);
    if( distance == 0 ) return;
    var direction = (startingGroup < destinationGroup ? 'advance' : 'retract');
    direction == 'advance' ? this.advance(distance) : this.retract(distance);
}
Slider.prototype.calculateSpeed = function(requestedSpeed){
    var adjustment = requestedSpeed - 1;
    var factors = new Array();
    var groupDimension = (this.direction == 'horizontal' ? this.groupWidth : this.groupHeight);
    for(var i=1; i<=groupDimension/2; i++)
        if( groupDimension%i == 0) factors.push(i);
    return adjustment < factors.length ? factors[adjustment] : factors[factors.length-1];
}
Slider.prototype.effectStart = function(){
    var firstItemIndex = (this.activeGroup-1) * this.groupSize;
    var lastItemIndex = (firstItemIndex + this.groupSize < this.contentItems.length ? firstItemIndex + this.groupSize : this.contentItems.length);
    for(var i=0; i<this.contentItems.length; i++)
        setCssOpacity(this.contentItems[i],20)
    for(var i=firstItemIndex; i<lastItemIndex; i++)
        setCssOpacity(this.contentItems[i], 99)
}
Slider.prototype.effectEnd = function(){
    for(var i=0; i<this.contentItems.length; i++)
        resetCssOpacity(this.contentItems[i])    
}
Slider.prototype.loadHiddenImages = function(){
    for(var i=this.groupSize; i<this.contentItems.length; i++)
        this.contentItems[i].getElementsByTagName('IMG')[0].src = this.imageData.urlPrefix + this.imageData.fileNames[i]
}
