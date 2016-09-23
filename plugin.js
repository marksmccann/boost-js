/*!
 * jquery-plugin-maker <https://github.com/marksmccann/jquery-plugin-maker>
 *
 * Copyright (c) 2016, Mark McCann.
 * Licensed under the MIT License.
 */

// -----------------------------------------------------------------

/**
 * Converts any string into a "javascript-friendly" version.
 *
 * @param {string} str
 * @return {string}
 */
var camelize = function( str ) {
    return str.toLowerCase()
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
 * @return {string|integer|boolean}
 */
var typify = function( str ) {
    // if only whole numbers, convert to integer
    if( /^\d*$/.test(str) ) return parseInt( str );
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
 * @param {object} e DOMelement
 * @return {object} [{label:value},...]
 */
var dataset = function( e ) {
    var inst = this;
    return Object.keys( e.dataset ).reduce(function(data,key){
        data[ camelize(key) ] = typify(e.dataset[key]);
        return data;
    }, {});
}

/**
 * generates a unique ID for a Plugin instance by either using the
 * source elem's id or a unique integer.
 *
 * @param {string} id
 * @return {string}
 */
var uid = 0;
var guid = function( id ) {
    return id ? camelize(id) : (uid++).toString();
}

// -------------------------------------------------------------

/**
 * The base object; that all plugins inherit from
 *
 * @param {object} id
 * @param {object} id
 * @return {string}
 */
var BasePlugin = function( element, options, defaults ) {
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
    inst.references = $('[href="#'+inst.id+'"],[data-bind="#'+inst.id+'"]');
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
 * Initializes a series of plugins.
 *
 * @param {object} id
 * @param {object} id
 * @return {string}
 */
BasePlugin.init = function( $elems, options ) {
    // an empty array to store all new instances
    var inits = [], Plugin = this;
    // loop through each element in query and initalize
    $elems.each(function(){
        // instantiate a new plugin
        var inst = new Plugin( this, options );
        // store new instance in static variable with unique key
        Plugin.instances[ guid(inst.id) ] = inst;
        // add the instance to local array for return
        inits.push( inst );
    });
    // return array if more than one element was intialized
    return inits.length > 1 ? inits : inits[0];
}

/**
 * Creates a new plugin
 *
 * @param {object} MyPlugin Class or function for which plugin will be created
 * @param {object} defaults Default settings for this plugin
 * @return {function}
 */
module.exports = function( MyPlugin, defaults ) {

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
            BasePlugin.call( this, element, options || {}, defaults || {} );
            MyPlugin.call( this, element, options );
            return this;
        }
        // inherit prototype methods from MyPlugin
        Plugin.prototype = MyPlugin.prototype;
        // set constructor method to Plugin
        Plugin.prototype.constructor = Plugin;
        // set a couple static variables
        Plugin.init = BasePlugin.init;
        Plugin.instances = {};

        /**
         * An externalized object used to initialize the plugin and 
         * provides external access to plugin.
         *
         * @param {object} options
         * @return {object} instance
         */
        var Make = function( options ) {
            return Plugin.init.call( Plugin, this, options );
        }
        // externalize a couple vars by attaching them to obj
        Make.init = Plugin.init;
        Make.instances = Plugin.instances;

        // return the Make object
        return Make;

    } else {

        throw '\'jquery-plugin-maker\' requires a function as first paramater.';
        
    }

}