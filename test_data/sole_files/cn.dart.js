/*global CN, jQuery */ /* for jsLint */

/**
 * CN.dart.js
 * @library cn-fe-ads-1.3.13
 * @requires CN, jQuery
 * @author Russell Munson
 * @author Joe Hartoularos
 */
CN.dart = (function($, CN, $D) {

    var

        /**
         * {Object} $window
         * A jQuery wrapped set of the window object.  Saves rendering time.
         * @private
         */
        $window = $(window),

        /**
         * {Object} ads
         * A collection of ad calls requested on CN.dart
         * @private
         */
        ads = {},

        /**
         * {Boolean} isDrawing
         * Flag indicating that CN.dart is in the process of drawing ads
         * @private
         */
        isDrawing = false,

        /**
         * {Object} common
         * The common ad object.  Used as a base class for plugin methods for easy read/write access to
         * shared ad values.
         * @private
         */
        common = {
            ad              : {},
            params          : {},
            charmap         : {},
            container       : '_frame',                         /*  Individual ad container div suffix */
            dcopt           : true,                             /*  allow dcopt param to be appended to tile 1 */
            frameurl        : '/ads/newad.html',                /*  Iframe base-url - Used for generating contained dynamic script tags for ad calls. */
            embed           : false,                            /*  If set to true, embed ads in page rather than in an iframe */
            initialized     : false,
            ready           : false,
            ord             : Math.floor(Math.random()*10e12),
            remote          : '/services/dart/',
            retry           : false,
            site            : "",
            tiles           : [],
            tile            : 0,
            transparency    : true,                             /*  allowtransparency to fix white background on ads in IE */
            url             : location.protocol + '//ad.doubleclick.net/adj/',
            zone            : ""
        },

        /**
         * {RegExp} kwregex
         * @private
         */
        kwregex = /kw=/g,

        /**
         * {String} msg_pre
         * Shared message prefix used in generating debug info.
         * @private
         */
        msg_pre = "CN Ad ",

        /**
         * {Object} msg
         * Message object for easily generating debug info.
         * @private
         */
        msg = {
            /* These are for good! */
            'true' : {
                gen      : 'Success',
                call     : 'Request Fired',
                embed    : 'Set to Embedded Mode.  Operating with degraded feature-set.',
                queue    : 'Request Added to Queue',
                plug     : 'Plugin Registered',
                valid    : 'Plugin Action Passed Validation',
                finished : 'All Plugins Finished Running.',
                drawing  : 'All Ads Have Completed Drawing',
                drawn    : 'Ad Drawn'

            },

            /* These are for bad =( */
            'false' : {
                gen      : 'Error',
                call     : 'Request Aborted',
                embed    : 'Set to Iframe Mode. Good job.',
                queue    : 'Request Faled To Be Added to Queue',
                plug     : 'Plugin Skipped',
                valid    : 'Plugin Action Failed Validation',
                finished : 'Plugins Still Running',
                drawing  : 'Ads Still Drawing',
                drawn    : 'Ad Failed To Draw'
            }
        },

        /**
         * {Object} timer
         * A timer object used to record function performance.
         * @public
         */
        timer = {
            /**
             * Marks a point in execution by creating a timestamp.  The value of milestone dictates the key.
             * The milestone 'start' is used as the initial timestamp.  All other timestamps are stored as
             * a difference to show the time in miliseconds each function call has taken from start.
             * @param {String}    milestone     A string denoting the milestone key
             * @example:
             *                 timer.mark('start');  // Creates a timestamp stored in timer.start
             *                 timer.mark('init');   // Creates a timestamp, then stores the difference of start and init in timer.init
             * @private
             */
            mark : function(milestone) {
                this[milestone] = (milestone === 'start') ? (new Date()).getTime() : (new Date()).getTime() - this.start;
            }
        },

        /**
         * {Object} nakedFrame
         * A jQuery wrapped set containing a blank iframe element.
         * @private
         */
        nakedFrame = $('<iframe/>').attr({
                allowtransparency   : common.transparency,
                frameBorder         : 0,
                scrolling           : 'no'
            }).css({
                border              : 'none',
                margin              : 0,
                padding             : 0
        }),

        /**
         * Generates debug messages.
         * @param {String}    type       Message type defined in @msg
         * @param {Boolean}   [state]    Optional Boolean value to indicate state [true = success, false = error]
         * @returns {String} A formatted debug message
         * @private
         */
        messager = function(type, state) {
            return msg_pre + msg[(state !== false).toString()][type || 'gen'];
        },

        /**
         * Constructs the ad request url.
         * @param {Object}    ad         DART ad object
         * @param {String}    [url]      Optional url to use in place of ad object properties
         * @returns {String} The ad request url
         * @public
         */
        buildurl = function(ad, url) {
            return common.url + common.site +
                '/' +
                (url || ad.zone || common.zone) +
                'sz='   + ad.sz   + ';' +
                'tile=' + ad.tile + ';' +
                (ad.tile === 1 && common.dcopt === true ? 'dcopt=ist;' : '') +
                (!url ? keywordString(ad) : '') +
                buildParams(ad) +
                'ord='  + common.ord + '?';
        },

        /**
         * Formats key=value string of params to add to the ad url.  Iterates over common.params, using the default value
         * or calling refresh on the param object if the value of the param is dependent on something volatile (i.e. keywords).
         * @param {Object}    ad         DART ad object
         * @returns {String} Formatted key=value string
         * @private
         */
        buildParams = function(ad) {

            var
                cParams  = common.params,
                paramStr = '',
                param;

            for (param in cParams) {
                if (cParams.hasOwnProperty(param)) {
                    paramStr += param + '=';
                    paramStr += (cParams[param].refresh && (ad.kws.length !== common.ad.kws.length)) ? cParams[param].refresh(ad) : cParams[param].defaultValue;
                }
            }

            return paramStr;
        },

        /**
         * Creates and stores individual ad objects by extending the base common.ad.
         * @param {String}    name        Unique name prefix for storage, container div, and iframe id generation
         * @param {Object}    [pars]      Additional ad params to extend or override common.ad values
         * @returns {CN.dart}
         * @public
         */
        call = function(name, pars) {
            var
                key = name + pars.sz,
                zone,
                ad  = ads[key] = {
                    tile        : common.tiles.push(key),
                    el          : $('#' + key + common.container),
                    kws         : unique(common.ad.kws, test.kws(pars.kws) || []),
                    store       : pars.store === false ? false : common.ad.store,
                    sz          : pars.sz,
                    isDrawn     : false,
                    xkws        : test.kws(pars.kws) || [],
                    zone        : pars.zone ? test.adzone(pars.zone) : false,
                    collapse    : pars.collapse === true
            };

            // If ads have already been drawn, call draw again to render the new ad

            if (common.embed) {
                drawEmbedded(key);
            }
            else if (common.ready) {
                if (!isDrawing) {
                    draw();
                }
            }
            else {
                $D.info(messager('queue'), [key,ad]);
            }

            return this;
        },

        /**
         * Generates an iframe for the ad, and appends it to the container [placement][common.container]
         * For iframed ads this is the actual call execution.
         * @param {String}    placement   DART ad placement identifier
         * @param {String}    [url]       Url to be used in place of ad pars
         * @returns {CN.dart}
         * @private
         */
        drawFrame = function(placement, url) {
           var
                ad   = ads[placement],
                dims = ad.sz.split('x');

            ad.url = buildurl(ad, url);
            ad.el.html(ad.frame = nakedFrame.clone().attr({
                    id       : placement,
                    name     : placement,
                    height   : ad.collapse ? 1 : dims[1],
                    width    : dims[0],
                    src      : ad.url && common.frameurl + '#' + encodeURIComponent(ad.url)
                }).bind('load', { key : placement, ad : ad }, function(e) {
                    if (e.data.ad.tile === 1) {
                        $window.trigger('CN.customEvents.dartAdDrawn', [placement, "#" + placement, ad]);
                    }
                    onFrameDraw(e);
                })
            );

            ad.isDrawn = true;

            $D.info(messager('call'), [placement, ad]);
            return this;
        },

        /**
         * Iterates over ads using placement keys from common.tiles.  To throttle rendering, break the iteration on the
         * first ad, and use the dartAdDrawn event to dispatch draw again for the rest of the queue
         * @param {Object}   e   The event object
         * @private
         **/
        draw = function(e) {
            var
                i        = 0,
                tiles    = common.tiles,
                len      = tiles.length;

            isDrawing = (len > 0);

            for (; i < len; i++) {
                if (ads[tiles[i]].isDrawn === false) {
                    drawFrame(tiles[i]);
                    if (i === 0) {
                        break;
                    }
                }
                if (i === len - 1) {
                    isDrawing = false;
                    timer.mark('rendered');
                }
            }
        },

        /**
         * Initialize CN.dart, setting common ad parameters and kicking off all registered plug-ins.
         * @param {Object}  pars    Shared params - ex: site, zone, shared kws.
         * @public
         */
        init = function(pars) {
            if (common.initialized) {
                $D.warn(msg_pre+'Initialization called more than once.  This should only happen once per page.');
                return false;
            }

            test.charmap(pars.charmap);

            common.initialized = true;

            common.site = pars.site;
            common.zone = test.adzone(pars.zone);
            common.ad   = {
                store   : true,
                kws     : test.kws(pars.kws),
                tile    : common.tile
            };

            updateKws();
            plugin.run();

            common.embed = (pars.embed || common.embed);

            if (common.embed) {
                $D.info(messager('embed', true), []);
            }

            timer.mark('init');

            $D.info(msg_pre + 'Initialized', [ads]);

            $window.bind('CN.customEvents.dartRequest', function(e) { draw(e); })
                     .bind('CN.customEvents.dartAdDrawn', function(e) { draw(e); })
                     .trigger('CN.customEvents.dartInitialized');

        },

        /**
         * Translate kw array into a semicolon-delimited string.
         * @param {Object}    ad    Ad object to grab keywords for translation.
         * @returns {String}
         * @private
         */
        keywordString = function(ad) {
            return 'kw=' + ad.kws.join(';kw=') + ';' + (ad.xkws.length ? '!c=' + ad.xkws.join(';!c=') + ';' : '');
        },

        /**
         * Callback event dispatcher, executed on frame-load.  If initialPause is true, the draw requests
         * are throttled to ensure that ads are drawn out, sequentially, in the order that they were
         * requested.  This had to be implemented for V8 and Nitro engines.
         * @param {Object}   e    The event object
         * @public
         */
        onFrameDraw = function(e) {
            var
                key = e.data.key,
                ad  = ads[key];

            try {
                ad.doc = ad.frame.contents();
            }
            catch (err) {
                $D.user(e, [e.target, e.target.id]);
            }

            $D.info(messager('drawn'), [key, ad]);

            resize(e);
        },

        /**
         * {Object} plugin
         * Encapsulates plug-in logic
         * @private
         */
        plugin = {

            /**
             * {Array} queue
             * Plug-in holder array.  Registered plug-ins are stored here.
             * @private
             */
            queue       : [],

            /**
             * Adds plugins to the queue if they meet the required criteria.
             * @param {Object}   plug   The plug-in to install
             * @returns {Boolean}
             * @private
             */
            register    : function(plug) {
                if (!plug || !plug.init || plug.isFinished === undefined || !plug.callbacks){
                    $D.info(messager('plug',false), [plug ? plug.name : '', plug || {}]);
                    return false;
                }

                this.queue.push(plug);
                $D.info(messager('plug'), [plug.name || '', plug]);

                $window.unbind('CN.customEvents.dartInitialized');
                return true;
            },

            /**
             * Iterates over installed plug-ins and calls their init methods, passing in an object containing
             * the queue, the plug-in's position in the queue, and its own plug-in object reference.
             * @private
             */
            run        : function() {
                var
                    i      = 0,
                    len    = this.queue.length,
                    passed = false,
                    plug,
                    val;

                for (; i < len; i++) {
                    plug = this.queue[i];
                    $D.info(msg_pre + 'Running Plugin', [plug.name]);
                    plug.init({
                        queue    : this.queue,
                        position : i,
                        plugin   : plug
                    });
                }
            },

            /**
             * Iterates over installed plug-ins and checks their isFinished property. If all plug-ins have finished,
             * call ready to signal the start of DART requests.
             * Note:  This function is a callback of the CN.customEvents.dartPlugin event.  It re-scopes to the parent
             * 'plugin' object.
             * @param {Object}   event    The event object
             * @param {Object}   plugin   The plug-in that triggered the event
             * @param {Object}   val      The plug-in's "return" value
             * @private
             */
            finished   : function(event, plugin, val) {
                var
                    i      = 0,
                    scope  = event.data,
                    len    = scope.queue.length,
                    passed = scope.validate(val);

                $D.info(messager('valid', passed), [plugin.name, val]);

                for (; i< len; i++) {
                    if (scope.queue[i].isFinished === false) {
                        $D.info(messager('finished', false), [plugin.name]);
                        return false;
                    }
                }

                $D.info(messager('finished', true));
                ready.call(CN.dart);
            },

            /**
             * Validates a plug-in's return value against a defined set of rules, which in turn modify the common object
             * properties.
             * @param {Object}  ret  The plug-in's return value
             * @returns {Boolean}
             * @private
             */
            validate    : function(ret) {
                var
                    pass = true,
                    key;

                for (key in ret) {
                    if(ret.hasOwnProperty(key)) {
                        pass = (test[key] && test[key](ret[key]) && pass);
                    }
                }

                return pass || false;
            }
        },

        /**
         * Puts CN.dart in a ready state by setting its common.ready property and triggering CN.customEvents.dartRequest
         * to allow queued CN.dart.call invocations to begin drawing their ads.
         * @returns {CN.dart}
         * @public
         */
        ready = function(e) {
            common.ready = true;
            timer.mark('ready');
            $D.info(msg_pre + 'Call State Set to Ready');
            $window.trigger('CN.customEvents.dartRequest');
            return this;
        },

        /**
         * Refreshes ad params or with the url pars (if provided).
         * @param  {String}    ads       Array, CSV or space-delimited list of ads id's
         * @param  {object}    [pars]    Params to override ad values, or url path to replace serialized params
         *
         * @example     CN.dart.refresh('header728x90',{tile:20});
         *              CN.dart.refresh('header728x90','');
         * @returns {CN.dart}
         * @public
         */
        refresh = function(placement, pars) {

            if (common.embed) {
                return this;
            }

            var
                p     = placement ? placement.toString().split(/,|\s+/) : common.tiles,
                len   = p.length,
                merge = CN.isObject(pars),
                i     = 0,
                key,
                ad;

            common.ord = Math.floor(Math.random()*10e12);

            // The next line removes any references to a doubleclick frame busting ads
            if (len === common.tiles.length){
                $('script[id*="prscr"], .prWrap').remove();
            }

            for (; i < len; i++) {

                ad = ads[key = p[i]];

                if (ad && ad.store) {

                    // Add a fixed height to the parent el for the duration of the refresh.
                    ad.el.height('').height(ad.el.height());
                    ad.isDrawn = false;
                }
            }

            if (common.ready) {
                $window.trigger('CN.customEvents.dartRequest');
            }
            return this;
        },

        /**
         * Resizes iFrame height to fit content on load.
         * @private
         */
        resize = function(e) {
            var
                frame  = e.data && e.data.key ? ads[e.data.key].frame : $(e.target),
                key    = frame.attr('name'),
                ad     = ads[key],
                textAd = false,
                body,
                bHeight;

            if (ad.doc) {
                body    = ad.doc.find('body');
                bHeight = body.outerHeight();
                textAd  = $('.textAd', body);
            }
            else {
                return this;
            }

            if (textAd.length) {
               textAd.clone().appendTo(ad.el);
               textAd.remove();
            }

            if (bHeight === 1) {
                ad.el.removeClass("ad-served").addClass("ad-not-served");
            }
            else {
                ad.el.removeClass("ad-not-served").addClass("ad-served");
            }

            frame.css({
                width   : ad.el.width(),
                height  : body.outerHeight()
            });

            // We clear the parent el height here.  It's fixed during
            // the refresh process to prevent page jumping.
            ad.el.height('');

            $window.trigger('CN.customEvents.dartResize.' + key, [key,'#' + key, ad]);
            $D.info('CN Ad Frame Resize', [key, frame.css('height') + ' x ' + frame.css('width')]);
        },

        /**
         * Resize iFrame height to fit content after ad is loaded. Call to function is made on newad page.
         * @param {Number}    tile    The tile number of the ad.
         * @public
         */
        recalSize = function(tile) {
            var
                adKey = CN.dart.get('tiles')[tile - 1],
                ad    = ads[adKey],
                body,
                bHeight;


            try {
                ad.doc = ad.frame.contents();
            }
            catch (err) {
                $D.warn("Failed to retrieve iframe content (err.descr.): " + err.description);
            }

            if (ad.doc) {
                body    = ad.doc.find('body');
                bHeight = body.outerHeight();
            }
            else {
                return this;
            }

            if (bHeight === 1) {
                ad.el.removeClass("ad-served").addClass("ad-not-served");
            }
            else {
                ad.el.removeClass("ad-not-served").addClass("ad-served");
            }

            ad.frame.css({
                width  : ad.el.width(),
                height : bHeight
            });
            $D.info('CN Ad Frame Recalculate Size', [adKey,ad.frame.css('height') + ' x ' + ad.frame.css('width')]);
        },

        /**
         * Updates the kws property of every ad in ads with common.ad.kws.
         * @private
         */
        updateKws = function() {
            var ad;
            for (ad in ads) {
                if (ads.hasOwnProperty(ad)) {
                    ads[ad].kws = unique(common.ad.kws, ads[ad].kws);
                }
            }
        },

        /**
         * {Object} test
         * Used during plugin evaluation to ensure proper value replacement. All tests must return
         * true or false to indicate failure or success.  All test conditions are necessary for properly
         * allowing modifications to values in the common object.
         * @public
         */
        test = (function() {
            var
                /**
                 * {RegExp} reserved
                 * Match any js-reserved characters
                 * @private
                 */
                reserved     = /([\?\+\\\^\$\*\.\(\)\[\]\|])/g,

                /**
                 * Combines sites with common.site and returns a period-delimited string.
                 * @param {String}   val   A site value.
                 * @returns {String}
                 * @private
                 */
                siteResolver = function(val) {
                    if (CN.site.testads) {
                        return common.site;
                    }

                    var
                        $val  = val.split('.'),
                        $site = common.site.split('.'),
                        i = 0,
                        len = $site.length > $val.length ? $site.length : $val.length,
                        result = [];

                    for (; i < len; i++){
                        result[i] = ($val[i] || $site[i]);
                    }

                    return result.join('.');
                },

                /**
                 * {RegExp} urlPat
                 * @private
                 */
                urlPat  = /^https?:/,

                /**
                 * {RegExp} zoneEnd
                 * @private
                 */
                zoneEnd = /;$|$/,

                /**
                 * {RegExp} zonePat
                 * @private
                 */
                zonePat = new RegExp(CN.site.testads ? "testads;" + "$" : "[\\w_;]+$"),

                /**
                 * Sanitizes a zone value.
                 * @param {String}  val  A zone value
                 * @returns {String}
                 * @private
                 */
                zoneResolver = function(val) {
                    var
                        prop,
                        map = common.charmap;

                    if (zonePat.test(val)) {
                        for (prop in map) {
                            if (map.hasOwnProperty(prop)) {
                                val = val.replace(new RegExp(prop, "gi"), map[prop]);
                            }
                        }
                        return val.replace(zoneEnd, ';');
                    }
                    $D.warn("CN Dart zoneResolver", ["Invalid Dart Zone", val]);
                    return val;
                },

                /**
                 * Sanitizes a kw value.
                 * @param {String}  val  A kw value
                 * @returns {String}
                 * @private
                 */
                kwResolver = function(val) {
                    var
                        prop,
                        map = common.charmap;


                    for (prop in map) {
                        if (map.hasOwnProperty(prop)) {
                            val = val.replace(new RegExp(prop, "gi"), map[prop]);
                        }
                    }
                    return val;
                };

            return {

                /**
                 * Allows modifications to the common.ad.kws
                 * @param {Object}  val  A hash containing a kws array.
                 * @returns {Boolean}
                 * @public
                 */
                ad  : function(val) {
                    if (!val.kws) {
                       return false;
                    }
                    else {
                        common.ad.kws = jQuery.isArray(val.kws) ? unique(val.kws) : common.ad.kws;
                        updateKws();
                        return true;
                    }
                },

                /**
                 * Adds a valid param object to common.params.
                 * @param {Object}  param  An object containing the param, its default value, and (optionally) a function to
                 *                         refresh itself should the value depend on the current state of certain properties.
                 * @returns {Boolean}
                 * @public
                 */
                addparam    : function(param) {
                    var
                        add = {};

                    if (!param && !param.pKey) {
                        return false;
                    }

                    add.defaultValue   = param.pValue;
                    add.refresh        = param.refresh;

                    common.params[param.pKey] = add;

                    return true;
                },

                /**
                 * Maps reserved characters to a value, and places them in common.charmap.
                 * @param {Object}  val  A hash of reserved characters and their replacements
                 * @returns {Boolean}
                 * @public
                 */
                charmap : function(val){
                    var
                        prop,
                        map = common.charmap = {};
                    for (prop in val) {
                        if (val.hasOwnProperty(prop)) {
                            map[prop.replace(reserved, '\\$1')] = val[prop];
                        }
                    }
                    return true;
                },

                /**
                 * Sets the common.dcopt flag.
                 * @param {Boolean}  val  If this is a dcopt ad
                 * @returns {Boolean}
                 * @public
                 */
                dcopt   : function(val) {
                    if (CN.isBoolean(val)) {
                        common.dcopt = val;
                        return true;
                    }
                    else {
                        return false;
                    }
                },

                /**
                 * Sets the common.embed flag.
                 * @param {Boolean}  val  If this is an embedded ad
                 * @returns {Boolean}
                 * @public
                 */
                embed   : function(val) {
                    if (CN.isBoolean(val)) {
                        common.embed = val;
                        return true;
                    }
                    else {
                        return false;
                    }
                },

                /**
                 * Sets the common.site value.
                 * @param {String}  val  The site string to be resolved and set
                 * @returns {Boolean}
                 * @public
                 */
                site    : function(val){
                    common.site = siteResolver(val);
                    return true;
                },

                /**
                 * Sets the common.url value.
                 * @param {String}  val  The url string to format and set
                 * @returns {Boolean}
                 * @public
                 */
                url     : function(val){
                    if(CN.isString(val)){
                        common.url = val.replace(urlPat,location.protocol);
                        return true;
                    }
                    return false;
                },

                /**
                 * Sets the common.zone value.
                 * @param {String}  val  The zone string to resolve and set
                 * @returns {Boolean}
                 * @public
                 */
                zone    : function(val){
                    var ret = zoneResolver(val);
                    if (ret) {
                        common.zone = ret;
                        return true;
                    }
                    return false;
                },

                /**
                 * Publicizes test.zoneResolver.
                 * @param {String}  val  The zone string to resolve.
                 * @returns {String}
                 * @public
                 */
                adzone  : zoneResolver,

                /**
                 * Publicizes test.kwResolver.
                 * @param {String}  val  The kw string to resolve.
                 * @returns {String}
                 * @public
                 */
                kws  : function(kws) {
                    var
                        arr = (kws) ? [].concat(kws) : [],
                        i = 0,
                        len = arr.length;

                    for (; i <len; i++) {
                        arr[i] = kwResolver(arr[i]);
                    }
                    return arr;
                }


            };
        }()),

        /**
         * Creates an array with unique values from a set of arrays.
         * @param   {Array}  arguments   Array(s) to be concatenated and filtered.
         * @returns {String}
         * @private
         */
        unique = function() {
            var
                v,
                i = 0,
                ret = [].concat.apply([], arguments).sort(),
                l = ret.length;

            for (; i < l; i++) {
                v = ret.shift();
                if (ret[0] !== v) {
                    ret.push(v);
                }
            }
            return clean_ws(ret.join(',')).split(',');
        },

        /**
         * Strips out an white-space in a string.
         * @param {String}  str   The string to process
         * @returns {String}
         * @private
         */
        clean_ws = function(str){
            return str.replace(/^,|\s*|,^/g, '');
        },

        /**
         * {Object} remote
         * Object for containing methods used for calling dart from an external source.
         * @deprecated
         * @public
         */
        remote = {
            init : function(site,zone,kws){

                if (!zone || common.initialized) {
                    $D.info(msg_pre + "Remote Init error.  No calls will be made.",["site : " + site]);
                    return this;
                }

                common.frameurl   = site + common.frameurl;
                common.remoteSite = site;
                common.remoteInit = site + common.remote + 'init/' + zone + '/' + 'kw=' + CN.url.path().join(';kw=') + ';' + kws;
                embedScript(common.remoteInit);
            }

        },

        /**
         * Generates a script tag for the ad call, and appends it to the container [placement][common.container]
         * For embedded ads this is the actual call execution.
         * @param {String}   placement   DART ad placement identifier
         * @param {String}   [url]       Url to be used in place of ad pars
         * @returns {CN.dart}
         * @deprecated  Ads should be rendered with the friendly iframe implementation
         * @private
         */
        drawEmbedded = function(placement, url) {
            var
                ad = ads[placement];


            $D.info(messager('call'), [placement, ad]);

            ad.frame = false;
            embedScript(ad.url = buildurl(ad, url));

            ad.isDrawn = true;
            $window.trigger('CN.customEvents.dartAdDrawn.' + placement, [placement, "#" + placement, ad]);
            $D.info(messager('drawn'), [placement, ad]);

            return this;
        },

        /**
         * Generate a script element for embedded ads and remote calls.  This function will block.
         * @param {String}   src   The location of the ad
         * @deprecated
         * @private
         */
        embedScript = function(src) {
            document.write('<scr'+'ipt type="text/javascript" src="'+src+'"></scr'+'ipt>');
        },

        /**
         * Calls draw using the key from the event data
         * @param   {Object}    e    The event object
         * @deprecated
         * @private
         */
        requestQueue = function(e) {
            draw(e.data.key);
        },

        /**
         * Event interface for refresh
         * @param   {object}    e    The event object
         * @deprecated
         * @private
         */
        refreshQueue = function(e){
            /* Map the event object e's data property for refresh */
            draw(e.data.key,e.data.url);
        },

        /**
         * DART request event handler.
         * @param {Object}  e   The event object.
         * @deprecated  An anonymous function should call draw directly.
         * @private
         */
        requestHandler = function(e) {
            draw(e.data.key);
        };

    /**
     * Have ready be the default callback to CN.customEvents.dartInitialized.
     * Registering a plugin unbinds this event.
     */
    $window.one('CN.customEvents.dartInitialized', ready);

    // Allow plugins to asynchronously send back data when they've completed
    $window.bind('CN.customEvents.dartPlugin', plugin, plugin.finished);

    timer.mark('start');

    return {

        /**
         * Publicize buildurl.
         * @param {Object}    ad         DART ad object
         * @param {String}    [url]      Optional url to use in place of ad object properties
         * @returns {String}
         * @public
         */
        buildurl : buildurl,

        /**
         * Fetches an ad call from the ads object.
         * @param {String}    key     The property name
         * @returns {Object}
         * @public
         */
        calls : function(key) {
            return $.extend({}, (key === true ? ads : (CN.isNumber(key) ? ads[common.tiles[key]] : ads[key] || {})));
        },

        /**
         * Publicize call.
         * @param {String}    name        Unique name prefix for storage, container div, and iframe id generation
         * @param {Object}    [pars]      Additional ad params to extend or override common.ad values
         * @returns {CN.dart}
         * @public
         */
        call : call,

        /**
         * Publicize timer
         * @public
         */
        timer : timer,

        /**
         * Invokes call method when ads exist in the common tiles object.
         * @param {String}    name          Unique name prefix for storage, container div, and iframe id generation
         * @param {String}    placement     The dimensions of the ad
         * @returns {CN.dart}
         * @public
         */
        clone : function(placement, name){
            if (common.tiles.length) {
                return call(name, {
                    sz  : placement,
                    kws : ads[common.tiles[0]].kws
                });
            }

            return false;
        },

        /**
         * Publicizes refresh
         * @param  {String}    ads       Array, CSV or space-delimited list of ads id's
         * @returns {CN.dart}
         * @public
         */
        refresh : refresh,

        /**
         * Returns a common object property
         * @param  {Array}    props       Array of properties to fetch.
         * @returns {Object}
         * @public
         */
        get : function(props){
            props = [].concat(props);
            var
                i = 0,
                len = props.length,
                ret = {},
                prop;

            for (; i < len; i++) {
                prop = props[i];
                ret[prop] = (common[prop] || common[prop] === false ? common[prop] : undefined);
            }
            return len > 1 ? ret : ret[prop];
        },

        /**
         * Publicizes init
         * @param {Object}  pars    Shared params - ex: site, zone, shared kws.
         * @public
         */
        init : init,

        /**
         * Publicizes the onFrameDraw callback if CN.dart is configured to draw iframed ads.
         * @public
         */
        ondraw : common.embed ? false : onFrameDraw,

        /**
         * Publicizes ready
         * @public
         */
        ready : ready,

        /**
         * Publicizes recalSize
         * @param {Number}    tile    The tile number of the ad.
         * @public
         */
        recalSize : recalSize,

        /**
         * Allows plug-ins to be installed on CN.dart.plugin
         * @param {Object}    install    The plug-in to install
         * @returns {CN.dart}
         * @public
         */
        register : function(install) {
            var
                i = 0,
                len;

            if (!install) {
                return this;
            }

            install = [].concat(install);
            len = install.length;

            for (; i < len; i++) {
               plugin.register(install[i]);
            }

            return this;
        },

        /**
         * {Object} remote
         * Publicizes remote object.
         * @deprecated
         * @public
         */
        remote : remote,

        /**
         * {Object} test
         * Publicizes test object.
         * @public
         */
        test : test
    };

}(jQuery, CN, CN.debug));

/**
 * CN.dart.ipad
 * CN.dart plug-in for iPad
 * @author Russell Munson
 * @requires CN, jQuery
 */
CN.dart.ipad = (function(ua) {
    var
        suff = ".ipad",

        init = function(obj){
            var
                i = 0,
                len = plugin.callbacks.length;

            plugin.isFinished = true;
            jQuery(window).trigger('CN.customEvents.dartPlugin', [plugin, {
                site : CN.dart.get('site') + suff
            }]);

            for (; i < len; i++) {
                plugin.callbacks[i]["func"].apply((plugin.callbacks[i]["scope"] || null), (plugin.callbacks[i]["args"] || []));
            }
        },

        plugin = {
            init       : ua.indexOf('ipad') !== -1 ? init : false,
            name       : 'CN Ad User Agent Plugin',
            callbacks  : [],
            isFinished : ua.indexOf('ipad') === -1
        };

    return plugin;
}(navigator.userAgent.toLowerCase()));

/**
 * CN.dart.suppression
 * @author Russell Munson
 * @requires CN, jQuery
 */
CN.dart.suppression = (function() {
    var
        pars = CN.url.params(),

        ret = false,

        //Plugin interface method
        init = function(obj) {
            var
                i = 0,
                len = plugin.callbacks.length;

            plugin.isFinished = true;
            jQuery(window).trigger('CN.customEvents.dartPlugin', [plugin, ret]);

            for (; i < len; i++) {
                plugin.callbacks[i]["func"].apply((plugin.callbacks[i]["scope"] || null), (plugin.callbacks[i]["args"] || []));
            }
        },

        plugin;

    // Check for npu param, and toggle dcopt off if present
    if (pars.npu === '1' || (pars.mbid && pars.mbid.match(/yhoo|google[1-5]?$/))){
        ret = {
            dcopt : false
        };
    }

    plugin = {
        // If conditions exist to modify ad common settings, define interface
        // or return false to skip processing
        init       : ret ? init : false,
        name       : 'CN Ad Param-based Modifiers',
        callbacks  : [],
        isFinished : !ret
    };

    return plugin;
}());

CN.dart.register([CN.dart.ipad,CN.dart.suppression]);
