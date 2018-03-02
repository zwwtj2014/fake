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
const util = require("util");
const stat = util.promisify(fs.stat);

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

    function finalResult(err, absoluteFileName) {}

    let identArray = identifier.split("/");
    let contextArray = split(context);

    if (identArray[0] === "." || identArray[0] === ".." || identArray[0] === "") {
        let pathname = join(contextArray, identArray);
    } else {
        loadNodeModules(contextArray, identArray, options, finalResult);
    }
};

function split(a) {
    return a.split(/[\/\\]/g);
}

function join(a, b) {
    return path.join([...a, ...b]);
}

/**
 * 相对路径时：查找引用的路径是否为一个文件路径
 */
async function loadAsFile(fileName, options) {
    let pos = -1,
        result;

    let stats = await stat((result = fileName));
    while (!stats || !stats.isFile()) {
        pos++;
        if (pos >= options.extensions.length) {
            return;
        }
        stats = stat((result = `${fileName}${options.extensions[pos]}`));
    }

    return result;
}

/**
 * 相对路径：查找引用的路径时一个文件夹时
 */
async function loadAsDirectory(dirname, options) {
    const packageJsonFile = join(split(dirname), ["package.json"]);
    const stats = await stat(packageJsonFile);
    if (stats.isFile()) {
        let mainModule = "index";
        const readFile = util.promisify(fs.readFile);
        const content = await readFile(packageJsonFile, "utf-8");
        content = JSON.parse(content);
        if (content.main) {
            mainModule = content.main; // 从这可以看出来最初始的时候webpack是根据main来找模块的
        }
    }
    return loadAsFile(join(split(dirname), [mainModule]), options);
}

/**
 *
 */
async function loadNodeModules(context, identifier, options) {
    let dirs = nodeModeulePaths(context, options);
    function tryDir(dir) {
        let pathName = join(split(dir), identifier);
        let absoluteFilename = await loadAsFile(pathName, options);
        if(!absoluteFilename){
            absoluteFilename = loadAsDirectory(pathName,options);
            if(!absoluteFilename){
                if(dirs.length === 0){
                    return null;
                }
                tryDir(dirs.shift());
                return;
            }
        }
        return absoluteFilename;
    }
    tryDir(dirs.shift());
}

function nodeModeulePaths(context, options) {
    let parts = context;
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
    return dirs;
}
