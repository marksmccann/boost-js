Boost JS [![Build Status](https://travis-ci.org/marksmccann/boost-js.svg?branch=master)](https://travis-ci.org/marksmccann/boost-js)
==================================================

A jQuery plugin generator with a few tricks up its sleeve.


Installation
--------------------------------------
Install with npm:
```bash
npm install boost-js
```
Install in browser:
```html
<script src="https://cdn.rawgit.com/marksmccann/boost-js/v0.4.1/dist/boost.min.js"></script>
```


Usage
--------------------------------------
### Create Plugin
```javascript
var boost = require('boost-js');
// var boost = $.fn.boost; (browser install)

function MyPlugin () {
    // reserved attributes (see below for details)
    this.source;
    this.id;
    this.settings;
    this.references;
    this.roles;
}
MyPlugin.prototype = {...};

$.fn.myplugin = boost(MyPlugin, {}/* options */);
```
### Call Plugin
```javascript
$('div').myplugin({foo:'bar'});
```


Reserved Attributes
--------------------------------------------
There are 5 reserved attributes which you can reference within your plugin's constructor.

### this.source
The element used to initialize your plugin.

### this.id
The value of the source element's `id` if present.

### this.settings
Your plugin's settings are collected from three places, in order of priority:

1. @creation (defaults)

    ```javascript
    $.fn.myplugin = boost(MyPlugin, {
        foo: 'bar'
    });
    ```
2. @data-attribute (on source element)

    ```html
    <div data-foo="bar"></div>
    ```
3. @instantiation

    ```javascript
    $('div').myplugin({
        foo: 'bar'
    });
    ```

### this.references
You can easily associate any element with your plugin by referencing the id in a `href` or `data-bind` attribute.
```html
<div id="my-plugin"></div>
<a href="#my-plugin">click me</a>
<button data-bind="#my-plugin">click me</button>
```
```javascript
var MyPlugin = function(){
    this.references.on('click', function(){
        console.log('hello world!');
    });
}
```
### this.roles
You can also group your references by role with the `data-role` attribute.
```html
<div id="my-plugin"></div>
<button data-bind="#my-plugin" data-role="trigger">click me</button>
```
```javascript
var MyPlugin = function(){
    this.roles['trigger'].on('click', function(){
        console.log('hello world!');
    });
}
```


API
--------------------------------------

### boost( fn, [options] )
`fn` will be called using a new keyword for each element the plugin is called for. `[options]` is an object literal which will define the default settings for every instantiation of the plugin.
```javascript
var MyPlugin = function() {...}
$.fn.myplugin = boost( MyPlugin, {foo:'bar'} );
```

### boost.auto()
You can instantiate any plugin directly from the HTML after running the `boost.auto` method. It should only be run once and after all plugins have been defined.
```javascript
var boost = require('boost-js');
// define plugins here ...
boost.auto();
```
Now you can initialize directly from an element via the `[data-init]` attribute.
```html
<div data-init="myplugin"></div>
```

### $().myplugin( [options] )
Your plugin will be instantiated on every element in the set, with the `options` overriding the values defined in the `boost()` method. Will return array if more than one instance is created.
```javascript
var inst = $('.some-class').myplugin( {foo:'bar'} );
```

### $.fn.myplugin.init( [elems], [options] )
You can also access the init method directly to instantiate a plugin manually.
```javascript
var inst = $.fn.myplugin.init( document.getElementById('someId'), {foo:'bar'} );
```

### $.fn.myplugin.instances
Each instance for a plugin is stored in an object. Boost JS uses the instance's id or it's position in the object as the key.
```javascript
var someInstance = $.fn.myplugin.instances.someId;
```

### $.fn.myplugin.defaults
The default options for the plugin; the same as was passed in at creation.
```javascript
var defaultSettings = $.fn.myplugin.defaults;
```


Running Tests
--------------------------------------

```bash
$ npm install && npm test
```


License
--------------------------------------

Copyright © 2016, [Mark McCann](https://github.com/marksmccann).
Released under the [MIT license](LICENSE).
