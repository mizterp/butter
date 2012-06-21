tabbedNav = document.getElementById("recipe_nav");

tabs = tabbedNav.getElementsByTagName("A");

for(var i=0; i<tabs.length; i++){
    createTab(tabs[i]);
    
/*temp handling of ie6 trouble*/
    var brwsr = {
        version: parseInt(navigator.appVersion),
        isMicrosoft: navigator.appName.indexOf("Microsoft") != -1
    };
    if(brwsr.isMicrosoft == true){
        if(brwsr.version <=6){dealWithIE6(tabs[i]);}
    }
}

function createTab(tab){
    
    tab_header = document.createElement("div");
    tab_header.className = "tab_header";
    
    border_span = document.createElement("span");
    border_span.className = "border";
    
    inner_stroke_span = document.createElement("span");
    inner_stroke_span.className = "inner_stroke";
    
    tab_header.appendChild(border_span);
    tab_header.appendChild(inner_stroke_span);
    
    tab.parentNode.insertBefore(tab_header, tab);
    
    if(tab.className=="current"){
        tab_header.style.position = "relative";
        tab_header.style.top = getStyle(tab,"top");
        inner_stroke_span.style.backgroundColor = "white";
    }
    
    /*read and assign*/
    border_span.style.backgroundColor = getStyle(tab,"border-top-color");
    tab.style.borderTop = "none";
}

function dealWithIE6(ie6tab){ //an anchor
    tab_header.style.width = ie6tab.offsetWidth + "px";
}
