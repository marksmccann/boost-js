/**
 * Boost JS <https://github.com/marksmccann/boost-js>
 * A jQuery plugin generator with a few tricks up its sleeve.
 * @author Mark McCann <http://www.markmccann.me>
 * @license MIT
 * @version 0.2.0
 */

// -----------------------------------------------------------------

/**
 * Converts any string into a "javascript-friendly" version.
 *
 * @param {string} str
 * @return {string} camelized
 */
var camelize = function( str ) {
    return str
        // Replaces any - or _ characters with a space
        .replace( /[-_]+/g, ' ')
        // Removes any non alphanumeric characters
        .replace( /[^\w\s]/g, '')
        // Uppercases the first character in each group
        // immediately following a space (delimited by spaces)
        .replace( / (.)/g, function($1) { return $1.toUpperCase(); })
        // Removes spaces
        .replace( / /g, '' );
}

/**
 * Intelligently converts a string to integer or boolean.
 *
 * @param {string} str
 * @return {multi} str string|integer|boolean
 */
var typify = function( str ) {
    // if whole numbers, convert to integer
    if( /^\d+$/.test(str) ) return parseInt( str );
    // if decimal, convert to float
    if( /^\d*\.\d+$/.test(str) ) return parseFloat( str );
    // if "true" or "false", return boolean
    if( /^true$/.test(str) ) return true;
    if( /^false$/.test(str) ) return false;
    // else, return original string
    return str;
}

/**
 * Collects an element's data attributes, converts each value to type
 * and returns a set of key/value pairs.
 *
 * @param {object} elem DOMelement
 * @return {object} array [{label:value},...]
 */
var dataset = function( elem ) {
    var data = {}, attr = elem.attributes;
    for( var i in attr ) {
        if( /^data-/.test(attr[i].name) ) {
            var key = attr[i].name.replace(/^data-/,'');
            data[ camelize(key) ] = typify( attr[i].value );
        }
    }
    return data;
}

// -------------------------------------------------------------

/**
 * The base object; that all plugins inherit from
 *
 * @param {object} element DOMelement
 * @param {object} options app settings for instance
 * @param {object} defaults app settings defaults
 * @return {object} instance
 */
var Boilerplate = function( element, options, defaults ) {
    // local var for instance
    var inst = this;
    // the source element for this instance
    inst.source = $(element);
    // get and set id for the instance
    inst.id = inst.source.attr('id') || '';
    // collect and define settings from:
    // 1. the default options defined when plugin was created
    // 2. the source element's dataset – ie. data-[key]="[value]"
    // 3. the options passed in on init - ie. $(...).myplugin({options})
    inst.settings = $.extend({}, defaults, dataset(inst.source[0]), options );
    // collect any element the refernces our source element
    inst.references = (inst.id.length > 0) ? $('[href="#'+inst.id+'"],[data-bind="#'+inst.id+'"]') : $();
    // organize references by role for easier access
    inst.roles = {};
    inst.references.filter('[data-role]').each(function(){
        // get the role name from element
        var role = $(this).data('role');
        // if role doesn't exists, create empty object
        if( !inst.roles.hasOwnProperty(role) ) inst.roles[role] = $();
        // add this element to appropriate slot
        inst.roles[role] = inst.roles[role].add(this);
    });
    // return instance
    return this;
}

/**
 * Initializes a plugin.
 *
 * @param {object} elems DOMlist or jQuery
 * @param {object} options settings for this instance
 * @return {object} instance array of instances if more than one
 */
Boilerplate.init = function( elems, options ) {
    // an empty array to store all new instances
    var inits = [], Plugin = this;
    // loop through each element in query and initalize
    $(elems).each(function(){
        // instantiate a new plugin
        var inst = new Plugin( this, options || {} );
        // store new instance in static variable with unique key
        var id = inst.id.length > 0
            ? camelize(inst.id)
            : Object.keys(Plugin.instances).length.toString();
        Plugin.instances[ id ] = inst;
        // add the instance to local array for return
        inits.push( inst );
    });
    // return array if more than one element was intialized
    return inits.length > 1 ? inits : inits[0];
}

/**
 * Creates a new plugin
 *
 * @param {object} MyPlugin Class from which plugin will be created
 * @param {object} defaults Default settings for this plugin
 * @return {object} instance
 */
var Boost = function( MyPlugin, defaults ) {

    // make sure a function has been passed in to
    // create a plugin from.
    if (typeof MyPlugin === 'function') {

        /**
         * the plugin object, inherits all attributes and methods
         * from the base plugin and the user's plugin
         *
         * @param {object} element
         * @param {object} options
         * @return {object} instance
         */
        var Plugin = function( element, options ) {
            Boilerplate.call( this, element, options || {}, defaults || {} );
            MyPlugin.call( this, element, options );
            return this;
        }
        // inherit prototype methods from MyPlugin
        Plugin.prototype = MyPlugin.prototype;
        // set constructor method to Plugin
        Plugin.prototype.constructor = Plugin;
        // set a couple static variables
        Plugin.init = Boilerplate.init;
        Plugin.instances = {};

        /**
         * An externalized object used to initialize the plugin and
         * provides external access to plugin.
         *
         * @param {object} options
         * @return {object} instance
         */
        var Boost = function( options ) {
            return Plugin.init.call( Plugin, this, options );
        }
        // externalize a couple vars by attaching them to obj
        Boost.init = function( elems, options ) {
            return Plugin.init.call( Plugin, elems, options );
        }
        Boost.instances = Plugin.instances;

        // return the Boost object
        return Boost;

    } else {

        throw '\'Boost JS\' requires a function as first paramater.';

    }

}

/**
 * Add an auto-init method to boost object
 *
 * @param {object} MyPlugin Class from which plugin will be created
 * @param {object} defaults Default settings for this plugin
 * @return {object} instance
 */

Boost.auto = function() {
    // an empty array to collect the names of init-ed plugins
    var init = [];
    // loop through each element with a [data-init] attribute
    // and initialize the plugin in its value
    $('[data-init]').each(function(){
        // the name of the plugin
        var plugin = $(this).data('init');
        var camelized = camelize(plugin);
        // make sure it hasn't already been init-ed and that it
        // exists on jQuery's prototype
        if( init.indexOf(camelized) === -1 && typeof $.fn[camelized] !== 'undefined' ) {
            // initialize the specified plugin
            $('[data-init="'+plugin+'"]')[camelized]();
        }
    });
}

// return boost object
module.exports = Boost;
