






function include(library) {
    var js = document.createElement('script');
    js.setAttribute('language', 'javascript');
    js.setAttribute('type', 'text/javascript');
    js.setAttribute('src', library);
    if (document.getElementsByTagName('head')) {
        document.getElementsByTagName('head').item(0).appendChild(js);
    } else {
        document.appendChild(js);
    }
}
// adapted from http://www.eggheadcafe.com/articles/20020107.asp
var QueryString = {
    getValue: function(key) {
        var keyValuePairs = QueryString.parseQueryString();
        for(var j=0; j < keyValuePairs.length; j++) {
            if (keyValuePairs[j].split("=")[0] == key)
                return unescape(keyValuePairs[j].split("=")[1]);
        }
        return false;
    },
    getKeyValuePairs: function() {
        return QueryString.parseQueryString;
    },
    getParameters: function() {
        var a = new Array(QueryString.getLength());
        var keyValuePairs = QueryString.parseQueryString;
        for(var j=0; j < keyValuePairs.length; j++) {
            a[j] = unescape(keyValuePairs[j].split("=")[0]);
        }
        return a;
    },
    getLength: function() {
        return QueryString.parseQueryString.length;
    },
    parseQueryString: function() {
        if (QueryString.keyValuePairs == undefined) {
            var q = window.location.search;
            if (q.length > 1) {
                q = q.substring(1, q.length);
            } else {
                q = null;
            }
            QueryString.keyValuePairs = new Array();
            if (q) {
                for(var i=0; i < q.split("&").length; i++) {
                    QueryString.keyValuePairs[i] = q.split("&")[i];
                }
            }
        }
        return QueryString.keyValuePairs;
    }
};

Event._prototypeObserve = Event.observe;
Event.observe = function(element, name, observer, useCapture) {
    if ($(element).addEventListener || $(element).attachEvent) {
        Event._prototypeObserve(element, name, observer, useCapture);
    } else {
        // borrowed from prototype's Event.observe
        if (name == 'keypress' && (navigator.appVersion.match(/Konqueror|Safari|KHTML/))) {
            name = 'keydown';
        }

        var theEvent = 'on' + name;
        var theHandler = $(element)[theEvent];
        if (typeof theHandler == 'function') {
            $(element)[theEvent] = function() {
                observer();
                theHandler();
            };
        } else {
            $(element)[theEvent] = observer;
        }
    }
}

Object.getterAndSetter = function(varName) {
    var __varName = varName;
    return function(value) {
        if (typeof value != 'undefined') {
            this[__varName] = value;
        } else {
            return this[__varName];
        }
    };
};

Array.getterAndSetter = function(varName) {
    var __varName = varName;
    return function(values) {
        if (typeof values != 'undefined') {
            this[__varName] = [];
            this[__varName] = this[__varName].concat(values);
        } else {
            return this[__varName];
        }
    };
};

var AppController = {
    currentId: 0,
    _plugins: {},
    addPlugin: function(pluginName, pluginType) {
        AppController._plugins[pluginName] = pluginType;
    },
    getPluginFor: function(pluginName) {
        var selectedPlugin =  AppController._plugins[pluginName];
        if (selectedPlugin == undefined) {
            return "DOMComponent";
        } else {
            return selectedPlugin;
        }
    },
    GenericTarget: {
        type: "GENERIC_TARGET_TYPE",
        createComponent: function() {
            // Expecting params: componentType, model
            var params = $A(arguments).flatten();
            var newComponent = eval("new " + params[0] +
                    "(params[1] || AppController.getNextId(), new JSModel(params[2]))");
            AppController.addComponent(newComponent, AppController.GenericTarget.type, newComponent.id());
            return newComponent;
        }
    },
    DOMTarget: {
        type: "DOM_TARGET_TYPE",
        createComponent: function() {
            // Expecting params: componentType, DOM element id, model
            var params = $A(arguments).flatten();
            var element = $(params[1]);
            // Make DOM element if it doesn't exist
            if (element == undefined) {
                element = document.createElement(params[2].elementType);
                element.setAttribute("id", params[1]);
            }
            var newComponent = eval("new " + params[0] + "(new JSView(element), new JSModel(params[2]))");
            AppController.addComponent(newComponent, AppController.DOMTarget.type, params[1]);
            return newComponent;
        }
    },
    ClassTarget: {
        type: "CLASS_TARGET_TYPE",
        createComponent: function() {
            // Expecting params: componentType, class identifier, model
            var params = $A(arguments).flatten();
            var newComponent = eval("new " + params[0] + "(new JSView(document.getElementsByClassName(params[1]), new JSModel(params[2]))");
            AppController.addComponent(newComponent, AppController.ClassTarget.type, params[1]);
            return newComponent;
        }
    },
    URLTarget: {
        type: "URL_TARGET_TYPE"
    },
    FunctionTarget: {
        type: "FUNCTION_TARGET_TYPE"
    },
    _targets: [],
    getTarget: function(theType) {
        var theTarget = AppController._targets.find(function(aTarget) {
            return aTarget.type == theType;
        });
        return theTarget || AppController.GenericTarget;
    },
    _controlledComponents: {},
    _initComponents: {},
    getComponents: function(type) {
        if (type == undefined) return AppController._controlledComponents;
        return AppController._controlledComponents[type];
    },
    getComponent: function(type, id) {
        if (type != undefined && id != undefined &&
                AppController._controlledComponents[type] != undefined) {
            return AppController._controlledComponents[type][id];
        }
    },
    addComponent: function(component, viewType, id) {
        if (AppController._controlledComponents[viewType] == undefined) {
            AppController._controlledComponents[viewType] = {};
        }
        AppController._controlledComponents[viewType][id] = component;
    },
    removeComponent: function(type, id) {
        if (type != undefined) {
            if (id != undefined) {
                delete AppController._controlledComponents[type][id];
            } else {
                delete AppController._controlledComponents[type];
            }
        }
    },
    initComponent: function() {
        // First argument should be the component target type, the rest depend on the type:
        // DOM_TARGET_TYPE: the component name, the DOM element ID of the view, the initial model
        // CLASS_TARGET_TYPE: the component name, the name of the class for all elements comprising the view, the inital model
        // GENERIC_TARGET_TYPE: the component name, the initial model (use for composite components)
        var args = $A(arguments), targetType = args.shift(), initArray = args;
        if (AppController._initComponents[targetType] == undefined) {
            AppController._initComponents[targetType] = [];
        }
        AppController._initComponents[targetType].push(initArray);
    },
    doInit: function(targetType, componentType, viewId, model) {
        for (var initType in AppController._initComponents) {
            if (targetType == undefined || targetType == initType) {
                var partitioned = AppController._initComponents[initType].partition(function(next) {
                    return componentType == undefined || componentType == next[0];
                });
                // Initialize components specified by type or all if none specified
                partitioned[0].each(function(initArray) {
                    // Override using local viewId and model if present
                    if (viewId != undefined || model != undefined) {
                        initArray[1] = viewId;
                        initArray[2] = model;
                    }
                    var newComponent = AppController.getTarget(initType).createComponent(initArray);
                    // For components that want some initialization via AJAX
                    if (AppController._implements(newComponent, "initialState")) {
                        newComponent.initialState();
                    }
                });
                // Save all others for general on load initialization
                AppController._initComponents[initType] = partitioned[1];
            }
        }
    },
    handleInit: function(event) {
        AppController.doInit();
    },
    _defaultExceptionHandler: {
        handleException: function() {
            document.location = "http://www.epicurious.com"; //todo add better excceptionhandling for default case
        }
    },
    _exceptionHandlers: {},
    getExceptionHandler: function(exceptionType) {
        if (AppController._exceptionHandlers[exceptionType] != undefined) {
            return AppController._exceptionHandlers[exceptionType];
        } else {
            return AppController._exceptionHandlers[DEFAULT_EXCEPTION_HANDLER];
        }
    },
    addExceptionHandler: function(exceptionType, exceptionHandler) {
        AppController._exceptionHandlers[exceptionType] = exceptionHandler; // exceptionHander is an object with method handleException
    },
    addCallbackParams: function(model, params) {
        model.callbackParams = params;
        return model;
    },
    getNextId: function() {
        // using underscore to not break javascript property id rules
        return "_" + (++AppController.currentId);
    },
    _implements: function(obj, funcName) {
        return obj && obj[funcName] && obj[funcName] instanceof Function;
    },
    isView: function(obj) {
        return AppController._implements(obj, 'elements');
    },
    isExceptionHandler: function(obj) {
        return AppController._implements(obj, 'handleException');
    },
    hasProp: function(obj, propName) {
        return obj && obj[propName] && (obj[propName] != undefined);
    },
    bindCallbackArgs: function() {
        var callbackArgs = $A(arguments);
        return function(dwrResponse) {
            callbackArgs.unshift(dwrResponse);
            AppController.handleResponse.apply(AppController, callbackArgs);
        }
    },
    handleResponse: function() {
        var args = $A(arguments);
        // first argument is returned object from AJAX call
        var modelAndView = args.shift();
        // the rest of the arguments if they exist are call back params to be added to the model
        var callbackParams = args;
        if (AppController.hasProp(modelAndView, "clientModelAndViews")) { // this is a clientModelAndViewSet
            var modelAndViews = modelAndView.clientModelAndViews;
            for (i = 0; i < modelAndViews.length; i++) {
                var curModelAndView = modelAndViews[i];
                var curModel = AppController.addCallbackParams(curModelAndView.clientModel, callbackParams);
                var clientViews = curModelAndView.clientViews;
                AppController.handleModelAndView(curModel, clientViews);
            }
        } else if (AppController.hasProp(modelAndView, "clientModel")) {
            // this is just a ClientModelAndView -- not a clientModelAndViewSet
            AppController.handleModelAndView(AppController.addCallbackParams(modelAndView.clientModel, callbackParams), modelAndView.clientViews);
        } else if (AppController.hasProp(modelAndView, "exception")) {
            // there are exception handlers for specific exception types
            // if we find a type we call that exception function -- otherwise, we call default exception handler
            //check first if exception has a property of exceptionHandler, and if so, execute it.
            var exceptionHandler;
            if (AppController.hasProp(modelAndView.exception, "exceptionHandler")) {
                // there is an exceptionHandler defined in object
                exceptionHandler = eval(modelAndView.exception.exceptionHandler);
            } else {
                // just call the correct exception handler
                exceptionHandler = AppController.getExceptionHandler(modelAndView.exception.exceptionType);
            }
            exceptionHandler.handleException.apply(exceptionHandler, callbackParams); // call exceptionHandler implementation
        }
    },
    handleModelAndView: function(clientModel, clientViews){
        var curModel = clientModel;
        for (j = 0; j < clientViews.length; j++) {
            var curView = clientViews[j];
            // First, handle special target types
            if (curView.targetType == AppController.URLTarget.type) {
                // this is a url update -- immediately redirect
                document.location = curView.viewIdentifier; // this should probably be specified in model instead
                return;
            } else if (curView.targetType == AppController.FunctionTarget.type) {
                // TODO: implement
            } else {
                var componentType = AppController.getPluginFor(clientModel.modelType);
                var curComponent = AppController.getComponent(curView.targetType,
                        curView.viewIdentifier);
                if (curComponent == undefined) {
                    curComponent = AppController.getTarget(curView.targetType).createComponent(
                            componentType, curView.viewIdentifier, curModel);
                } else {
                    curComponent.model(new JSModel(curModel));
                }
                curComponent.render();
            }
        }
    }
};
// Initalize some of AppController's collections
AppController._targets = [AppController.GenericTarget, AppController.DOMTarget,
        AppController.ClassTarget, AppController.URLTarget, AppController.FunctionTarget];
AppController.addExceptionHandler("DEFAULT_EXCEPTION_HANDLER",
        AppController._defaultExceptionHandler);

// Setup app controller to init all specified components on page load
Event.observe(window, 'load', AppController.handleInit);

var JSView = Class.create();
JSView.prototype = {
    initialize: function(element) {
        this.elements(element);
    },
    elements: Array.getterAndSetter("_elements")
};

var DOMView = Class.create();
Object.extend(Object.extend(DOMView.prototype, JSView.prototype), {
    initialize: function(elementId, elementType) {
        var element = $(elementId);
        if (!element && elementType != undefined) {
            element = document.createElement(elementType);
            element.id = elementId;
        }
        JSView.prototype.initialize.call(this, element);
    },
    element: function(element) {
        if (element != undefined) {
            this.elements(element);
        } else {
            return this.elements().first();
        }
    }
});

var JSModel = Class.create();
JSModel.prototype = {
    initialize: function(model) {
        for (var property in model) {
            this[property] = model[property];
        }
    },
    add: function(model) {
        for (var property in model) {
            this[property] = model[property];
        }
    }
};

Abstract.JSComponent = function() {};
Abstract.JSComponent.prototype = {
    initialize: function(view, model) {
        if (AppController.isView(view)) {
            this.view(view);
        }
        this.model(model || new JSModel());
    },
    view: Object.getterAndSetter("_view"),
    model: Object.getterAndSetter("_model"),
    render: function() {
        var elements = this.view().elements();
        elements.each(this._render.bind(this));
    },
    _render: function() {
        // Stub
    }
};

var DOMComponent = Class.create();
DOMComponent.prototype = Object.extend(new Abstract.JSComponent(), {
    _render: function(element) { //element is an item in elements called by "each" closure in abstract Component
        if (AppController.hasProp(this.model(), "styles")) {
            this._applyAttributes(element, {"style": this.model()["styles"]}, "style");
        }
        if (AppController.hasProp(this.model(), "classes")) {
            var classString = this.model()["classes"].join(" ");
            this._applyAttributes(element, {"className": classString}, "className");
        }
        if (AppController.hasProp(this.model(), "attributes")) {
            for (k = 0; k < this.model().attributes.length; k++) {
                element.setAttribute(curModel.attributes[k].name, curModel.attributes[k].value);
            }
        } if (AppController.hasProp(this.model(), "events")) {
            for (k = 0; k < this.model().events.length; k++) {
                var curEvent = this.model().events[k];
                var handlerName = curEvent.eventName;
                var functionRef = null;
                if (curEvent.handler.functionScript == undefined) {
                    // no script defined, so just use reference
                    if (curEvent.handler.functionContext == undefined) {
                        functionRef = eval(curEvent.handler.functionContext + "." + curEvent.handler.functionName);
                    } else {
                        functionRef = eval(curEvent.handler.functionName);
                    }
                } else {
                    // create a new dynamic function
                    functionRef = new Function(curEvent.handler.functionScript);
                }
                this.view().elements.each(function(curElement) {
                     Event.observe(curELement, handlerName, functionRef.bindAsEventListener(), false);
                });
            }
        } if (AppController.hasProp(this.model(), "childNodes")) {
            //todo implement childNodes -- useElement
        } if (AppController.hasProp(this.model(), "innerHTML")) {
            this._applyAttributes(element, {"innerHTML": this.model().innerHTML}, "innerHTML");
        } else {
            //todo add catchall for model types not specified here.
        }
        for (var i in this.model()) {
            var viewAtt = element[i];
            if (typeof viewAtt == 'function') {
                viewAtt.apply(element, this.model()[i]);
            }
        }
    },
    _applyAttributes:  function(toObject, fromObject, att) {
        var hasProps = false;
        if (typeof fromObject[att] == 'object') {
            for (var prop in fromObject[att]) {
                hasProps = true;
                break;
            }
        }
        if (hasProps) {
            var toObjectAtt = toObject[att];
            if (typeof toObjectAtt == 'undefined' || !toObjectAtt instanceof Array) {
                toObject[att] = [];
            }
            for (var i in fromObject[att]) {
                this._applyAttributes(toObject[att], fromObject[att], i);
            }
        } else {
            toObject[att] = fromObject[att];
        }
    }
});

var CompositeComponent = Class.create();
CompositeComponent.prototype = {
    initialize: function(id, model) {
        this.id(id);
        this.model(model || new JSModel());
    },
    components: Array.getterAndSetter("_components"),
    addComponent: function(component) {
        if (component != undefined) {
            this.components(this.components().concat(component));
        }
    },
    removeComponent: function(component) {
        if (component != undefined) {
            this.components(this.components().without(component));
        }
    },
    get: function(component) {
        var theComponents = this.components();
        return theComponents.find(function(aComponent) {
            return aComponent == component;
        });
    },
    id: Object.getterAndSetter("_id"),
    model: Object.getterAndSetter("_model"),
    componentModel: function(component, model) {
        var theComponent = this.get(component);
        return theComponent ? theComponent.model(model) : false;
    },
    componentView: function(component, view) {
        var theComponent = this.get(component);
        return theComponent ? theComponent.view(view) : false;
    },
    render: function() {
        this.components().each(function(aComponent) {
            aComponent.render();
        });
    }
};

var SelectComponent = Class.create();
SelectComponent.prototype = Object.extend(new DOMComponent, {
    _render: function(element){
        DOMComponent._render(); //do we need to use bind, or is this the correct context?
           for (i = 0; i < this.model().selectOptions.length; i++) {
                if (element.options) element.options.length = 0; //clear select element
               var curOption = this.model().selectOptions[i];
               var curHtmlOption = new Option(curOption.optionLabel, curOption.optionValue, false, option.selected);
               element.options[element.options.length] = curHtmlOption;
           }
        }

});

var ContentComponent = Class.create();
ContentComponent.prototype = Object.extend(new DOMComponent(), {
    initialize: function(view, content) {
        DOMComponent.prototype.initialize.call(this, view);
        this.content(content);
    },
    content: function(content) {
        if (content != undefined) {
            this.model().innerHTML = content;
        } else {
            return this.model().innerHTML;
        }
    }
});

var SimpleFormComponent = Class.create();
SimpleFormComponent.prototype = Object.extend(new DOMComponent, {
    _render: function(element) {
        DOMComponent.prototype._render.call(this, element);
        for (var prop in this.model()) {
            if (element[prop] != undefined && element[prop].value != undefined) {
                element[prop].value = this.model()[prop];
            }
        }
    }
});
var FormModel = {
    get: function(form) {
        var elements = Form.getElements(form);
        var theModel = {};
        elements.each(function(element) {
            if (element.type != 'submit' && element.type != 'button') {
                var value = Form.Element.getValue(element);
                if (value) theModel[element.name] = value;
            }
        });
        return theModel;
    },
    put: function(form, model) {
        var elements = $A($(form).elements);
        elements.each(function(element) {
            var property = element.name;
            if (model[property] != undefined && element.type != undefined ) {
                switch(element.type.toLowerCase()) {
                    case 'checkbox':
                    case 'radio':
                        if (element.value == model[property]) {
                            element.checked = true;
                        }
                        break;
                    case 'select-one':
                    case 'select-multiple':
                        for (i = 0; i < element.options.length; i++) {
                            if (element.options[i].value == model[property]) {
                                element.options[i].selected = true;
                            }
                        }
                        break;
                    default:
                        element.value = model[property];
                        break;
                }
            }
        });
    }
};

var HideableComponent = Class.create();
HideableComponent.prototype = Object.extend(new DOMComponent(), {
    initialize: function(view, model) {
        model != undefined && model.displayType != undefined ? this.displayType(model.displayType) : this.displayType("");
        DOMComponent.prototype.initialize.call(this, view, model);
    },
    displayType: Object.getterAndSetter("_displayType"),
    show: function() {
        this.model(new JSModel({styles: {display: this.displayType()}}));
    },
    hide: function() {
        this.model(new JSModel({styles: {display: "none"}}));
    }
});

var EventBroker = {
    _eventListeners: {},
    addEventListener: function(eventType, context, handler, handlerName, errorHandler) {
        if (EventBroker._eventListeners[eventType] == undefined) {
            EventBroker._eventListeners[eventType] = [];
        }
        EventBroker._eventListeners[eventType].push({context: context, handler: handler, handlerName: handlerName,
                errorHandler: errorHandler});
    },
    removeEventListener: function(eventType, context) {
        if (EventBroker._eventListeners[eventType] != undefined) {
            EventBroker._eventListeners[eventType] = EventBroker._eventListeners[eventType].findAll(function(listener) {
                return listener.context.id != context.id;
            });
            if (EventBroker._eventListeners[eventType].length == 0) {
                delete EventBroker._eventListeners[eventType];
            }
        }
    },
    notifyListeners: function() {
        var args = $A(arguments), response = args.pop(), callbackParams = args;
        // Handle multiple events, one at a time
        if (response.events != undefined) {
            response.events.each(function(event) {
                EventBroker.notifyListenersOfEvent(event, callbackParams);
            });
        // Otherwise, handle single event
        } else if (response.eventType != undefined) {
            EventBroker.notifyListenersOfEvent(response, callbackParams);
        }
    },
    notifyListenersOfEvent: function(event, callbackParams) {
        var listeners = EventBroker._eventListeners[event.eventType];
        // put event as first argument
        callbackParams.unshift(event);
        if (listeners && listeners.each) {
            listeners.each(function(listener) {
                try {
                    if (RecipeDetails.testHandler && RecipeDetails.testHandler == listener.handlerName) {
                        throw new Error("This is a test error");
                    }
                    listener.handler.apply(listener.context, callbackParams);
                } catch (e) {
                    e.handlerName = listener.handlerName;
                    e.eventType = event.eventType;
                    if (typeof listener.errorHandler == 'function') {
                        listener.errorHandler(e);
                        throw $break;
                    } else {
                        throw e;
                    }
                }
            });
        }
    }
};

var ClientEvent = Class.create();
ClientEvent.prototype = {
    initialize: function(eventType, model) {
        this.eventType = eventType;
        Object.extend(this, model);
    }
};

var EventListener = Class.create();
EventListener.prototype = {
    initialize: function() {
        if (this.id == undefined) {
            var random = Math.floor(Math.random() * 10001);
            this.id = (random + "_" + new Date().getTime()).toString();
        }
    }
};

var DOMElement = {
    get: function(elementId, type) {
        if ($(elementId)) {
            return $(elementId);
        } else {
            var element = document.createElement(type);
            element.id = elementId;
            return element;
        }
    }
};

Object.extend(Element, {
    showWithType: function(element, displayType) {
        $(element).style.display = displayType || '';
    },
    background: function(element, background) {
        $(element).style.background = background;
    },
    swap: function(toElements, fromElements) {
        var toArray, fromArray;
        if (toElements instanceof Array){
            toArray = toElements;
        } else {
            toArray = [];
            toArray.push(toElements);
        }
        if (fromElements instanceof Array){
            fromArray = fromElements;
        } else {
            fromArray = [];
            fromArray.push(fromElements);
        }
        var inserted = false;
        for (var i = 0; i < fromArray.length; i++) {
            var fromNode = $(fromArray[i]);
            if (fromNode) {
                if (!inserted) {
                    for (var j = 0; j < toArray.length; j++) {
                        if ($(toArray[i])) {
                            fromNode.parentNode.insertBefore($(toArray[i]), fromNode);
                        }
                    }
                    inserted = true;
                }
                fromNode.parentNode.removeChild(fromNode);
            }
        }
    }
});

include('/dwr/util.js');

    include('/dwr/interface/RecipeRatingsManager.js');

    include('/dwr/interface/RecipeReviewsManager.js');

    include('/dwr/interface/LoginManager.js');



var RecipeDetails = {};
RecipeDetails.handleError = function(exception) {

    var errorMsg = "\n\n## Please add your message above this line ##\n\n";

    if (typeof exception.eventType != 'undefined') {
        errorMsg += "Error occurred when processing a " + exception.eventType + "\n\n";
    }



    for (prop in exception) {
       errorMsg += "exception." + prop + ": " + exception[prop] + "\n";
    }

    var leaveFeedback = confirm(RecipeDetails.userMessage);
    if (leaveFeedback) {
        popMaster('technical', 'default', 'messageText=' + encodeURIComponent(errorMsg));
    }

}
DWREngine.setErrorHandler(RecipeDetails.handleError);


var AjaxLoginException = {
    handleException: function(element) {
        registerLogin(element);
    }
};
AppController.addExceptionHandler("AjaxLoginException", AjaxLoginException);

var PopupManager = {
    PopupEvent: "PopupEvent",
    show: function() {
        var args = $A(arguments), popupEventListener = args.shift();
        EventBroker.notifyListeners(new ClientEvent(PopupManager.PopupEvent, {
                target: popupEventListener.popableElement}));
        popupEventListener.show.apply(popupEventListener, args);
    },
    closeAll: function() {
        EventBroker.notifyListeners(new ClientEvent(PopupManager.PopupEvent));
    }
}

var PopupEventListener = Class.create();
PopupEventListener.prototype = {
    initialize: function(popableElement) {
        EventListener.prototype.initialize.call(this);
        this.popableElement = popableElement;
        EventBroker.addEventListener(PopupManager.PopupEvent, this,
                this.handlePopup, "PopupEventListener.handlePopup", RecipeDetails.handleError);
    },
    handlePopup: function(popupEvent) {
        if (this.isVisible()) {
            this.doClose(popupEvent);
        }
    },
    isVisible: function() {
        if ($(this.popableElement)) {
            return Element.visible(this.popableElement);
        } else {
            return false;
        }
    },
    doClose: function(popupEvent) {
        Element.hide(this.popableElement);
    },
    show: function(displayType) {
        Element.showWithType(this.popableElement, displayType || "")
    }
};

var LoginEventListener = Class.create();
LoginEventListener.prototype = {
    initialize: function(recipeId, loginRequired, name) {
        EventListener.prototype.initialize.call(this);
        this.recipeId = recipeId;
        if (name != undefined) {
            this.name = name;
        } else {
            this.name = 'AnonymousLoginEventListener';
        }
        if (loginRequired != undefined) this.loginRequired = loginRequired;
        EventBroker.addEventListener("UserLoggedInEvent", this,
                this.handleUserLoggedIn, this.name + ".handleUserLoggedIn", RecipeDetails.handleError);
        EventBroker.addEventListener("NoUserLoggedInEvent", this,
                this.handleNoUserLoggedIn, this.name + ".handleNoUserLoggedIn", RecipeDetails.handleError);
    },
    handleUserLoggedIn: function() {
        return void(0);
    },
    handleNoUserLoggedIn: function() {
        return void(0);
    },
    loginRequired: true,
    checkLogin: function(callingElement, returnToUrl) {
        ClientLoginManager.checkLogin(this.recipeId, callingElement, this, returnToUrl);
    },
    appAlias: ''
};

var ClientLoginManager = {};
Object.extend(Object.extend(ClientLoginManager, LoginEventListener.prototype), {
    initialize: function(recipeId) {
        LoginEventListener.prototype.initialize.call(ClientLoginManager, recipeId, false, "ClientLoginManager");
        ClientLoginManager.username = getCookie("amg_user_info");
        ClientLoginManager.userLoggedIn = ClientLoginManager.username != null;
        // get user specific info if logged in
        if (ClientLoginManager.userLoggedIn) {
            ClientLoginManager.checkLogin(recipeId);
        } else {
            ClientLoginManager.cachedEvent = {
                eventType: "NoUserLoggedInEvent"
            };
            ClientLoginManager.loginStatusCached = true;
        }
    },
    userLoggedIn: false,
    loginStatusCached: false,
    handleUserLoggedIn: function(theEvent) {
        ClientLoginManager.cacheStatus(theEvent, true);
    },
    handleNoUserLoggedIn: function(theEvent) {
        ClientLoginManager.cacheStatus(theEvent, false);
    },
    cacheStatus: function(theEvent, loginStatus) {
        ClientLoginManager.userLoggedIn = loginStatus;
        ClientLoginManager.cachedEvent = theEvent;
        ClientLoginManager.loginStatusCached = true;
    },
    checkLogin: function(recipeId, callingElement, targetElement, returnToUrl) {
        if (ClientLoginManager.loginStatusCached) {
            EventBroker.notifyListeners(callingElement, targetElement, returnToUrl,
                    ClientLoginManager.cachedEvent);
        } else {
            LoginManager.checkLoginForRecipeDetails(ClientLoginManager.username, recipeId,
                    EventBroker.notifyListeners.bind(EventBroker,
                    callingElement, targetElement, returnToUrl));
        }
    },
    setUserHasNotes: function(userHasNotes) {
        if (ClientLoginManager.cachedEvent) {
            if (ClientLoginManager.cachedEvent.userHasNotes != userHasNotes) {
                ClientLoginManager.cachedEvent.userHasNotes = userHasNotes;
                EventBroker.notifyListeners(ClientLoginManager.cachedEvent);
            }
        }
    },
    setUserIsOwner: function(userIsOwner) {
        if (ClientLoginManager.cachedEvent) {
            if (ClientLoginManager.cachedEvent.userIsOwner != userIsOwner) {
                ClientLoginManager.cachedEvent.userIsOwner = userIsOwner;
                EventBroker.notifyListeners(ClientLoginManager.cachedEvent);
            }
        }
    }
});

var CacheableDWR = {
    path: "/dwrcache",
    makeRequest: function() {
        // 1st param is scriptName, 2nd param is methodName
        var args = $A(arguments);
        var scriptName = args.shift();
        var methodName = args.shift();

        DWREngine.beginBatch();
        DWREngine._execute(CacheableDWR.path, scriptName, methodName, args);
        CacheableDWR.makeBatchCacheable();
        DWREngine.endBatch();
    },

    makeBatchCacheable: function() {
        var batch = DWREngine._batch;
        batch.verb = "GET";
        batch.path = CacheableDWR.path;
        batch.ids = [];
        for (var i = 0; i < DWREngine._batch.map.callCount; i++) {
            var prefix = "c" + i + "-";
            var idProp = prefix + "id";
            var scriptProp = prefix + "scriptName";
            var methodProp = prefix + "methodName";

            var oldId = batch.map[idProp];
            var id = batch.map[scriptProp] + "." + batch.map[methodProp] + "-" + i;
            DWREngine._handlersMap[id] = DWREngine._handlersMap[oldId];
            delete DWREngine._handlersMap[oldId];
            batch.ids.push(id);
            batch.map[idProp] = id;
        }
    }
};

var LoginRequiredLink = Class.create();
Object.extend(Object.extend(LoginRequiredLink.prototype,
        LoginEventListener.prototype), {
    initialize: function(recipeId, domId, url, appAlias, parentDiv, options) {
        this.domId = domId;
        this.url = url;
        if (appAlias) this.appAlias = appAlias;
        this.parentDiv = parentDiv;
        this.options = options || {};

        LoginEventListener.prototype.initialize.call(this, recipeId, true, this.domId);

        Event.observe(this.domId, 'click', this.handleClick.bindAsEventListener(this));
    },
    handleClick: function(event) {
        var element = this.parentDiv;
        if (element == undefined) {
            element = Event.element(event);
            if (element.tagName.toLowerCase() != 'a') {
                element = Event.findElement(event, 'a');
            }
        }
        this.checkLogin(element, this.url);
        return false;
    },
    handleUserLoggedIn: function(ajaxEvent, element, target) {
        if (target && target == this) {
            LocationUtils.goTo(this.url);
        }
    }
});

var ForkElement = Class.create();
ForkElement.prototype = {
    initialize: function(elementId, image, text, rating) {
        this.element = DOMElement.get(elementId, 'a');
        this.image = "url(" + image + ")";
        this.text = text;
        this.rating = rating;
    }
};

var ForkRatingController = Class.create();
ForkRatingController.prototype = {
    initialize: function(parentElement, formElement, imagePrefix, ratingDivPrefix, ratingTextSingular, ratingTextPlural, savedRating) {
        this.parentElement = $(parentElement);
        this.formElement = $(formElement);
        this.imagePrefix = imagePrefix;
        this.ratingDivPrefix = ratingDivPrefix;
        this.ratingTextSingular = ratingTextSingular;
        this.ratingTextPlural = ratingTextPlural;
        this.savedRating = savedRating;

        this.forkImageElement = DOMElement.get(this.ratingDivPrefix + 'RatingContainer', 'div');
        this.forkTextElement = DOMElement.get(this.ratingDivPrefix + 'RatingText', 'div');

        this.preloadImages();
        this.setupForks();
        Event.observe(this.forkImageElement, 'mouseout', this.doMouseOut.bindAsEventListener(this));

        // Attach components to parent div
        this.parentElement.appendChild(this.forkImageElement);
        this.parentElement.appendChild(this.forkTextElement);

        // Register as ajax event listener
        EventBroker.addEventListener("RatingSavedEvent", this,
                this.handleAjaxEvent, "ForkRatingController.handleAjaxEvent");

        this.doInitialState();
    },
    preloadImages: function() {
        for (var i = 1; i <= this.numberOfForks; i++) {
            this['forkImage' + i] = new Image();
            this['forkImage' + i].src = this.imagePrefix + "_" + i + ".gif";
        }
        this.emptyRating = "url(" + this.imagePrefix + ".gif)";
    },
    savedText: "<span id=\"successfulRecipeRating\"><br/>Saved...</span>",
    emptyText: "&nbsp;",
    numberOfForks: 4,
    setupForks: function() {
        this.forkElements = [];
        this.forkElements.push(new ForkElement('fork1', this.forkImage1.src, "<span>1 " + this.ratingTextSingular + "</span><br/>Okay", 1));
        this.forkElements.push(new ForkElement('fork2', this.forkImage2.src, "<span>2 " + this.ratingTextPlural + "</span><br/>Good", 2));
        this.forkElements.push(new ForkElement('fork3', this.forkImage3.src, "<span>3 " + this.ratingTextPlural + "</span><br/>Delicious", 3));
        this.forkElements.push(new ForkElement('fork4', this.forkImage4.src, "<span>4 " + this.ratingTextPlural + "</span><br/>Exceptional", 4));

        this.forkElements.each(function(forkElement) {
            // setup event listeners
            Event.observe(forkElement.element, 'mouseover', this.doMouseOver.bindAsEventListener(this));
            Event.observe(forkElement.element, 'click', this.save.bindAsEventListener(this));
            // append to image component
            this.forkImageElement.appendChild(forkElement.element);
        }.bind(this));
    },
    doInitialState: function() {
        this.formElement.rating.value = this.savedRating;
        this.doInactiveState();
    },
    doMouseOver: function(event) {
        var forkElement = this.forkElements.find(function(forkElement) {
            return forkElement.element == Event.element(event);
        });
        if (forkElement) {
            Element.background(this.forkImageElement, forkElement.image);
            Element.update(this.forkTextElement, forkElement.text);
        }
    },

    save: function(event) {
        var forkElement = this.forkElements.find(function(forkElement) {
            return forkElement.element == Event.element(event);
        });
        if (forkElement) {
            this.formElement.rating.value = forkElement.rating;
            // if no button elements
            if (this.formElement.name == "rateRecipeForm") {
                // Do ajax save if no submit element is defined for the form
                RecipeRatingsManager.saveRating(FormModel.get(this.formElement),
                        EventBroker.notifyListeners);
            } else {
                // Otherwise set savedRating and set inactive state
                this.savedRating = forkElement.rating;
                this.doInactiveState();
            }
        }
    },

    doMouseOut: function(event) {
        this.doInactiveState();
    },

    doInactiveState: function() {
        var rating = Number(this.savedRating);
        if (!rating) {
            Element.background(this.forkImageElement, this.emptyRating);
            Element.update(this.forkTextElement, this.emptyText);
        } else if (rating <= this.forkElements.length) {
            Element.background(this.forkImageElement, this.forkElements[rating-1].image);
            Element.update(this.forkTextElement, this.savedText);
        }
    },
    handleAjaxEvent: function(ajaxEvent) {
        FormModel.put(this.formElement, ajaxEvent);
        this.savedRating = ajaxEvent.rating;
        this.doInactiveState();
    },
    unload: function() {
        // Remove ajax response event listeners
        EventBroker.removeEventListener("RatingSavedEvent", this);
        // Remove created DOM elements
        this.forkElements.each(function(forkElement) {
            Element.remove(forkElement.element);
            delete forkElement;
        });
        Element.remove(this.forkImageElement);
        delete this.forkImageElement;
        Element.remove(this.forkTextElement);
        delete this.forkImageElement;
    }
};

var RateRecipeBox = Class.create();
Object.extend(Object.extend(Object.extend(RateRecipeBox.prototype, PopupEventListener.prototype),
        LoginEventListener.prototype), {
    initialize: function(recipeId, ratingImagePrefix, ratingDivPrefix, ratingTextSingular, ratingTextPlural) {
        this.element = 'rateForm';
        this.openLink = 'rateReviewLink';
        this.closeLink = 'close';
        this.formElement = 'thisForm';
        this.recipeId = recipeId;
        this.ratingImagePrefix = ratingImagePrefix;
        this.ratingDivPrefix = ratingDivPrefix;
        this.ratingTextSingular = ratingTextSingular;
        this.ratingTextPlural = ratingTextPlural;
        // Do PopupEventListener init
        PopupEventListener.prototype.initialize.call(this, this.element);
        LoginEventListener.prototype.initialize.call(this, recipeId, true, "RateRecipeBox");
        // Set up event listeners
        Event.observe(this.openLink, 'click', this.handleClick.bindAsEventListener(this));
        EventBroker.addEventListener("RatingReturnedEvent", this,
                this.handleRatingReturned, "RateRecipeBox.handleRatingReturned");

    },
    handleClick: function(event) {
        var element = Event.element(event);
    /*    if (element.tagName.toLowerCase() != 'a') {
            element = Event.findElement(event, 'a');
        }
*/
        this.checkLogin(element);
        return false;
    },
    getRating: function(element) {
        RecipeRatingsManager.getRating(this.recipeId, EventBroker.notifyListeners.bind(EventBroker,
                element, this));
    },
    handleRatingReturned: function(ajaxEvent, element, target) {
        PopupManager.show(this, element);
        Event.observe(this.closeLink, 'click', this.doClose.bindAsEventListener(this));
        this.forkRating = new ForkRatingController($(this.element), $(this.formElement), this.ratingImagePrefix, this.ratingDivPrefix,
                this.ratingTextSingular, this.ratingTextPlural, ajaxEvent.rating);
    },
    doClose: function(event) {
        Element.remove(this.element);
        this.forkRating.unload();
        delete this.forkRating;
    },
    handleUserLoggedIn: function(ajaxEvent, element, target) {
        if (target && target == this) {
            this.getRating(element);
        }
    },
    appAlias: 'recipeRating'
});

var ReviewRecipeBox = Class.create();
Object.extend(Object.extend(Object.extend(ReviewRecipeBox.prototype, PopupEventListener.prototype),
        LoginEventListener.prototype), {
    initialize: function(openLink, recipeId, detailsUrl, previewUrl, returnToUrl, ratingImagePrefix, ratingDivPrefix, ratingTextSingular, ratingTextPlural) {
        this.reviewBox = 'reviewForm';
        this.reviewForm = 'thisForm';
        this.usernameDisplay = 'usernameDisplay';
        this.ratingDiv = 'rateDiv';
        this.detailsUrl = detailsUrl;
        this.recipeId = recipeId;
        this.previewUrl = previewUrl;
        this.returnToUrl = returnToUrl;
        this.ratingImagePrefix = ratingImagePrefix;
        this.ratingDivPrefix = ratingDivPrefix;
        this.ratingTextSingular = ratingTextSingular;
        this.ratingTextPlural = ratingTextPlural;
        this.usingCachedReview = false;
        // Do PopupEventListener init
        PopupEventListener.prototype.initialize.call(this, this.reviewBox);
        LoginEventListener.prototype.initialize.call(this, this.recipeId, true, "ReviewRecipeBox");

        // Set up event listeners
        Event.observe(openLink, 'click', this.doOpenClick.bindAsEventListener(this));
        EventBroker.addEventListener("SetupReviewFormEvent", this,
                this.handleSetupReviewForm, "ReviewRecipeBox.handleSetupReviewForm");
        EventBroker.addEventListener("SavedReviewEvent", this,
                this.handleSavedReview, "ReviewRecipeBox.handleSavedReview");

        this.checkInitPopup(openLink);
    },
    checkInitPopup: function(openLink) {
        if (QueryString.getValue("editReview") == "true" &&
                QueryString.getValue("which") == openLink) {
            this.usingCachedReview = true;
            this.doOpen($(openLink));
        }
    },
    addOpenLink: function(openLink) {
        Event.observe(openLink, 'click', this.doOpenClick.bindAsEventListener(this));
        this.checkInitPopup(openLink);
    },
    doOpenClick: function(event) {
        var element = Event.element(event);
        // alert("test : " + element.tagName);
        /* if (element.tagName.toLowerCase() != 'a') {
            element = Event.findElement(event, 'a');
        }*/
        this.checkLogin(element);
        return false;
    },
    doOpen: function(element) {
        RecipeReviewsManager.getCachedReview(this.recipeId,
                EventBroker.notifyListeners.bind(EventBroker, element, this));
    },
    handleSetupReviewForm: function(ajaxEvent, element) {
        PopupManager.show(this, element);
        Event.observe('close', 'click', this.doClose.bindAsEventListener(this));
        Event.observe('reviewCancel', 'click', this.doClose.bindAsEventListener(this));
        Event.observe('reviewSubmit', 'click', this.doSubmit.bindAsEventListener(this));
        Event.observe('reviewPreview', 'click', this.doPreview.bindAsEventListener(this));
        FormModel.put(this.reviewForm, ajaxEvent);
        Element.update(this.usernameDisplay, ClientLoginManager.username || "");
        this.forkRating = new ForkRatingController($(this.ratingDiv), $(this.reviewForm), this.ratingImagePrefix, this.ratingDivPrefix,
                this.ratingTextSingular, this.ratingTextPlural, ajaxEvent.rating);
    },
    doClose: function(event) {
        if (this.usingCachedReview) {
            RecipeReviewsManager.clearCachedReview(this.recipeId,
                    EventBroker.notifyListeners);
        }
        Element.remove(this.reviewBox);
        this.forkRating.unload();
        delete this.forkRating;
    },
    doSubmit: function(event) {
        if (this.validateForm()) {
            $("reviewForm").style.display = "none";
            RecipeReviewsManager.saveReview(FormModel.get($(this.reviewForm)),
                        EventBroker.notifyListeners.bind(EventBroker, this));
        }
        return false;
    },
    handleSavedReview: function(ajaxEvent, saver) {
        if (this == saver) {
            this.usingCachedReview = false;
            LocationUtils.goTo(this.detailsUrl + "&savedReview=true");
        }
    },
    doPreview: function(event) {
        if (this.validateForm()) {
            $("reviewForm").style.display = "none";
            $(this.reviewForm).action = this.previewUrl;
            $(this.reviewForm).submit();
        }
        return false;
    },
    handleUserLoggedIn: function(ajaxEvent, element, target) {
        if (target && target == this) {
            this.doOpen(element);
        }
    },
    validateForm: function() {
        var theForm = $(this.reviewForm);
        var errors = [];

        if (theForm.text.value == null || theForm.text.value.replace(/\s+/g, "") == "") {
            var error = {
                propertyName: "text",
                message: "Review text is required"
            };
            errors.push(error);
        }

        if (errors.length > 0) {
            this.showValidationErrors(errors);
            return false;
        } else {
            return true;
        }
    },
    appAlias: 'recipeComment'
});

var RegisterLoginBox = Class.create();
Object.extend(Object.extend(Object.extend(RegisterLoginBox.prototype,
        PopupEventListener.prototype), LoginEventListener.prototype), {
    initialize: function(options) {
        this.defaultReturnToUrl = options.returnToUrl;
        this.divId = 'registerLogin';
        this.closeLink = 'close';
        this.loginLink = 'loginLink';
        this.loginTarget = '';
        this.loginElement = '';
        this.returnToUrl = this.defaultReturnToUrl;
        this.loginForm = 'userLogin';
        this.submitButton = 'loginSubmit';
        this.shoppingListUrl = options.shoppingListUrl;

        PopupEventListener.prototype.initialize.call(this, this.divId);
        LoginEventListener.prototype.initialize.call(this, options.recipeId, true, "RegisterLoginBox");
        EventBroker.addEventListener("LoginFailedEvent", this, this.handleLoginFailure,
                "RegisterLoginBox.handleLoginFailure");
    },
    handleNoUserLoggedIn: function(ajaxEvent, element, target, returnToUrl) {
        if (target && target.loginRequired) {
            this.loginElement = element;
            this.loginTarget = target;
            if (returnToUrl) this.returnToUrl = returnToUrl;
            PopupManager.show(this, element);
        }
    },
    show: function(element) {
        this.showRegisterLogin(element);
        Event.observe(this.closeLink, 'click', this.doClose.bind(this));
        Event.observe(this.submitButton, 'click', this.doLoginSubmit.bind(this));
    },
    doClose: function() {
        // do style changes on close
        this.updateOnClose();
        Element.remove(this.divId);
        this.loginElement = '';
        this.loginTarget = '';
        this.returnToUrl = this.defaultReturnToUrl;
    },
    handleUserLoggedIn: function() {
        if (this.isVisible()) this.doClose();
    },
    doLoginSubmit: function() {
        LoginManager.loginUser(FormModel.get(this.loginForm),
                EventBroker.notifyListeners.bind(EventBroker, this.loginElement, this.loginTarget));
        return false;
    },
    handleLoginFailure: function() {
        $(this.loginForm).action = "/user/login";
        $(this.loginForm).submit();
    }
});

var UserLoginBox = Class.create();
Object.extend(Object.extend(Object.extend(UserLoginBox.prototype,
        PopupEventListener.prototype), LoginEventListener.prototype), {
    initialize: function(recipeId) {
        this.divId = 'userLoginDiv';
        this.closeLink = 'close';
        this.loginForm = 'userLogin';
        this.submitButton = 'loginSubmit';

        PopupEventListener.prototype.initialize.call(this, this.divId);
        LoginEventListener.prototype.initialize.call(this, recipeId, true, "UserLoginBox");
        EventBroker.addEventListener("LoginFailedEvent", this, this.handleLoginFailure,
                "UserLoginBox.handleLoginFailure");
    },
    doLogin: function(loginElement, loginTarget, returnToUrl) {
        this.loginElement = loginElement;
        this.loginTarget = loginTarget;
        this.returnToUrl = returnToUrl;
        PopupManager.show(this, this.loginElement);
    },
    show: function(element) {
        this.showUserLogin(element);
        Event.observe(this.submitButton, 'click', this.doLoginSubmit.bind(this));
        Event.observe(this.closeLink, 'click', this.doClose.bind(this));
    },
    doClose: function() {
        // do style changes on close
        this.updateOnClose();
        Element.remove(this.divId);
        this.loginElement = '';
        this.loginTarget = '';
        this.returnToUrl = '';
    },
    doLoginSubmit: function() {
        LoginManager.loginUser(FormModel.get(this.loginForm),
                EventBroker.notifyListeners.bind(EventBroker, this.loginElement, this.loginTarget));
        return false;
    },
    handleUserLoggedIn: function() {
        if (this.isVisible()) this.doClose();
    },
    handleLoginFailure: function() {
        $(this.loginForm).action = "/user/login.do";
        $(this.loginForm).submit();
    }
});

var PrintOptionsBox = Class.create();
Object.extend(Object.extend(Object.extend(PrintOptionsBox.prototype,
        PopupEventListener.prototype), LoginEventListener.prototype), {
    initialize: function(printButton, printBottomLink, recipeId, hasReviews, reviewsUrl, printUrl) {
        this.printButton = printButton;
        this.printBottomLink = printBottomLink;
        this.recipeId = recipeId;
        this.hasReviews = hasReviews;
        this.reviewsUrl = reviewsUrl;
        this.printUrl = printUrl + recipeId;
        this.hasNotes = false;
        this.div = 'printOptions';

        PopupEventListener.prototype.initialize.call(this, this.div);
        LoginEventListener.prototype.initialize.call(this, recipeId, false, "PrintOptionsBox");

        Event.observe(this.printButton, 'click',
                this.handleClick.bindAsEventListener(this));
        Event.observe(this.printBottomLink, 'click',
                this.handleClick.bindAsEventListener(this));
    },
    handleClick: function(event) {
        var element = Event.element(event);
        if (element.tagName.toLowerCase() != 'a') {
            element = Event.findElement(event, 'a');
        }
        this.checkLogin(element);
        return false;
    },
    handleUserLoggedIn: function(ajaxEvent, element, target) {
        if (ajaxEvent.userHasNotes) {
            this.hasNotes = ajaxEvent.userHasNotes;
        }
        if (target && target == this) {
            this.doOpen(element);
        }
    },
    handleNoUserLoggedIn: function(ajaxEvent, element, target) {
        this.hasNotes = false;
        if (target && target == this) {
            this.doOpen(element);
        }
    },
    doOpen: function(element) {
            PopupManager.show(this, element);
        Event.observe('cancel_print_button', 'click', this.doClose.bind(this));
    },
    doClose: function() {
        Element.remove(this.div);
        return false;
    },
    doSubmit: function(event, str) {
      $('printRecipe').submit();
        return false;
    }
});

var EditNoteLink = Class.create();
Object.extend(Object.extend(EditNoteLink.prototype,
        LoginEventListener.prototype), {
    initialize: function(recipeId, button, buttonParent, addNoteButton, editNoteButton,
            bottomLink, addNoteBottomLinkText, editNoteBottomLinkText, notesUrl) {
        this.button = button;
        this.buttonParent = buttonParent;
        this.bottomLink = bottomLink;
        this.addNoteButton = addNoteButton;
        this.editNoteButton = editNoteButton;
        this.addNoteBottomLinkText = addNoteBottomLinkText;
        this.editNoteBottomLinkText = editNoteBottomLinkText;
        this.setUrl(notesUrl);
        LoginEventListener.prototype.initialize.call(this, recipeId, true, "EditNoteLink");

        Event.observe(this.button, 'click', this.handleButtonClick.bindAsEventListener(this));
        Event.observe(this.bottomLink, 'click', this.handleClick.bindAsEventListener(this));
    },
    handleClick: function(event) {
        var element = Event.element(event);
        if (element.tagName.toLowerCase() != 'a') {
            element = Event.findElement(event, 'a');
        }
        this.checkLogin(element);
        return false;
    },
    handleButtonClick: function(event) {
        this.checkLogin(this.buttonParent);
        return false;
    },
    handleUserLoggedIn: function(ajaxEvent, element, target) {
        if (ajaxEvent.userHasNotes) {
            this.updateForNotes();
            this.addCallToAction();
        } else {
            this.updateForNoNotes();
            this.removeCallToAction();
        }
        if (target && target == this) {
            LocationUtils.goTo(this.getUrl());
        }
    },
    updateForNotes: function() {
        // switch from add note to edit note
        Element.hide(this.addNoteButton);
        Element.show(this.editNoteButton);
        Element.hide(this.addNoteBottomLinkText);
        Element.show(this.editNoteBottomLinkText);
    },
    updateForNoNotes: function() {
        Element.hide(this.editNoteButton);
        Element.show(this.addNoteButton);
        Element.hide(this.editNoteBottomLinkText);
        Element.show(this.addNoteBottomLinkText);
    },
    setUrl: function(url) {
        if (url.indexOf('?') != -1) {
            this.notesUrl = url.substring(0, url.indexOf('?'));
            this.queryString = url.substring(url.indexOf('?') + 1);
        } else {
            this.notesUrl = url;
            this.queryString = "";
        }
    },
    getUrl: function() {
        if (this.queryString) {
            return this.notesUrl + "?" + this.queryString;
        } else {
            return this.notesUrl;
        }
    },
    addCallToAction: function() {
        var queryParams = this.queryString ? this.queryString.toQueryParams() : {};
        queryParams.state = 'edit';
        this.queryString = $H(queryParams).toQueryString();
    },
    removeCallToAction: function() {
        var queryParams = this.queryString ? this.queryString.toQueryParams() : {};
        if (queryParams.state) delete queryParams.state;
        this.queryString = $H(queryParams).toQueryString();
    },
    appAlias: 'recipeBox'
});

var NoteButtonUpdater = Class.create();
Object.extend(Object.extend(NoteButtonUpdater.prototype,
        LoginEventListener.prototype), {
    initialize: function(recipeId, addNoteButton, editNoteButton) {
        this.addNoteButton = addNoteButton;
        this.editNoteButton = editNoteButton;

        LoginEventListener.prototype.initialize.call(this, recipeId, true, "NoteButtonUpdater");
    },
    handleUserLoggedIn: function(ajaxEvent, element, target) {
        if (ajaxEvent.userHasNotes) {
            this.updateForNotes();
        } else {
            this.updateForNoNotes();
        }
    },
    updateForNotes: function() {
        // switch from add note to edit note
        Element.hide(this.addNoteButton);
        Element.show(this.editNoteButton);
    },
    updateForNoNotes: function() {
        Element.hide(this.editNoteButton);
        Element.show(this.addNoteButton);
    }
});

var LoginRequiredLinkForNotes = Class.create();
Object.extend(Object.extend(LoginRequiredLinkForNotes.prototype,
        LoginRequiredLink.prototype), {
    initialize: function(recipeId, domId, url, appAlias, parentDiv) {
        LoginRequiredLink.prototype.initialize.call(this, recipeId, domId, url, appAlias, parentDiv);
        this.setUrl(url);
    },
    handleUserLoggedIn: function(ajaxEvent, element, target) {
        if (ajaxEvent.userHasNotes) {
            this.addCallToAction();
        } else {
            this.removeCallToAction();
        }
        if (target && target == this) {
            LocationUtils.goTo(this.getUrl());
        }
    },
    setUrl: function(url) {
        if (url.indexOf('?') != -1) {
            this.url = url.substring(0, url.indexOf('?'));
            this.queryString = url.substring(url.indexOf('?') + 1);
        } else {
            this.url = url;
            this.queryString = "";
        }
    },
    getUrl: function() {
        if (this.queryString) {
            return this.url + "?" + this.queryString;
        } else {
            return this.url;
        }
    },
    addCallToAction: function() {
        var queryParams = this.queryString ? this.queryString.toQueryParams() : {};
        queryParams.state = 'edit';
        this.queryString = $H(queryParams).toQueryString();
    },
    removeCallToAction: function() {
        var queryParams = this.queryString ? this.queryString.toQueryParams() : {};
        if (queryParams.state) delete queryParams.state;
        this.queryString = $H(queryParams).toQueryString();
    }
});

var LocationUtils = {
    goTo: function(url) {
        var form = document.createElement("form");
        form.setAttribute("method", "POST");
        form.setAttribute("action", encodeURI(url));
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
    }
};

var UserIsOwnerListener = Class.create();
Object.extend(UserIsOwnerListener.prototype, LoginEventListener.prototype);
Object.extend(UserIsOwnerListener.prototype, {
    initialize: function(recipeId) {
        LoginEventListener.prototype.initialize.call(this, recipeId, false);
    },
    handleUserLoggedIn: function(theEvent) {
        if (!this.stateSet) {
            if (theEvent.userIsOwner) {
                if ($("badPostAlert")) Element.hide("badPostAlert");
                if ($("rateAndReviewBoxes")) Element.hide("rateAndReviewBoxes");
            }
            this.stateSet = true;
        }
    }
});





include('/dwr/interface/SearchEngine.js');


var SearchResultsListener = Class.create();
SearchResultsListener.prototype = {
    initialize: function() {
        EventListener.prototype.initialize.call(this);
        EventBroker.addEventListener("SearchResultsFoundEvent", this,
                this.handleSearchResultsFound);
    },
    handleSearchResultsFound: function(theEvent) {
        return void(0);
    }
}



var SearchLayer = Class.create();
Object.extend(Object.extend(SearchLayer.prototype, SearchResultsListener.prototype), {
    initialize: function(referrer, recipeId) {
        SearchResultsListener.prototype.initialize.call(this);
        this.searchReferrer = referrer;
        this.recipeId = recipeId;
        var searchReferrer = "external";
        var searchTerms = "";

        this.parseSearchInfo(this.searchReferrer);

        if (this.isSearch) {
            // sort them for caching purposes
            searchTerms = this.sortSearchTerms(this.displaySearchTerms);
            SearchEngine.doSearch(searchTerms, this.isEpiSearch, EventBroker.notifyListeners);
        }
    },
    displayCharacterLimit: 100,
    displaySearchTerms: '',
    referrer: '',
    isEpiSearch: false,
    isSearch: false,
    isEpiReferrer: false,

    sortSearchTerms: function(displaySearchTerms) {
        // split the search terms into words
        var terms = displaySearchTerms.toLowerCase().split(/\s+/);
        var trimmedTerms = new Array();

        // This takes care of spaces before and after the search terms.
        // For example, '    chicken    cacciatore    '.
        var j = 0;
        for (i=0; i < terms.length; i++) {
            var term = terms[i];
            if (term != undefined && term != '') {
                trimmedTerms[j++] = term;
            }
        }

        var sortedTerms = trimmedTerms.sort();
        return sortedTerms.join(" ");
    },
    // This function parses the referrer string for the search term and returns the
    // tokens of the search term delimited by the space character.
    getSearchTermFromReferrer: function(referrer, startString) {
        var startIndex = referrer.indexOf(startString);
        var stopIndex = referrer.indexOf("&", startIndex);
        var searchTerm = "";

        if (startIndex > 0) {
            if (stopIndex == -1) {
                stopIndex = startIndex + (referrer.length - startIndex + startString.length);
            }
            var searchTermEscaped = referrer.substring(startString.length + startIndex, stopIndex);

            // convert the plus character into a space (words)
            var searchTermReplacePlusWithSpace = searchTermEscaped;
            while ( searchTermReplacePlusWithSpace.indexOf("+") != -1) {
                searchTermReplacePlusWithSpace = searchTermReplacePlusWithSpace.replace("+", " ");
            }

            //alert("searchTermReplacePlusWithSpace:" + searchTermReplacePlusWithSpace);

            searchTerm = unescape(searchTermReplacePlusWithSpace);

            //alert("unescaped:" + searchTerm);

            //var searchTerms = searchTerm.split(" ", maximumDisplayTokens);
            //searchTerm = "";
            //for (i=0;i< maximumDisplayTokens;i++) {
            //    if (searchTerms[i] != undefined && searchTerms[i] != '') {
            //        searchTerm += searchTerms[i];
            //        if (i != 3) searchTerm += " ";
            //    }
            //}
        }

        return searchTerm;
    },
    handleSearchResultsFound: function(theEvent) {
        var backToSearchResultsLink = "";

        if (this.isEpiSearch) {
            var userSortedSearchOrder = this.sortSearchTermsToUserSearchOrder(theEvent.strippedSearchTerm);

            backToSearchResultsLink = "<a href=\"";
            backToSearchResultsLink += this.searchReferrer;
            backToSearchResultsLink += "\">";
            backToSearchResultsLink += "&lsaquo; back to <span>" + this.trunc(userSortedSearchOrder, this.displayCharacterLimit) + "</span> search results</a>";

        } else {
            var userSortedSearchOrder = this.sortSearchTermsToUserSearchOrder(theEvent.strippedSearchTerm);
            userSearchTerms = this.buildQueryString(userSortedSearchOrder);
            backToSearchResultsLink = "<a href=\"";
            backToSearchResultsLink += "/tools/searchresults?search=";
            backToSearchResultsLink += userSearchTerms;
            backToSearchResultsLink += "&x=0&y=0\">";
            backToSearchResultsLink += "Not what you're looking for? See <span>";
            backToSearchResultsLink += theEvent.numberOfResults;

            if (theEvent.numberOfResults != '') {
                backToSearchResultsLink += " ";
            }

            backToSearchResultsLink += this.trunc(userSortedSearchOrder, this.displayCharacterLimit) + "</span> recipes on epicurious.com</a>";
        }

        if ($('backToSearchResultsText')) {
            $('backToSearchResultsText').innerHTML = backToSearchResultsLink;
            $('backToSearchResultsText').style.display = 'block';
        }
    },
    // This function takes the user entered search term and removes
    // the terms that do not exist after the stop words stripping
    // process in the controller.  The result is the search terms in
    // the order entered by the user and stripped of any stop words.
    sortSearchTermsToUserSearchOrder: function(sortedStrippedSearchTerms) {
        var userSortedDisplaySearchTerms = "";
        var displayTerms = this.displaySearchTerms.split(" ");
        for (i = 0;i < displayTerms.length;i++) {
            var compareTerm = displayTerms[i].toLowerCase();

            if (sortedStrippedSearchTerms.indexOf(compareTerm) != -1) {
                userSortedDisplaySearchTerms += displayTerms[i];
                if (i != (displayTerms.length - 1)) {
                    userSortedDisplaySearchTerms += ' ';
                }
            }
        }
        return userSortedDisplaySearchTerms;
    },
    searchSites: [
        ["yahoo.com", "p="],
        ["google.com", "q="],
        ["msn.com", "q="],
        ["ask.com", "q="],
        ["aol.com", "query="],
        ["starware.com", "qry="]
    ],
    parseSearchInfo: function(referrer) {
        var found = false;
        this.searchSites.each(function(site) {
            if (referrer.toLowerCase().indexOf(site[0]) != -1) {
                this.isSearch = true;
                this.displaySearchTerms = this.getSearchTermFromReferrer(this.searchReferrer, site[1]);
                found = true;
                throw $break;
            }
        }.bind(this));

        if (!found) {
            var internalHost = "www.epicurious.com";
            if (referrer.toLowerCase().indexOf(internalHost) != -1) {
                this.isEpiReferrer = true;
                // check to see if this was an epi search or browse
                if (referrer.toLowerCase().indexOf(internalHost + "/recipes/find/browse/results") != -1) {
                    this.isSearch = true;
                    this.isEpiSearch = true;
                } else if (referrer.toLowerCase().indexOf(internalHost + "/tools/searchresults") != -1) {
                    this.isSearch = true;
                    this.isEpiSearch = true;
                } else {
                    this.parseCookiesForSearch();
                }

                // if search, get search terms
                if (this.isSearch) {
                    this.displaySearchTerms = this.getSearchTermFromReferrer(this.searchReferrer, "search=");
                }
            }
        }
    },
    parseCookiesForSearch: function() {
        var searchURL = getCookie("BackToSearch");
        var searchRecipeID = getCookie("SearchRecipeID");

        if (searchURL != "" && searchRecipeID == this.recipeId) {
            this.searchReferrer = searchURL;
            this.isSearch = true;
            this.isEpiSearch = true;
        } else {
            //clear backToSearch cookie values
            deleteCookie("BackToSearch", "/", "");
            deleteCookie("SearchRecipeID", "/", "");
        }
    },
    // This function reconstructs a search term with escaping.
    // The escape() function encodes special characters, with
    // the exception of: * @ - _ + . /
    buildQueryString: function(searchTerms) {
        var terms = searchTerms.split(" ");
        var queryString = "";
        for (i=0; i< terms.length; i++) {
            term = terms[i];
            if (term != undefined && term != '') {
                if (term == '+') {
                    term = '%2b';
                } else if (term == '*') {
                    term = '%2a';
                } else if (term == '@') {
                    term = '%40';
                } else if (term == '-') {
                    term = '%2d';
                } else if (term == '_') {
                    term = '%5f';
                } else if (term == '.') {
                    term = '%2e';
                } else if (term == '/') {
                    term = '%2f';
                } else {
                       term = escape(term);
                }

                if (i > 0) {
                    term = "+" + term;
                }
                queryString += term;
            }
        }
        return queryString;
    },
    trunc: function(s, size) {
        var punctuation = '.,;!? ';
        if (!size)size=30;
        if (s.length<=size)return s;

        p=-1;

        for (var i=0;i< size;i++)
          if(punctuation.indexOf(s.charAt(i))!=-1) p=i;

        if (p==-1)p=size-1;

        return ''+s.substr(0,p)+'...';
    }
});




