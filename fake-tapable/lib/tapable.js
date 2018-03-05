class Tapable {
    _plugins = {};
    _currentPluginApply; // 当插件出现多层applyplugin时, 记录上一层的位置, 方便还原现场

    // 使用混入而不是继承的方式扩展 Tapable 的原型
    static mixin(pt) {
        for (const name in Tapable.prototype) {
            pt[name] = Tapable.prototype[name];
        }
    }

    // 允许将一个自定义插件注册到 Tapable 实例 的事件中
    plugin(name, fn) {
        this._plugins[name] = this._plugins[name] || [];
        this._plugins[name].push(fn);
    }

    // 顺序的执行插件name对应的处理函数, 从第二个入数开始为处理函数的参数
    applyPlugins(name) {
        if (!this._plugins[name]) {
            return;
        }
        let args = Array.prototype.slice.call(arguments, 1);
        let plugins = this._plugins[name];
        let old = this._currentPluginApply;
        for (this._currentPluginApply = 0; this._currentPluginApply < plugins.length; this._currentPluginApply++) {
            plugins[this._currentPluginApply].apply(this, args);
        }
        this._currentPluginApply = old;
    }

    // 执行插件name的处理函数。返回第一个执行不为undefined的值, 且终止事件流
    applyPluginsBailResult(name) {
        if (!this._plugins[name]) {
            return;
        }
        let args = Array.prototype.slice.call(arguments, 1);
        let plugins = this._plugins[name];
        let old = this._currentPluginApply;
        for (this._currentPluginApply = 0; this._currentPluginApply < plugins.length; this._currentPluginApply++) {
            const result = plugins[this._currentPluginApply].apply(this, args);
            // 函数的执行结果不为undefined时, 返回且终止事件流
            if (typeof result !== "undefined") {
                this._currentPluginApply = old;
                return result;
            }
        }
        this._currentPluginApply = old;
    }

    // 异步的执行插件事件流
    applyPluginsAsync(name) {
        let args = Array.prototype.slice.call(arguments, 1);
        let callback = args.pop();
        if (!this._plugins[name] || this._plugins[name].length === 0) {
            return callback(); // 未找到处理函数则直接执行cb
        }

        let plugins = this._plugins[name];
        let old = this._currentPluginApply;
        this._currentPluginApply = 0;
        // 增加一个next方法作为最后一个参数 => 串联事件流
        args.push(err => {
            if (err) {
                callback(err);
            }
            this._currentPluginApply++;
            if (this._currentPluginApply >= this._plugins.length) {
                this._currentPluginApply = old;
                return callback();
            }
            plugins[this._currentPluginApply].apply(this, args);
        });
        // 从第一个事件开始执行
        plugins[0].apply(this, args);
    }

    /**
     * 插件一个一个的执行, 下一个接收上一个的返回值
     * @param {*} callback (err,result)=>{ }
     */
    applyPluginsAsyncWaterfall(name, init, callback) {
        if (!this._plugins[name] || this._plugins.length === 0) {
            return callback(null, init);
        }
        let plugins = this._plugins[name];
        let old = this._currentPluginApply;
        this._currentPluginApply = 0;
        let next = (err, result) => {
            if (err) {
                callback(err);
            }
            this._currentPluginApply++;
            if (this._currentPluginApply >= this._plugins.length) {
                this._currentPluginApply = old;
                return callback(null, result);
            }
            // 顺序执行插件事件, 且将上一跳的数据传到下一跳作为init值
            plugins[this._currentPluginApply].call(this, result, next);
        };
        plugins[0].call(this, init, next);
    }

    restartApplyPlugins() {
        this._currentPluginApply = -1;
    }
}

module.exports = Tapable;
