class Tapable {
    constructor() {
        this._plugins = {};
        this._currentPluginApply = -1; // 当插件出现多层applyplugin时, 记录上一层的位置, 方便还原现场
        this.applyPluginsAsyncSeries = this.applyPluginsAsync;
    }

    _copyProperties(from, to) {
        for (let key in from) {
            to[key] = from[key];
        }
        return to;
    }

    // 使用混入而不是继承的方式扩展 Tapable 的原型
    static mixin(pt) {
        _copyProperties(Tapable.prototype, pt);
    }

    // 允许将一个自定义插件注册到 Tapable 实例 的事件中
    plugin(name, fn) {
        if (Array.isArray(name)) {
            name.forEach(n => this.plugin(name, fn));
            return;
        }
        this._plugins[name] = this._plugins[name] || [];
        this._plugins[name].push(fn);
    }

    hasPlugins(name) {
        let plugins = this._plugins[name];
        return plugins && plugins.length > 0;
    }

    // 增加一个运行多个函数的方式
    apply() {
        for (let i = 0; i < arguments.length; i++) {
            arguments[i].apply(this);
        }
    }

    // 顺序的执行插件name对应的处理函数, 从第二个入数开始为处理函数的参数
    applyPlugins(name) {
        if (!this._plugins[name]) {
            return;
        }
        let args = Array.prototype.slice.call(arguments, 1);
        let plugins = this._plugins[name];
        for (let i = 0; i < plugins.length; i++) {
            plugins[i].apply(this, args);
        }
    }

    applyPlugins0(name) {
        let plugins = this._plugins[name];
        if (!plugins) {
            return;
        }
        for (let i = 0; i < plugins.length; i++) {
            plugins[i].apply(this);
        }
    }

    applyPlugins1(name, param) {
        let plugins = this._plugins[name];
        if (!plugins) {
            return;
        }
        for (let i = 0; i < plugins.length; i++) {
            plugins[i].call(this, param);
        }
    }

    applyPlugins2(name, param1, param2) {
        let plugins = this._plugins[name];
        if (!plugins) {
            return;
        }
        for (let i = 0; i < plugins.length; i++) {
            plugins[i].call(this, param1, param2);
        }
    }

    // 执行插件name的处理函数。返回第一个执行不为undefined的值, 且终止事件流
    applyPluginsBailResult(name) {
        if (!this._plugins[name]) {
            return;
        }
        let args = Array.prototype.slice.call(arguments, 1);
        let plugins = this._plugins[name];
        for (let i = 0; i < plugins.length; i++) {
            const result = plugins[i].apply(this, args);
            // 函数的执行结果不为undefined时, 返回且终止事件流
            if (typeof result !== "undefined") {
                return result;
            }
        }
    }

    applyPluginsBailResult1(name, param) {
        if (!this._plugins[name]) {
            return;
        }
        let plugins = this._plugins[name];
        for (let i = 0; i < plugins.length; i++) {
            let result = plugins[i].call(this, param);
            if (typeof result !== "undefined") {
                return result;
            }
        }
    }

    applyPluginsBailResult2(name, param1, param2) {
        if (!this._plugins[name]) {
            return;
        }
        let plugins = this._plugins[name];
        for (let i = 0; i < plugins.length; i++) {
            let result = plugins[i].call(this, param1, param2);
            if (typeof result !== "undefined") {
                return result;
            }
        }
    }

    applyPluginsBailResult3(name, param1, param2, param3) {
        if (!this._plugins[name]) {
            return;
        }
        let plugins = this._plugins[name];
        for (let i = 0; i < plugins.length; i++) {
            let result = plugins[i].call(this, param1, param2, param3);
            if (typeof result !== "undefined") {
                return result;
            }
        }
    }


    applyPluginsBailResult4(name, param1, param2, param3, param4) {
        if (!this._plugins[name]) {
            return;
        }
        let plugins = this._plugins[name];
        for (let i = 0; i < plugins.length; i++) {
            let result = plugins[i].call(this, param1, param2, param3, param4);
            if (typeof result !== "undefined") {
                return result;
            }
        }
    }

    applyPluginsBailResult4(name, param1, param2, param3, param4, param5) {
        if (!this._plugins[name]) {
            return;
        }
        let plugins = this._plugins[name];
        for (let i = 0; i < plugins.length; i++) {
            let result = plugins[i].call(this, param1, param2, param3, param4, param5);
            if (typeof result !== "undefined") {
                return result;
            }
        }
    }

    // 异步的执行插件事件流
    applyPluginsAsync(name) {
        let args = Array.prototype.slice.call(arguments, 1);
        let callback = args.pop();
        if (!this._plugins[name] || this._plugins[name].length === 0) {
            return callback(); // 未找到处理函数则直接执行cb
        }

        let plugins = this._plugins[name];
        let i = 0;
        // 增加一个next方法作为最后一个参数 => 串联事件流
        args.push(
            this._copyProperties(callback, err => {
                if (err) {
                    callback(err);
                }
                i++;
                if (i >= plugins.length) {
                    return callback();
                }
                plugins[i].apply(this, args);
            })
        );
        // 从第一个事件开始执行
        plugins[0].apply(this, args);
    }

    applyPluginsAsyncSeries1(name, param, callback) {
        let plugins = this._plugins[name];
        if (!plugins || plugins.length === 0) return callback();

        let i = 0;
        let innerCallback = this._copyProperties(callback, err => {
            if (err) {
                callback(err);
            }
            i++;
            if (i >= plugins.length) {
                return callback();
            }
            plugins[i].call(this, param, innerCallback);
        });
        plugins[0].call(this, param, innerCallback);
    }

    applyPluginsAsyncSeriesBailResult(name) {
        let args = Array.prototype.slice.call(arguments, 1);
        let callback = args.pop();
        let plugins = this._plugins[name];
        if (!plugins || plugins.length === 0) return callback();
        let i = 0;
        args.push(
            this._copyProperties(callback, () => {
                if (arguments.length > 0) return callback.apply(null, arguments);
                i++;
                if (i >= plugins.length) {
                    return callback();
                }
                plugins[i].apply(this, args);
            })
        );
        plugins[0].apply(this, args);
    }

    applyPluginsAsyncSeriesBailResult1(name, param, callback) {
        if (!this._plugins[name] || this._plugins[name].length === 0) {
            return callback(); // 未找到处理函数则直接执行cb
        }
        let plugins = this._plugins[name];
        if (!plugins || plugins.length === 0) {
            return callback();
        }
        let i = 0;
        let innerCallback = this._copyProperties(callback, (err, result) => {
            if (arguments.length > 0) return callback.apply(err, result);
            i++;
            if (i >= plugins.length) {
                return callback();
            }
            plugins[i].apply(this, param, innerCallback);
        });
        plugins[0].apply(this, param, innerCallback);
    }

    applyPluginsWaterfall(name, init) {
        if (!this._plugins[name]) {
            return init;
        }
        let args = Array.prototype.slice(arguments, 1);
        let plugins = this._plugins[name];
        let current = init;
        for (let i = 0; i < plugins.length; i++) {
            args[0] = current;
            current = plugins[i].apply(this, args);
        }
        return current;
    }

    applyPluginsWaterfall0(name, init) {
        let plugins = this._plugins[name];
        if (!plugins) {
            return init;
        }
        let current = init;
        for (let i = 0; i < plugins.length; i++) {
            current = plugins[i].call(this, current);
        }
        return current;
    }

    /**
     * 插件一个一个的执行, 下一个接收上一个的返回值
     * @param {*} callback (err,result)=>{ }
     */
    applyPluginsAsyncWaterfall(name, init, callback) {
        if (!this._plugins[name] || this._plugins[name].length === 0) {
            return callback(null, init);
        }
        let plugins = this._plugins[name];
        let i = 0;
        let next = this._copyProperties(callback, (err, result) => {
            if (err) {
                callback(err);
            }
            i++;
            if (i >= this._plugins.length) {
                return callback(null, result);
            }
            // 顺序执行插件事件, 且将上一跳的数据传到下一跳作为init值
            plugins[i].call(this, result, next);
        });
        plugins[0].call(this, init, next);
    }

    // 并行执行插件
    applyPluginsParallel(name) {
        let args = Array.prototype.slice(arguments, 1);
        let callback = args.pop();
        if (!this._plugins[name] && this._plugins[name].length === 0) {
            return callback();
        }

        let plugins = this._plugins[name];
        let remaining = plugins.length; // 用于记录当前有多少个需要并行执行的插件, 控制全部执行完的时机
        // 加入一个判断是否执行完的逻辑作为每个插件的callback
        args.push(
            this._copyProperties(callback, err => {
                if (remaining < 0) {
                    return; //边界值
                }
                if (err) {
                    return callback(err);
                }
                remaining--;
                // 都执行完了再执行callback
                if (remaining == 0) {
                    return callback();
                }
            })
        );
        for (let i = 0; i < plugins.length; i++) {
            plugins[i].apply(this, args);
            if (remaining < 0) {
                return;
            }
        }
    }

    applyPluginsParallelBailResult(name) {
        let args = Array.prototype.slice.call(arguments, 1);
        let callback = args.pop();
        if (!this._plugins[name] || this._plugins[name].length === 0) {
            return callback();
        }
        let plugins = this._plugins[name];
        let currentPos = plugins.length;
        let currentResult;
        let done = [];
        var self = this;
        for (let i = 0; i < plugins.length; i++) {
            args[args.length - 1] = (function (i) {
                return self._copyProperties(callback, function () {
                    if (i >= currentPos) return; // ignore
                    done.push(i);
                    if (arguments.length > 0) {
                        currentPos = i + 1;
                        done = done.filter(function (item) {
                            return item <= i;
                        });
                        currentResult = Array.prototype.slice.call(arguments);
                    }
                    if (done.length == currentPos) {
                        callback.apply(null, currentResult);
                        currentPos = 0;
                    }
                });
            })(i);
            plugins[i].apply(this, args);
        }
    }

    applyPluginsParallelBailResult1(name, param, callback) {
        var plugins = this._plugins[name];
        if (!plugins || plugins.length === 0) {
            return callback();
        }
        var currentPos = plugins.length;
        var currentResult;
        var done = [];
        for (var i = 0; i < plugins.length; i++) {
            var innerCallback = (function (i) {
                return copyProperties(callback, function () {
                    if (i >= currentPos) return; // ignore
                    done.push(i);
                    if (arguments.length > 0) {
                        currentPos = i + 1;
                        done = done.filter(function (item) {
                            return item <= i;
                        });
                        currentResult = Array.prototype.slice.call(arguments);
                    }
                    if (done.length === currentPos) {
                        callback.apply(null, currentResult);
                        currentPos = 0;
                    }
                });
            })(i);
            plugins[i].call(this, param, innerCallback);
        }
    }
}

module.exports = Tapable;