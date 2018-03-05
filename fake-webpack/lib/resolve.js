/**
 * resolve require module logic
 *  => 1. 如果是绝对路径或者相对路径, 则根据路径去找, 找不到报错
 *  => 2. 如果给的是模块的名称, 先在入口js文件所在目录找同名js文件, 找不到进入第三部
 *  => 3. 在入口文件的同级的node_modules去找, 找不到报错
 *
 * => 新的webpack应该已经改成通过node require的方式去找模块了
 */

const path = require("path");
const fs = require("fs");

/**
 * context: absolute filename of current file
 * identifier: module to find
 * options:
 *   paths: array of lookup paths
 * callback: function(err, absoluteFilename)
 */
module.exports = function resolve(context, identifier, options, callback) {
    if (!callback) {
        callback = options;
        options = {};
    }
    if (!options) {
        options = {};
    }
    if (!options.extensions) {
        options.extensions = [".js"];
    }
    if (!options.paths) {
        options.paths = [];
    }

    function finalResult(err, absoluteFileName) {
        if (err) {
            callback('Module "' + identifier + '" not found in context "' + context + '"');
            return;
        }
        callback(null, absoluteFileName);
    }

    let identArray = identifier.split("/");
    let contextArray = split(context);

    if (identArray[0] === "." || identArray[0] === ".." || identArray[0] === "") {
        let pathname = join(contextArray, identArray);
        // 1. 先查是否存在fileName这个文件. 否则转到2
        loadAsFile(pathname, options, (err, absoluteFilename) => {
            if (err) {
                // 再查找fileName可能为文件夹是否存在
                loadAsDirectory(pathname, options, finalResult);
            }
        });
    } else {
        // 
        loadNodeModules(contextArray, identArray, options, finalResult, finalResult);
    }
};

function split(a) {
    return a.split(/[\/\\]/g);
}

function join(a, b) {
    return path.join([...a, ...b]);
}

/**
 * 查找引用的路径是否为一个文件路径
 * => 1. 首先查找 fiileName 是否存在, 否则转到2
 *    2. 查找`${fileName}${extensions} 拼接后的文件存不存在`
 */
function loadAsFile(fileName, options, callback) {
    let pos = -1,
        result;

    fs.stat((result = fileName), function tryCb(err, stats) {
        if (err || !stats || !stats.isFile()) {
            pos++;
            if (pos >= options.extensions.length) {
                callback(err);
                return;
            }
            fs.stat((result = `${fileName}${options.extensions[pos]}`), tryCb);
            return;
        }
        callback(null, result);
    });
}

/**
 * 查找引用的路径时一个文件夹时:
 * => 1. 查找是否存在package.json, 有转到2, 没有转到3
 *    2. 解析package.json中的main字段, 拼接目录
 *    3. 使用index拼接目录
 */
function loadAsDirectory(dirname, options, callback) {
    const packageJsonFile = join(split(dirname), ["package.json"]);
    fs.stat(packageJsonFile, (err, stats) => {
        let mainModule = "index";
        if (!err && stats.isFile()) {
            fs.readFile(packageJsonFile, "utf-8", (err, content) => {
                if (err) {
                    throw new Error("read file " + packageJsonFile + " error: " + err);
                }
                content = JSON.parse(content);
                if (content.main) {
                    mainModule = content.main; // 从这可以看出来最初始的时候webpack是根据main来找模块的
                }
                loadAsFile(join(split(dirname), [mainModule]), options, callback);
            });
        } else {
            loadAsFile(join(split(dirname), [mainModule]), options, callback);
        }
    });
}

/**
 * 从当前目录逐层往上查找package.json
 */
function loadNodeModules(contextArray, identifierArray, options, callback) {
    nodeModeulePaths(contextArray, options, (err, dirs) => {
        function tryDir(dir) {
            let pathName = join(split(dir), identifierArray);
            loadAsFile(pathName, options, (err, absoluteFilename) => {
                if (err) {
                    loadAsDirectory(pathName, options, (err, absoluteFilename) => {
                        if (err) {
                            if (dirs.length === 0) {
                                callback(true);
                                return;
                            }
                            tryDir(dirs.shift());
                            return;
                        }
                    });
                }
                callback(null, absoluteFilename);
            });
        }
        tryDir(dirs.shift());
    });
}

function nodeModeulePaths(contextArray, options, callback) {
    let parts = contextArray;
    let rootNodeModules = parts.indexOf("node_modules");

    let root = rootNodeModules - 1;
    let dirs = [...options.paths];
    for (let i = parts.length; i > root; i--) {
        if (parts[i - 1] === "node_modules") {
            continue;
        }
        let part = parts.slice(0, i);
        dirs.push(join(part, ["node_modules"]));
    }
    callback(null, dirs);
}
