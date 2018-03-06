/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var Tapable = require("../lib/Tapable");
var should = require("should");

function makeTestPlugin(arr, index) {
    var last;
    var f = function() {
        f.shouldNotBeCalled();
        var args = Array.prototype.slice.call(arguments);
        args.unshift(index);
        last = args;
        arr.push(args);
    };
    f.issue = function() {
        f.shouldBeCalled();
        last.pop().apply(null, arguments);
        last = null;
    };
    f.shouldNotBeCalled = function() {
        if (last) throw new Error("Plugin " + index + " was called, but shouldn't be.");
    };
    f.shouldBeCalled = function() {
        if (!last) throw new Error("Plugin " + index + " was not called, but should be.");
    };
    f.shouldBeCalledAsyncWith = function() {
        f.shouldBeCalled();
        var args = Array.prototype.slice.call(arguments);
        for (var i = 0; i < args.length && i < last.length - 2; i++) {
            if (args[i] === null || args[i] === undefined) {
                should.not.exist(last[i + 1]);
            } else {
                should.exist(last[i + 1]);
                last[i + 1].should.be.eql(args[i]);
            }
        }
        args.length.should.be.eql(last.length - 2);
    };
    return f;
}

function test1() {
    var tapable = new Tapable();
    var log = [];
    var p1 = function() {
        console.log("p1");
        let callback = Array.prototype.slice.call(arguments).pop();
        callback();
    };
    var p2 = function() {
        console.log("p2");
    };
    var p3 = makeTestPlugin(log, 3);
    var p4 = function() {
        console.log("p4");
    };
    var result = makeTestPlugin(log, 0);
    tapable.plugin("test", p1);
    tapable.plugin("test", p2);
    tapable.plugin("xxxx", p3);
    tapable.plugin("test", p4);
    tapable.applyPluginsParallelBailResult("test", 1, 2, (err, result) => {
        console.log(result);
    });
    // p1.shouldBeCalledAsyncWith(1, 2);
    // p2.shouldBeCalledAsyncWith(1, 2);
    // p3.shouldNotBeCalled();
    // p4.shouldBeCalledAsyncWith(1, 2);
    // p1.issue();
    // p2.issue(null, "ok");
    // p4.issue(null, "fail");
    // log.should.be.eql([[1, 1, 2], [2, 1, 2], [4, 1, 2], [0, null, "ok"]]);
}

test1();
