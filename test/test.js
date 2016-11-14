var assert = require('chai').assert;
var jsdom = require('mocha-jsdom');

var MyPlugin = function() {
    return this;
}

MyPlugin.prototype.getSource = function() {
    return this.source;
}

describe('Boost JS', function () {

    jsdom()

    before(function () {
        $ = require('jquery')
        boost = require('../src/boost.js')
    });

    describe('plugin', function () {

        it('should be attached to jquery prototype', function () {
            $.fn.myplugin = boost(MyPlugin);
            assert.isDefined( $.fn.myplugin );
        });

        it('should throw error if no function is provided', function () {
            assert.throws(function(){boost();});
        });

    });

    describe('init', function () {

        it('should be accessible from jquery instance', function () {
            document.body.innerHTML = '<div></div>';
            $.fn.myplugin = boost(MyPlugin);
            var inst = $('div').myplugin();
            assert.match( inst.source[0].nodeName, /DIV/i );
        });

        it('should also be accessible from jquery prototype', function () {
            document.body.innerHTML = '<div></div>';
            $.fn.myplugin = boost(MyPlugin);
            var inst = $.fn.myplugin.init( document.querySelectorAll('div'), {} );
            assert.match( inst.source[0].nodeName, /DIV/i );
        });

        it('should inherit prototype methods from "MyPlugin"', function () {
            document.body.innerHTML = '<div></div>';
            $.fn.myplugin = boost(MyPlugin);
            var inst = $('div').myplugin();
            assert.equal( inst.getSource(), inst.source  );
        });



    });

    describe('auto', function () {

        it('should init with valid [data-init] attr', function () {
            document.body.innerHTML = '<div data-init="myplugin"></div>';
            $.fn.myplugin = boost(MyPlugin);
            boost.auto();
            assert.lengthOf( Object.keys($.fn.myplugin.instances), 1 );
        });

        it('should init with hypenated/camelCased plugin name', function () {
            document.body.innerHTML = '<div data-init="some-plugin"></div><div data-init="somePlugin"></div>';
            $.fn.somePlugin = boost(MyPlugin);
            boost.auto();
            assert.lengthOf( Object.keys($.fn.somePlugin.instances), 2 );
        });

        it('should NOT init with unknown plugin name', function () {
            document.body.innerHTML = '<div data-init="someplugin"></div>';
            $.fn.myplugin = boost(MyPlugin);
            boost.auto();
            assert.lengthOf( Object.keys($.fn.myplugin.instances), 0 );
        });

    });

    describe('source', function () {

        it('should be a jquery object and match source element', function () {
            document.body.innerHTML = '<div></div>';
            $.fn.myplugin = boost(MyPlugin);
            var inst = $('div').myplugin();
            assert.match( inst.source[0].nodeName, /DIV/i );
        });

    });

    describe('id', function () {

        it('should exist', function () {
            document.body.innerHTML = '<div></div>';
            $.fn.myplugin = boost(MyPlugin);
            var inst = $('div').myplugin();
            assert.isDefined( inst.id );
        });

        it('should match html attribute if present', function () {
            document.body.innerHTML = '<div id="foo-bar"></div>';
            $.fn.myplugin = boost(MyPlugin);
            var inst = $('div').myplugin();
            assert.match( inst.id, /foo-bar/ );
        });

        it('should be empty string if html attribute doesn\'t exist', function () {
            document.body.innerHTML = '<div></div>';
            $.fn.myplugin = boost(MyPlugin);
            var inst = $('div').myplugin();
            assert.equals( inst.id, null );
        });

    });

    describe('settings', function () {

        it('should be able to be defined at plugin creation (defaults)', function () {
            document.body.innerHTML = '<div></div>';
            $.fn.myplugin = boost(MyPlugin, {foo:'bar'});
            var inst = $('div').myplugin();
            assert.match( inst.settings.foo, /bar/ );
        });

        it('should be able to be updated at instantiation', function () {
            document.body.innerHTML = '<div></div>';
            $.fn.myplugin = boost(MyPlugin,{foo:'bar'});
            var inst = $('div').myplugin({foo:'foo'});
            assert.match( inst.settings.foo, /foo/ );
        });

        it('should be able to be updated by data attribute', function () {
            document.body.innerHTML = '<div data-foo="foo"></div>';
            $.fn.myplugin = boost(MyPlugin,{foo:'bar'});
            var inst = $('div').myplugin();
            assert.match( inst.settings.foo, /foo/ );
        });

    });

    describe('dataset', function () {

        it('should be converted to boolean if value is "true"', function () {
            document.body.innerHTML = '<div data-foo="true"></div>';
            $.fn.myplugin = boost(MyPlugin, {foo:false});
            var inst = $('div').myplugin();
            assert.isBoolean( inst.settings.foo );
            assert.isTrue( inst.settings.foo );
        });

        it('should be converted to boolean if value is "false"', function () {
            document.body.innerHTML = '<div data-foo="false"></div>';
            $.fn.myplugin = boost(MyPlugin, {foo:true});
            var inst = $('div').myplugin();
            assert.isBoolean( inst.settings.foo );
            assert.isFalse( inst.settings.foo );
        });

        it('should be converted to integer if value is a whole number', function () {
            document.body.innerHTML = '<div data-foo="10"></div>';
            $.fn.myplugin = boost(MyPlugin);
            var inst = $('div').myplugin();
            assert.isNumber( inst.settings.foo, 10 );
        });

        it('should be converted to float if value is a decimal number', function () {
            document.body.innerHTML = '<div data-foo="0.5"></div>';
            $.fn.myplugin = boost(MyPlugin);
            var inst = $('div').myplugin();
            assert.isNumber( inst.settings.foo, .5 );
        });

    });

    describe('references', function () {

        it('should collect elements with data-bind="#[id]"', function () {
            document.body.innerHTML = '<div id="foo"></div><button data-bind="#foo"></button>';
            $.fn.myplugin = boost(MyPlugin);
            var inst = $('div').myplugin();
            assert.lengthOf( inst.references, 1 );
            assert.match( inst.references[0].nodeName, /BUTTON/i );
        });

        it('should collect elements with href="#[id]"', function () {
            document.body.innerHTML = '<div id="foo"></div><a href="#foo"></a>';
            $.fn.myplugin = boost(MyPlugin);
            var inst = $('div').myplugin();
            assert.lengthOf( inst.references, 1 );
            assert.match( inst.references[0].nodeName, /A/i );
        });

        it('should NOT collect elements without hash before id', function () {
            document.body.innerHTML = '<div id="foo"></div><button data-bind="foo"></button><a href="foo"></a>';
            $.fn.myplugin = boost(MyPlugin);
            var inst = $('div').myplugin();
            assert.lengthOf( inst.references, 0 );
        });

        it('should NOT collect elements with no id', function () {
            document.body.innerHTML = '<div></div><a href="#"></a>';
            $.fn.myplugin = boost(MyPlugin);
            var inst = $('div').myplugin();
            assert.lengthOf( inst.references, 0 );
        });

    });

    describe('roles', function () {

        it('should organize references by "data-role" attributes', function () {
            document.body.innerHTML = '<div id="foo"></div><a href="#foo" data-role="foo"></a><a href="#foo" data-role="bar"></a>';
            $.fn.myplugin = boost(MyPlugin);
            var inst = $('div').myplugin();
            assert.lengthOf( inst.references, 2 );
            assert.isDefined( inst.roles.foo );
            assert.lengthOf( inst.roles.foo, 1 );
            assert.match( inst.roles.foo[0].nodeName, /A/i );
            assert.isDefined( inst.roles.bar );
            assert.lengthOf( inst.roles.bar, 1 );
            assert.match( inst.roles.bar[0].nodeName, /A/i );
        });

    });

    describe('instances', function () {

        it('should be accessible from jquery prototype', function () {
            assert.isDefined($.fn.myplugin.instances);
        });

        it('should use camel-cased id as key if id exists', function () {
            document.body.innerHTML = '<div id="foo-bar"></div>';
            $.fn.myplugin = boost(MyPlugin);
            var inst = $('div').myplugin();
            assert.isDefined($.fn.myplugin.instances.fooBar);
            assert.isDefined($.fn.myplugin.instances.fooBar.source);
        });

        it('should use integer as key if no id exists', function () {
            document.body.innerHTML = '<div></div>';
            $.fn.myplugin = boost(MyPlugin);
            var inst = $('div').myplugin();
            assert.isDefined($.fn.myplugin.instances[0]);
            assert.isDefined($.fn.myplugin.instances[0].source);
        });

    });

});
