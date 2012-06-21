/*!
* @file magnet.popups.js
* @author Paul Bronshteyn
* @comment Built by a geek loaded on caffeine ...
* @copyright (c) Conde Nast Digital
*/

if (typeof MAGNET === 'undefined' || !MAGNET) {
    var MAGNET = {};
}

/**
* MAGNET Popup Object
* @class MAGNET Popup Object
* @description Controls arrival popups or layers and exit popups
* @public
* @author Paul Bronshteyn
* @requires MAGNET.ecom
*
* @example
    // Options
    Turn arrival popup or layer on
    MAGNET.popups.setArrival(true); or MAGNET.popups.setArrival(1);

    Turn arrival popup or layer off
    MAGNET.popups.setArrival(false); or MAGNET.popups.setArrival(0);

    Turn exit popup on
    MAGNET.popups.setExiting(true); or MAGNET.popups.setExiting(1);

    Turn exit popup off
    MAGNET.popups.setExiting(false); or MAGNET.popups.setExiting(0);

    Turn layer on
    MAGNET.popups.setLayer(true); or MAGNET.popups.setLayer(1);

    Turn layer off
    MAGNET.popups.setLayer(false); or MAGNET.popups.setLayer(0);

    Turn force layer on
    MAGNET.popups.setForceLayer(true); or MAGNET.popups.setForceLayer(1);

    Turn force layer off
    MAGNET.popups.setForceLayer(false); or MAGNET.popups.setForceLayer(0);

    Set arrival and exiting cookie life
    When on DEV the cookie will expire in 1 hour
    MAGNET.popups.setCookieLife(24);

    Set popup delay
    MAGNET.popups.setPopDelay(3);

    // Arrival path
    Exclude arrival path
    MAGNET.popups.excludeArrivalPath('/path/on/the/site');

    Exclude multiple arrival paths
    MAGNET.popups.excludeArrivalPath('/path/on/the/site', '/other/path/on/the/site');

    Remove excluded arrival path
    MAGNET.popups.removeArrivalPath('/path/on/the/site');

    Remove multiple excluded arrival paths
    MAGNET.popups.removeArrivalPath('/path/on/the/site', '/other/path/on/the/site');

    // Exit path
    Exclude exiting path
    MAGNET.popups.excludeExitPath('/path/on/the/site');

    Exclude multiple exiting paths
    MAGNET.popups.excludeExitPath('/path/on/the/site', '/other/path/on/the/site');

    Remove excluded exiting path
    MAGNET.popups.removeExitPath('/path/on/the/site');

    Remove multiple excluded exiting paths
    MAGNET.popups.removeExitPath('/path/on/the/site', '/other/path/on/the/site');

    // Arrival and Exit paths
    Exclude arrival and exiting path
    MAGNET.popups.excludePath('/path/on/the/site');

    Exclude multiple arrival and exiting paths
    MAGNET.popups.excludePath('/path/on/the/site', '/other/path/on/the/site');

    // Exit domain
    Exclude exiting domain
    MAGNET.popups.excludeExitDomain('domain.com');

    Exclude multiple exiting domains
    MAGNET.popups.excludeExitDomain('domain.com', 'second.com', 'third.com');

    Remove excluded exit domain
    MAGNET.popups.removeExitDomain('domain.com');

    Remove multiple excluded exiting domains
    MAGNET.popups.removeExitDomain('domain.com', 'second.com', 'third.com');

    // URL Params
    Exclude url parameter
    MAGNET.popups.excludeUrlParam('mbid');

    Exclude multiple url parameters
    MAGNET.popups.excludeUrlParam('mbid', 'npu');

    Remove excluded url parameter
    MAGNET.popups.removeUrlParam('mbid');

    Remove multiple excluded url parameters
    MAGNET.popups.removeUrlParam('mbid', 'npu');

    Initiate popups. This should always be the last line.
    MAGNET.popup.init();
*/
MAGNET.popups = (function($M) {
    var
        /**
        * Allow entry popups or layers
        * @memberOf MAGNET.popups
        * @private
        * @type boolean
        * @default true
        */
        arriving = true,

        /**
        * Allow exiting popups or layers
        * @memberOf MAGNET.popups
        * @private
        * @type boolean
        * @default true
        */
        exiting = true,

        /**
        * Switch between layer and popup mode, by default layers are on
        * @memberOf MAGNET.popups
        * @private
        * @type boolean
        * @default true
        */
        layer = false,

        /**
        * Force layer ad if popups were blocked
        * @memberOf MAGNET.popups
        * @private
        * @type boolean
        * @default false
        */
        forceLayer = false,

        /**
        * Popup window arguments
        * @memberOf MAGNET.popups
        * @private
        * @type object
        */
        popArguments = {
            scrollbars: 0,
            location: 0,
            directories: 0,
            status: 0,
            menubar: 0,
            toolbar: 0,
            resizable: 0
        },

        /**
        * Arriving options object
        * @memberOf MAGNET.popups
        * @private
        * @type object
        */
        arrive = {
            name: 'arrivalpop',
            cookie: 'ArrivalCookie',
            path: '/nolayout/arrival',
            width: 460,
            height: 295,
            top: -50,
            left: -50
        },

        /**
        * Exiting options object
        * @memberOf MAGNET.popups
        * @private
        * @type object
        */
        exit = {
            name: 'exitingpop',
            cookie: 'ExitingCookie',
            path: '/nolayout/exit',
            width: 460,
            height: 295,
            top: 50,
            left: 50
        },

        /**
        * Number of hours after to expire arrival and exit cookies.
          When on DEV the cookie will expire in 1 hour.
        * @memberOf MAGNET.popups
        * @private
        * @type integer
        * @default 24 hours
        */
        cookieLife = 24,

        /**
        * Seconds of delay before poping the arrival
        * @memberOf MAGNET.popups
        * @private
        * @type integer
        * @default 3 seconds
        */
        popDelay = 3,

        /**
        * Current site path shortcut
        * @memberOf MAGNET.popups
        * @private
        * @type string
        */
        currentPath = location.pathname,

        /**
        * Current site host shortcut
        * @memberOf MAGNET.popups
        * @private
        * @type string
        */
        currentDomain = $M.site.domain

        /**
        * Excluded arrival paths. There will be no arrival popups or layers on pages using these paths.
        * @memberOf MAGNET.popups
        * @private
        * @type array
        */
        excludeArrivalPaths = [
            '/sweeps',
            '/registration',
            '/services/newsletters'
        ],

        /**
        * Excluded exit paths. There will be no exit popups on pages using these paths.
        * @memberOf MAGNET.popups
        * @private
        * @type array
        */
        excludeExitPaths = [
        ],

        /**
        * Excluded exit domains. There will be no exit popups if the click url
          matches any of the domains in the list.
        * @memberOf MAGNET.popups
        * @private
        * @type array
        */
        excludeExitDomains = [
            'buysub.com',
            'condenastdirect.com',
            'clk.atdmt.com',
            'magazinestoresubscriptions.com'
        ],

        /**
        * Exclude url parameters. There will be no arrival or exit popups if the
          parameter is present in the url.
        * @memberOf MAGNET.popups
        * @private
        * @type array
        */
        excludeUrlParams = [
            'mbid'
        ],

        /**
        * Custom exit popups
        * @memberOf MAGNET.popups
        * @private
        * @type object
        */
        customPopups = {
            arriving: {},
            exiting: {}
        },

        /**
        * Check if excluded is in the list.
        * @description Check if the domain or path we are on at the moment is excluded.
                       This uses an indexOf match method.
        * @memberOf MAGNET.popups
        * @private
        * @param {string} what Domain or path to be checked
        * @param {array} where List we are matching against
        * @return {boolean} Check result
        *
        * @example
            isExcluded('/path/to/page', excludeArrivalPaths);
            isExcluded('/path/to/page', excludeExitPaths);
            isExcluded('sample.com', excludeExitDomains);
        */
        isListed = function(what, where) {
            var i = 0,
                il = where.length;

            for (; i < il; i++) {
                if (what.indexOf(where[i]) !== -1) {
                    return true;
                }
            }

            return false;
        },

        /**
        * Check if path falls under custom set popups
        * @memberOf MAGNET.popups
        * @private
        * @param {string} what Path to be checked
        * @param {object} where List we are matching against
        * @return {object} Custom popup options
        *
        * @example
            isExcluded('/path/to/page', customPopups.arriving);
            isExcluded('/path/to/page', customPopups.exiting);
        */
        isCustom = function(what, where) {
            for (var item in where) {
                if (where[item].strict) {
                    if (what === item) {
                        return where[item].options;
                    }
                } else if (what.indexOf(item) !== -1) {
                    return where[item].options;
                }
            }

            return false;
        },

        /**
        * Add one or more paths or url items to a list
        * @memberOf MAGNET.popups
        * @private
        * @param {object} what Arguments object containing the list of items
                                to be added to an item list
        * @param {array} where List of items to which to add additional items
        */
        insert = function(what, where) {
            var i = 0,
                il = what.length;

            for (; i < il; i++) {
                if (jQuery.inArray(what[i], where) === -1) {
                    where.push(what[i]);
                }
            }
        },

        /**
        * Remove one or more paths or url items from a list
        * @memberOf MAGNET.popups
        * @private
        * @param {object} what Arguments object containing the list of items
                                to be removed from an exclution list
        * @param {array} where List of excludes from which to remove items
        */
        remove = function(what, where) {
            var i = 0,
                il = what.length,
                index;

            for (; i < il; i++) {
                index = jQuery.inArray(what[i], where);
                if (index > -1) {
                    where.remove(index, 1);
                }
            }
        },

        /**
        * Popup the window and focus it.
        * @memberOf MAGNET.popups
        * @private
        * @param {object} options Arriving or Exiting options
        * @return {boolean} Did we pop or not
        */
        pop = function(options) {
            var argument,
                arguments = '',
                win;
                
            if (options.cookie) {
                $M.cookie.set(options.cookie, options.cookie, { expires: cookieLife, path: '/', domain: currentDomain });
            }

            options.args = jQuery.extend({}, popArguments, options.args || {});

            for (argument in options.args) {
                arguments += ',' + argument + '=' + options.args[argument];
            }

            win = window.open(options.path, options.name, 'height=' + (options.height || screen.height) + ',width=' + (options.width || screen.width) + ',top=' + parseInt(screen.height / 2 - (options.height || screen.height) / 2 + options.top) + ',left=' + parseInt(screen.width / 2 - (options.width || screen.width) / 2 + options.left) + arguments);
            return (win) ? (true, win.focus()) : false;
        },

        /**
        * Welcome user with a popup or a layer ad
        * @memberOf MAGNET.popups
        * @private
        * @uses MAGNET.popups.pop
        */
        welcome = function() {
            // Set arriving cookie
            $M.cookie.set(arrive.cookie, arrive.cookie, { expires: cookieLife, path: '/', domain: currentDomain });

            if (layer || (!pop(arrive) && forceLayer)) {
                if ($M.ecom && $M.ecom.floatingAd) {
                    $M.ecom.floatingAd.init();
                }
            }
        },

        /**
        * Farewell user with a popup
        * @memberOf MAGNET.popups
        * @private
        * @param {object} e Window event
        * @event
        * @uses MAGNET.popups.pop
        * @uses MAGNET.url.domain
        * @uses MAGNET.cookie.set
        * @uses MAGNET.cookie.get
        */
        goodbye = function(e) {
            var options = isCustom(currentPath, customPopups.exiting);
            if (options) {
                jQuery(window).unbind('unload', goodbye);
                return !$M.cookie.get(options.cookie) ? pop(options) : false;
            }

            if (!exiting || isListed(currentPath, excludeExitPaths) || $M.cookie.get(exit.cookie)) {
                return;
            }

            var exitDomain = '';

            if (e.type === 'click') {
                if (/javascript|#/.test(e.target.parentNode.href || e.target.href || '')) {
                    return;
                }

                jQuery(window).unbind('unload', goodbye);
                exitDomain = e.target.parentNode.hostname || e.target.hostname || '';
            } else {
                exitDomain = '';
            }

            exitDomain = (exitDomain) ? $M.url.domain(exitDomain) : '';

            // Validate if we need a popup
            if (exitDomain === currentDomain || isListed(exitDomain, excludeExitDomains)) {
                return;
            }

            // pop the window
            pop(exit);
        };

    /**
    * @scope MAGNET.popups
    */
    return {
        /**
        * Initiate popups.
        * @description Binds exit events if needed. Checks if we need an arriving popup,
                       sets arriving cookie, delays and pops.
        * @memberOf MAGNET.popups
        * @private
        * @return {object} MAGNET.popups
        * @uses MAGNET.popups.welcome
        * @uses MAGNET.popups.goodbye
        * @uses MAGNET.cookie.get
        * @uses MAGNET.cookie.set
        * @uses MAGNET.url.params
        *
        * @example
            Initiate popups. This should always be the last line.
            MAGNET.popup.init();
        */
        init: function() {
            // check for excluded url params
            var i = 0,
                il = excludeUrlParams.length,
                params = $M.url.params();

            for (; i < il; i++) {
                if (params[excludeUrlParams[i]]) {
                    return this;
                }
            }

            // Exiting on. Bind event.
            jQuery('a').live('click', goodbye);
            jQuery(window).bind('unload', goodbye);

            // On dev? expire cookie in one hour
            if ($M.site.env === 'DEV') {
                cookieLife = 1;
            }

            /*
            * Arriving off. Exit.
            * mbid in url. Exit.
            * Arriving cookie exists. Exit.
            * Arriving path excluded. Exit.
            */
            if (!arriving || $M.cookie.get(arrive.cookie) || isListed(currentPath, excludeArrivalPaths)) {
                return this;
            }

            // Delay and pop
            setTimeout(welcome, popDelay * 1000);

            return this;
        },

        /**
        * Turn arriving popup or layer on/off and set arrving popup options.
        * @param {boolean} setting Arriving popup setting
        * @param {object} options Options
        * @option options {string} name Name to use for the popup window
        * @option options {string} cookie Name to use for the arrival cookie
        * @option options {string} path Path to the popup window html/jsp
        * @option options {integer} width Width of the popup window
        * @option options {integer} height Height of the popup window
        * @option options {integer} top Top offset from the center of the page
        * @option options {integer} left Left offset from the center of the page
        * @option options {object} args Popup window arguments
        * @option args {integer} scrollbars Enable/disable scrollbars
        * @option args {integer} location Enable/disable location bar
        * @option args {integer} directories Enable/disable directories toolbar
        * @option args {integer} status Enable/disable status bar
        * @option args {integer} menubar Enable/disable menu bar
        * @option args {integer} toolbar Enable/disable browser toolbar
        * @option args {integer} resizable Enable/disable window resizing
        * @return {object} MAGNET.popups
        *
        * @example
            Turn arriving popup or layer on
            MAGNET.popups.setArriving(true); or MAGNET.popups.setArriving(1);

            Turn arriving popup or layer off
            MAGNET.popups.setArriving(false); or MAGNET.popups.setArriving(0);

            Set arrival popup options
            MAGNET.popups.setArriving(true, {
                name: 'arrivalpop',
                cookie: 'ArrivalCookie',
                path: '/nolayout/arrival',
                width: 460,
                height: 295,
                top: -50,
                left: -50,
                args: {
                    scrollbars: 1,
                    toolbar: 0
                }
            });
        */
        setArriving: function(setting, options) {
            arriving = setting;
            jQuery.extend(arrive, (options || {}));
            return this;
        },

        /**
        * Turn exiting popup on/off and set exiting popup options.
        * @param {boolean} setting Exiting popup setting
        * @param {object} options Exiting popup options
        * @option options {string} name Name to use for the popup window
        * @option options {string} cookie Name to use for the arrival cookie
        * @option options {string} path Path to the popup window html/jsp
        * @option options {integer} width Width of the popup window
        * @option options {integer} height Height of the popup window
        * @option options {integer} top Top offset from the center of the page
        * @option options {integer} left Left offset from the center of the page
        * @option options {object} args Popup window arguments
        * @option args {integer} scrollbars Enable/disable scrollbars
        * @option args {integer} location Enable/disable location bar
        * @option args {integer} directories Enable/disable directories toolbar
        * @option args {integer} status Enable/disable status bar
        * @option args {integer} menubar Enable/disable menu bar
        * @option args {integer} toolbar Enable/disable browser toolbar
        * @option args {integer} resizable Enable/disable window resizing
        * @return {object} MAGNET.popups
        *
        * @example
            Turn exit popup on
            MAGNET.popups.setExiting(true); or MAGNET.popups.setExiting(1);

            Turn exit popup off
            MAGNET.popups.setExiting(false); or MAGNET.popups.setExiting(0);

            Set exiting popup options
            MAGNET.popups.setExiting(true, {
                name: 'exitingpop',
                cookie: 'ExitingCookie',
                path: '/nolayout/exiting',
                width: 460,
                height: 295,
                top: -50,
                left: -50,
                args: {
                    scrollbars: 1,
                    toolbar: 0
                }
            });
        */
        setExiting: function(setting, options) {
            exiting = setting || exiting;
            jQuery.extend(exit, (options || {}));
            return this;
        },

        /**
        * Turn layer on/off. Defaults is off (popup).
        * @param {boolean} setting Setting to be set
        * @return {object} MAGNET.popups
        *
        * @example
            Turn layer on
            MAGNET.popups.setLayer(true); or MAGNET.popups.setLayer(1);

            Turn layer off
            MAGNET.popups.setLayer(false); or MAGNET.popups.setLayer(0);
        */
        setLayer: function(setting) {
            layer = setting || layer;
            return this;
        },

        /**
        * Set if we want to force a layer if popup was blocked.
        * @param {boolean} setting Setting to be set
        * @return {object} MAGNET.popups
        *
        * @example
            Turn force layer on
            MAGNET.popups.setForceLayer(true); or MAGNET.popups.setForceLayer(1);

            Turn force layer off
            MAGNET.popups.setForceLayer(false); or MAGNET.popups.setForceLayer(0);
        */
        setForceLayer: function(setting) {
            forceLayer = setting || forceLayer;
            return this;
        },

        /**
        * Check if the layer is on.
        * @description This will be used in ecomPlacement.jsp to check if the site uses layers
                       before making ATG call.
        * @return {boolean}
        */
        isLayer: function() {
            return layer || forceLayer;
        },

        /**
        * Set the number of hours after which to expire both arrival and exit cookies. Default is 24 hours.
        * @param {integer} life=24 Cookie life in hours
        * @return {object} MAGNET.popups
        * @uses MAGNET.utils.intval
        *
        * @example
            Set arrival and exiting cookie life
            MAGNET.popups.setCookieLife(24);
        */
        setCookieLife: function(life) {
            cookieLife = $M.utils.intval(life) || cookieLife;
            return this;
        },

        /**
        * Set delay in seconds after which to create the popup. Default is 3.
        * @param {integer} delay=3 Delay in seconds
        * @return {object} MAGNET.popups
        * @uses MAGNET.utils.intval
        *
        * @example
            Set popup delay
            MAGNET.popups.setPopDelay(3);
        */
        setPopDelay: function(delay) {
            popDelay = $M.utils.intval(delay) || popDelay;
            return this;
        },

        /**
        * Set default popup window options
        * @param {object} args Popups window options
        * @option args {integer} scrollbars Enable/disable scrollbars
        * @option args {integer} location Enable/disable location bar
        * @option args {integer} directories Enable/disable directories toolbar
        * @option args {integer} status Enable/disable status bar
        * @option args {integer} menubar Enable/disable menu bar
        * @option args {integer} toolbar Enable/disable browser toolbar
        * @option args {integer} resizable Enable/disable window resizing
        * @return {object} MAGNET.popups
        *
        * @example
            Set exiting popup options
            MAGNET.popups.setPopArguments({
                scrollbars: 'yes',
                location: 'no',
                directories: 'no',
                status: 'no',
                menubar: 'no',
                toolbar: 'no',
                resizable: 'no'
            });
        */
        setPopArguments: function(args) {
            jQuery.extend(popArguments, (args || {}));
            return this;
        },

        /**
        * Set custom exit popup on specified path
        * @param {string} path Path to have custom exit pops
        * @param {object} [pop] Exiting popup options
        * @option pop {integer} name Name to use for the popup window
        * @option pop {integer} cookie Name to use for the arrival cookie
        * @option pop {integer} path Path to the popup window html/jsp
        * @option pop {integer} width Width of the popup window
        * @option pop {integer} height Height of the popup window
        * @option pop {integer} top Top offset from the center of the page
        * @option pop {integer} left Left offset from the center of the page
        * @option pop {object} args Popup window arguments
        * @option args {integer} scrollbars Enable/disable scrollbars
        * @option args {integer} location Enable/disable location bar
        * @option args {integer} directories Enable/disable directories toolbar
        * @option args {integer} status Enable/disable status bar
        * @option args {integer} menubar Enable/disable menu bar
        * @option args {integer} toolbar Enable/disable browser toolbar
        * @option args {integer} resizable Enable/disable window resizing
        * @param {boolean} [strict] Set path check to be exact match
        * @return {object} MAGNET.popups
        */
        setCustomExitPath: function(path, pop, strict) {
            if (!path) {
                return this;
            }

            if ($M.isBoolean(pop)) {
                strict = pop;
                pop = exit;
            }

            customPopups.exiting[path] = {
                'strict': strict || false,
                options: pop || exit
            }

            return this;
        },

        /**
        * Exclude path. Adds path(s) to both Arrival and Exitings exclude lists
        * @param {string[]} path Path(s) to be excluded
        * @return {object} MAGNET.popups
        * @uses MAGNET.popups.insert
        *
        * @example
            Exclude arrival and exiting path
            MAGNET.popups.excludePath('/path/on/the/site');

            Exclude multiple arrival and exiting paths
            MAGNET.popups.excludePath('/path/on/the/site', '/other/path/on/the/site');
        */
        excludePath: function() {
            insert(arguments, excludeArrivalPaths);
            insert(arguments, excludeExitPaths);
            return this;
        },

        /**
        * Exclude arrival path
        * @param {string[]} path Path(s) to be excluded
        * @return {object} MAGNET.popups
        * @uses MAGNET.popups.insert
        *
        * @example
            Exclude arrival path
            MAGNET.popups.excludeArrivalPath('/path/on/the/site');

            Exclude multiple arrival paths
            MAGNET.popups.excludeArrivalPath('/path/on/the/site', '/other/path/on/the/site');
        */
        excludeArrivalPath: function() {
            insert(arguments, excludeArrivalPaths);
            return this;
        },

        /**
        * Remove excluded arrival path
        * @param {string[]} path Path(s) to be removed
        * @return {object} MAGNET.popups
        * @uses MAGNET.popups.remove
        *
        * @example
            Remove excluded arrival path
            MAGNET.popups.removeArrivalPath('/path/on/the/site');

            Remove multiple excluded arrival paths
            MAGNET.popups.removeArrivalPath('/path/on/the/site', '/other/path/on/the/site');
        */
        removeArrivalPath: function() {
            remove(arguments, excludeArrivalPaths);
            return this;
        },

        /**
        * Exclude exiting path
        * @param {string[]} path Path(s) to be excluded
        * @return {object} MAGNET.popups
        * @uses MAGNET.popups.insert
        *
        * @example
            Exclude exiting path
            MAGNET.popups.excludeExitPath('/path/on/the/site');

            Exclude multiple exiting paths
            MAGNET.popups.excludeExitPath('/path/on/the/site', '/other/path/on/the/site');
        */
        excludeExitPath: function() {
            insert(arguments, excludeExitPaths);
            return this;
        },

        /**
        * Remove excluded exiting path
        * @param {string[]} path Path(s) to be removed
        * @return {object} MAGNET.popups
        * @uses MAGNET.popups.remove
        *
        * @example
            Remove excluded exiting path
            MAGNET.popups.removeExitPath('/path/on/the/site');

            Remove multiple excluded exiting paths
            MAGNET.popups.removeExitPath('/path/on/the/site', '/other/path/on/the/site');
        */
        removeExitPath: function() {
            remove(arguments, excludeExitPaths);
            return this;
        },

        /**
        * Exclude exit domain(s)
        * @param {string[]} domain Domain to be excluded
        * @return {object} MAGNET.popups
        * @uses MAGNET.popups.insert
        *
        * @example
            Exclude exiting domain
            MAGNET.popups.excludeExitDomain('domain.com');

            Exclude multiple exiting domains
            MAGNET.popups.excludeExitDomain('domain.com', 'second.com', 'third.com');
        */
        excludeExitDomain: function() {
            insert(arguments, excludeExitDomains);
            return this;
        },

        /**
        * Remove excluded exit domain(s)
        * @param {string[]} domain Domain(s) to be removed
        * @return {object} MAGNET.popups
        * @uses MAGNET.popups.remove
        *
        * @example
            Remove excluded exit domain
            MAGNET.popups.removeExitDomain('domain.com');

            Remove multiple excluded exiting domains
            MAGNET.popups.removeExitDomain('domain.com', 'second.com', 'third.com');
        */
        removeExitDomain: function() {
            remove(arguments, excludeExitDomains);
            return this;
        },

        /**
        * Exclude url parameter
        * @param {string[]} param Url parameter to be excluded
        * @return {object} MAGNET.popups
        * @uses MAGNET.popups.insert
        *
        * @example
            Exclude url parameter
            MAGNET.popups.excludeUrlParam('mbid');

            Exclude multiple url parameters
            MAGNET.popups.excludeUrlParam('mbid', 'npu');
        */
        excludeUrlParam: function() {
            insert(arguments, excludeUrlParams);
            return this;
        },

        /**
        * Remove excluded url parameter
        * @param {string[]} param Url parameter to be removed
        * @return {object} MAGNET.popups
        * @uses MAGNET.popups.remove
        *
        * @example
            Remove excluded url parameter
            MAGNET.popups.removeUrlParam('mbid');

            Remove multiple excluded url parameters
            MAGNET.popups.removeUrlParam('mbid', 'npu');
        */
        removeUrlParam: function() {
            remove(arguments, excludeUrlParams);
            return this;
        }
    }
})(MAGNET)