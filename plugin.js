/**
 * plugin js
 * A jquery extension for creating jquery plugins
 * @author Mark McCann (www.markmccann.me)
 * @license MIT
 * @version 0.0.1
 * @require jQuery
 */

;(function(){

    /**
     * the base object that all plugins inherit from
     */
    var Base = function( element, options, defaults ) {
        var inst = this;
        // the source element for this instance
        inst.source = $(element);
        // get and set id for the instance
        inst.id = inst.source.attr('id') || false;
        // collect and define settings from:
        // 1. the default options defined at "add" method
        // 2. the source element's dataset – ie. data-[key]="[value]"
        // 3. the options passed in on init - ie. $([selector],[options])
        inst.settings = $.extend({}, defaults, Base.util.dataset(inst.source[0]), options );
        // collect all references to this instance with it's id
        inst.references = $( '[href="#'+inst.id+'"],[data-bind="#'+inst.id+'"]' );
        // return instance
        return inst;
    }

    $.extend( Base, {
        // a namespace to store all plugin objects added
        plugins: {},
        // a set of handy utility methods
        util: {
            /**
             * returns a camel-cased string
             * @param [string]
             * @return [string]
             */
            camelize: function( string ) {
                return string.toLowerCase()
                    // Replaces any - or _ characters with a space 
                    .replace( /[-_]+/g, ' ')
                    // Removes any non alphanumeric characters 
                    .replace( /[^\w\s]/g, '')
                    // Uppercases the first character in each group   
                    // immediately following a space (delimited by spaces) 
                    .replace( / (.)/g, function($1) { return $1.toUpperCase(); })
                    // Removes spaces 
                    .replace( / /g, '' );
            },
            /**
             * intelligently converts a string to type
             * @param [string]
             * @return [string|integer|booleam]
             */
            typify: function( string ) {
                // if only whole numbers, convert to integer
                if( /^\d*$/.test(string) ) return parseInt( string );
                // if "true" or "false", return boolean
                if( /^true$/.test(string) ) return true;
                if( /^false$/.test(string) ) return false;
                // else, return original string
                return string;
            },
            /**
             * collects an element's data attributes, converts each value to type
             * and returns a set of key/value pairs.
             * @param [DOMelement]
             * @return [object]
             */
            dataset: function( e ) {
                var inst = this;
                return Object.keys( e.dataset ).reduce(function(data,key){
                    data[ inst.camelize(key) ] = inst.typify(e.dataset[key]);
                    return data;
                }, {});
            }
        },
        /**
         * initalizes a plugin and stores/returns the new instance(s)
         * @param [string] query
         * @param [object] config
         * @return [array|object]
         */
        init: function( query, options ) {
            // an empty array to store all new instances
            var inits = [], Plugin = this;
            // loop through each element in query and initalize
            $( query ).each(function(){
                // create new instance
                var inst = new Plugin( this, options );
                // use the source element's id as key, if no id, 
                // use plugin name and length int (ie. [plugin]-[int])
                var id = this.id ? Base.util.camelize(this.id) : inst.plugin+'-'+(Object.keys(Plugin.instances).length+1);
                // store new instance in static variable with unique key
                Plugin.instances[ id ] = inst;
                // add instance to local array to return
                inits.push( inst );
            });
            // return array if more than one element was intialized
            return inits.length > 1 ? inits : inits[0];
        },
        /**
         * adds a plugin to plugin infrastructure
         * @param name [string]
         * @param Extension [object]
         * @param defaults [object]
         */
        add: function( name, Extension, defaults ) {
            // camelize the plugin name
            var n = Base.util.camelize(name);
            // make sure plugin hasn't already been added
            if( !Base.plugins.hasOwnProperty(n) ) {
                // create new plugin, inherit from Base object
                var Plugin = function( element, options ){
                    this.plugin = name;
                    Base.call( this, element, options || {}, defaults || {} );
                    Extension.call( this );
                    return this;
                }
                // inherit class methods from 'extension' object
                $.extend( Plugin.prototype, Extension.prototype, {
                    constructor: Plugin
                });
                // inherit static methods from 'extension' object
                $.extend( Plugin, Extension, { instances: {} } );
                // add init method to instance as well
                Plugin.init = Base.init;
                // add plugin to jquery prototype: $('').[ thisPlugin ]()
                $.fn[ n ] = function( options ){
                    return Plugin.init.call( Plugin, this, options );
                }
                // store the new plugin on base object
                Base.plugins[ name ] = Plugin;
                // for any elements set to auto-init, initialize them
                $('[data-init='+name+']')[n]();
            // if plugin already exists, console error message
            } else {
                console.error('The plugin "'+name+'" already exists.' );
            }
        }
    }) 

    // store plugin object on jquery global var
    $.plugin = Base;

})();