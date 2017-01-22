// Utils.js
// --------
// A collection of utility methods
// This are added to both SPA.Utils, and Underscore.js
// eg: you could use SPA.Utils.formatPhone() or _.formatPhone()
(function () {
    'use strict';

    // translate:
    // used on all of the harcoded texts in the templates
    // gets the translated value from SPA.Translations object literal
    function translate(text) {
        if (!text) {
            return '';
        }

        text = text.toString();
        // Turns the arguments object into an array
        var args = Array.prototype.slice.call(arguments)

            // Checks the translation table
            , result = SPA.Translations && SPA.Translations[text] ? SPA.Translations[text] : text;

        if (args.length && result) {
            // Mixes in inline variables
            result = result.format.apply(result, args.slice(1));
        }

        return result;
    }

    // getFullPathForElement:
    // returns a string containing the path
    // in the DOM tree of the element
    function getFullPathForElement(el) {
        var names = [], c, e;

        while (el.parentNode) {
            if (el.id) {
                // if a parent element has an id, that is enough for our path
                names.unshift('#' + el.id);
                break;
            }
            else if (el === document.body) {
                names.unshift('HTML > BODY');
                break;
            }
            else if (el === (document.head || document.getElementsByTagName('head')[0])) {
                names.unshift('HTML > HEAD');
                break;
            }
            else if (el === el.ownerDocument.documentElement) {
                names.unshift(el.tagName);
                break;
            }
            else {
                e = el;
                for (c = 1; e.previousElementSibling; c++) {
                    e = e.previousElementSibling;
                }
                names.unshift(el.tagName + ':nth-child(' + c + ')');
                el = el.parentNode;
            }
        }

        return names.join(' > ');
    }

    function substitute(text, object) {
        text = text || '';

        return text.replace(/\{(\w+)\}/g, function (match, key) {
            return typeof object[key] !== 'undefined' ? object[key] : match;
        });
    }

    // iterates a collection of objects, runs a custom function getValue on each item and then joins them
    // returns a string.
    function collectionToString(options) {
        var temp = [];
        _.each(options.collection, function (item) {
            temp.push(options.getValue(item));
        });

        return temp.join(options.joinWith);
    }

    // params map
    function addParamsToUrl(baseUrl, params) {
        // We get the search options from the config file
        if (params && _.keys(params).length) {
            var paramString = jQuery.param(params)
                , join_string = ~baseUrl.indexOf('?') ? '&' : '?';

            return baseUrl + join_string + paramString;
        }
        else {
            return baseUrl;
        }
    }

    // parseUrlOptions:
    // Takes a url with options (or just the options part of the url) and returns an object. You can do the reverse operation (object to url string) using jQuery.param()
    function parseUrlOptions(options_string) {
        options_string = options_string || '';

        if (~options_string.indexOf('?')) {
            options_string = _.last(options_string.split('?'));
        }

        if (~options_string.indexOf('#')) {
            options_string = _.first(options_string.split('#'));
        }

        var options = {};

        if (options_string.length > 0) {
            var tokens = options_string.split(/\&/g)
                , current_token;

            while (tokens.length > 0) {
                current_token = tokens.shift().split(/\=/g);

                if (current_token[0].length === 0) {
                    continue;
                }

                options[current_token[0]] = decodeURIComponent(current_token[1]);
            }
        }

        return options;
    }

    function objectToStyles(obj) {
        return _.reduce(obj, function (memo, value, index) {
            return memo += index + ':' + value + ';';
        }, '');
    }

    // simple hyphenation of a string, replaces non-alphanumerical characters with hyphens
    function hyphenate(string) {
        return string.replace(/[\W]/g, '-');
    }

    function objectToAtrributes(obj, prefix) {
        prefix = prefix ? prefix + '-' : '';

        return _.reduce(obj, function (memo, value, index) {
            if (index !== 'text' && index !== 'categories') {
                memo += ' ' + prefix;

                if (index.toLowerCase() === 'css' || index.toLowerCase() === 'style') {
                    index = 'style';
                    // styles value has to be an obj
                    value = objectToStyles(value);
                }

                if (_.isObject(value)) {
                    return memo += objectToAtrributes(value, index);
                }

                memo += index;

                if (value) {
                    memo += '="' + value + '"';
                }
            }

            return memo;
        }, '');
    }


    function getAbsoluteUrl(file) {
        var base_url = SPA.ENVIRONMENT.baseUrl
            , fileReplace = file ? file : '';
        return base_url ? base_url.replace('{{file}}', fileReplace) : file;
    }


    //Fixes anchor elements, preventing default behavior so that
    //they do not change the views (ie: checkout steps)
    function preventAnchorNavigation(selector) {
        jQuery(selector).on('click', function (e) {
            e.preventDefault();
        });
    }

    // The reason for this method is be able to test logic regarding window.location - so tests can mock the window object
    function getWindow() {
        return window;
    }


    function getPathFromObject(object, path, default_value) {
        if (!path) {
            return object;
        }
        else if (object) {
            var tokens = path.split('.')
                , prev = object
                , n = 0;

            while (!_.isUndefined(prev) && n < tokens.length) {
                prev = prev[tokens[n++]];
            }

            if (!_.isUndefined(prev)) {
                return prev;
            }
        }

        return default_value;
    }

    function setPathFromObject(object, path, value) {
        if (!path) {
            return;
        }
        else if (!object) {
            return;
        }

        var tokens = path.split('.')
            , prev = object;

        for (var token_idx = 0; token_idx < tokens.length - 1; ++token_idx) {
            var current_token = tokens[token_idx];

            if (_.isUndefined(prev[current_token])) {
                prev[current_token] = {};
            }
            prev = prev[current_token];
        }

        prev[_.last(tokens)] = value;
    }


    function reorderUrlParams(url) {
        var params = []
            , url_array = url.split('?');

        if (url_array.length > 1) {
            params = url_array[1].split('&');
            return url_array[0] + '?' + params.sort().join('&');
        }

        return url_array[0];
    }

    // search within a given url the values of the shopper session
    function getSessionParams(url) {
        // add session parameters to target host
        var params = {}
            , ck = _.getParameterByName(url, 'ck')
            , cktime = _.getParameterByName(url, 'cktime');

        if (ck && cktime) {
            params.ck = ck;
            params.cktime = cktime;
        }

        return params;
    }

    function getParameterByName(url, param_name) {
        param_name = param_name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + param_name + '=([^&#]*)')
            , results = regex.exec(url);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }


    SPA.Utils = {
        translate: translate
        , substitute: substitute
        , getFullPathForElement: getFullPathForElement
        , collectionToString: collectionToString
        , addParamsToUrl: addParamsToUrl
        , parseUrlOptions: parseUrlOptions
        , objectToAtrributes: objectToAtrributes
        , hyphenate: hyphenate
        , getAbsoluteUrl: getAbsoluteUrl
        , preventAnchorNavigation: preventAnchorNavigation
        , getWindow: getWindow
        , getPathFromObject: getPathFromObject
        , setPathFromObject: setPathFromObject
        , reorderUrlParams: reorderUrlParams
        , getSessionParams: getSessionParams
        , getParameterByName: getParameterByName
        , guid: function () {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        },

        reasonFromError: function (taskCtx, err) {
            if (!err) {
                return taskCtx.createReason('JS_ERROR');
            }
            if (!err.code) {
                return taskCtx.createReason('JS_ERROR', err);
            }
            return taskCtx.createReason(err.code, err);
        },

        createError: function (code, message, inner) {
            return {
                clu: true,
                code: code,
                message: message,
                inner: inner
            };
        },
        extendObj: function (destObj, sourceObj, options) {
            return jQuery.extend(true, destObj, sourceObj);
        },

        clone: function (sourceObj) {
            //return _.clone(sourceObj);
            return JSON.parse(JSON.stringify(sourceObj));
        },

        taskCriticalEscalation: function (reason) {
            SPA.showCriticalError(reason);
        },
        taskResolve: function (task) {
            return function (pvalue) {
                task.resolve(pvalue);
            };
        },
        taskReject: function (task) {
            return function (reason) {
                task.reject(reason);
            };
        },
        taskNotify: function (task) {
            return function (progressInfo) {
                task.notify(progressInfo);
            };
        },
        operationResolve: function (operation) {
            return function (pvalue) {
                operation.resolve(pvalue);
            };
        },
        operationReject: function (operation) {
            return function (reason) {
                operation.reject(reason);
            };
        },
        operationNotify: function (operation) {
            return function (progressInfo) {
                operation.notify(progressInfo);
            };
        },
        handleRejectThrowingReason: function (reason) {
            throw reason;
        },
        handleRejectSilent: function (reason) {
            clog('silently handling fail. Rejection with reason:');
            clog(reason);
        },
        isXHR: function (obj) {
            return obj && obj.readyState;
        },
        hasValue: function (value) {
            return !(_.isNull(value) || _.isUndefined(value) || (_.isString(value) && this.trim(value) === ''));
        },
        areSimpleObjectsSame: function (obj1, obj2) {
            return JSON.stringify(obj1) === JSON.stringify(obj2);
        },
        getSessionId: function () {
            return 'notimplemented';
        },
        formatDate: function(date){
            return moment(date).format('YYYY-MM-DD');
        }
    };

    // We extend underscore with our utility methods
    // see http://underscorejs.org/#mixin
    _.mixin(SPA.Utils);

})();
