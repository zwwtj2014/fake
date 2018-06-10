'use strict';

const debug = require('debug')('my-connect:dispatcher');
const http = require('http');
const url = require('url');
const parseUrl = require('parseurl');
const finalhandler = require('finalhandler');

module.exports = createServer; // 可以export這個值是因为函数提升到最上面了

const env = process.env.NODE_ENV || 'development';
const proto = {};

const defer = typeof setImmediate === 'function' ? setImmediate : function (fn) {
    process.nextTick(fn.bind.apply(fn, arguments));
}

function createServer() {
    // 有req,res入参, 供http.createServer(app) 创建Http Server
    function app(req, res, next) {
        app.handle(req, res, next);
    }
    merge(app, proto); // 挂use/listen等方法到app上

    app.stack = []; // 存储{ route, handle(middleware) }对象
    return app;
}

/**
 * 1. use(fn)
 * 2. use(route, fn)
 * 3. use(route, sub-app)
 */
proto.use = function (fn) {
    const handle = fn;
    const route = '/'; // default route

    debug('use %s %s', route || '/', handle.name || 'anonymous');
    this.stack.push({
        route,
        handle
    });
    return this; // 供链式调用
};

/**
 * 用户也可以自己使用`http.createServer`自行创建server
 */
proto.listen = function () {
    const server = http.createServer(this); // 内部根据app创建一个HTTP Server
    return server.listen.apply(server, arguments);
};

// core
proto.handle = function (req, res, out) {
    const stack = this.stack;
    const protohost = getProtohost(req.url) || '';
    let removed = '';
    let slashAdded = false;
    let index = 0; // 索引stack

    const done = out || finalhandler(req, res, {
        onerror: logerror,
        env: env
    });

    req.originalUrl = req.originalUrl || req.url;

    function next(err) {
        // 还原req.url <= 移除末尾添加的'/'
        if (slashAdded) {
            req.url = req.url.substr(1);
            slashAdded = false;
        }

        // 还原req.url <= 添加移除的挂载字符串
        if (removed.length !== 0) {
            req.url = `${protohost}${removed}${req.url.substr(protohost.length)}`;
            removed = '';
        }

        // next callback
        const layer = stack[index++];

        // all done
        if (!layer) {
            defer(done, err);
            return;
        }

        // match url?
        const path = parseUrl(req).pathname || '/';
        const route = layer.route;

        // skip this layer if the route doesn't match
        if (path.toLowerCase().substr(0, route.length) !== route.toLowerCase()) {
            return next(err);
        }

        // 当请求路径比挂载的前缀长时, 下一个字符必须是以'/'或者'.'
        // 比如, 挂载为`/post`, 请求的只能为 `/post`或者 `/post/xxx` 或者 `/post.xxx`
        let c = path.length > route.length && path[route.length];
        if (c && c !== '/' && c !== '.') { // 源码中点也是ok的?
            return next(err);
        }

        // 将url中的挂载移除掉, 挂载后面的才是真正的请求url
        if (route.length !== 0 && route !== '/') {
            removed = route;
            req.url = `${protohost}${req.url.substr(protohost.length + removed.length)}`; // do remove mount url

            // ensure leading slash
            if (!protohost && req.url[0] !== '/') {
                req.url = `/${req.url}`;
                slashAdded = true;
            }
        }
        call(layer.handle, route, err, req, res, next);
    }

    next();
}

/**
 * invoke handle:
 *   1. 没带err, 成功处理: handle(req,res,next)
 *   2. 没带err, 异常处理: next(error)
 *   3. 带err参数: handle(err,req,res,next)
 */
function call(handle, route, err, req, res, next) {
    const hasError = Boolean(err);
    let argLength = handle.length;
    let error = err;

    debug('%s %s : %s', handle.name || '<anonymous>', route, req.originalUrl);

    try {
        if (hasError && argLength === 4) {
            handle(err, req, res, next);
            return;
        } else if (!hasError && argLength < 4) {
            handle(req, res, next);
            return;
        }
    } catch (e) {
        error = e;
    }

    next(error);
}

function merge(a, b) {
    if (a && b) {
        for (const key in b) {
            a[key] = b[key];
        }
    }
    return a;
}

function getProtohost(url) {
    if (url.length === 0 || url[0] === '/') {
        return undefined;
    }
    const parsedUrl = url.parse(url);
    return parsedUrl && `${parsedUrl.protocol}//${host}`
}

function logerror(err) {
    if (env !== 'test') console.error(err.stack || err.toString());
}