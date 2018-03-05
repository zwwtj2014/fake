/**
 * Recursive resolution require module (Depth-first traversal algorithm)
 */

const fs = require("fs");
const resolve = require("./resolve");
const parse = require("./parse");

/**
 * context: current directory
 * mainModule: the entrance module
 * options:
 * callback: function(err, result)
 */
module.exports = function(context, mainModule, options, callback) {
    if (!callback) {
        callback = options;
        options = {};
    }
    options = options || {};

    let depTree = {
        modules: {},
        modulesById: {},
        chunks: {},
        nextModuleId: 0,
        nextChunkId: 0,
        chunkModules: {} // used by checkObsolete
    };

    let mainModuleId;
    addModule(depTree, context, mainModule, options, (err, id) => {
        if (err) {
            callback(err);
            return;
        }
        mainModuleId = id;
        buildTree();
    });

    function buildTree() {}
};

function addModule(depTree, context, module, options, callback) {
    resolve(context, module, options.resolve, (err, filename) => {
        if (err) {
            callback(err);
            return;
        }
        if (depTree.modules[filename]) {
            callback(null, depTree.modules[filename].id);
        } else {
            // 内存中不存在filename这个模块, 则初始化一个
            let module = (depTree.modules[filename] = {
                id: depTree.nextModuleId++,
                filename: filename
            });
            depTree.modulesById[module.id] = module; // 建立反向索引

            fs.readFile(filename, "utf-8", (err, source) => {
                if (err) {
                    callback(err);
                    return;
                }
                let deps = parse(source);

                module.requires = deps.requires || [];
                module.asyncs = deps.asyncs || [];
                module.source = source;

                let requires = {};

                function add(r) {
                    requires[r.name] = require[r.name] || [];
                    requires[r.name].push(r);
                }

                if (modules.requires) {
                    modules.requires.forEach(add);
                }
                if (module.asyncs) {
                    module.asyncs.forEach(function addContext(c) {
                        if (c.requires) {
                            c.requires.forEach(add);
                        }
                        if (c.asyncs) {
                            c.asyncs.forEach(addContext);
                        }
                    });
                }
                let requiresNames = Object.keys(requires);
                let count = requiresNames.length;
                let error = [];
                if (requiresNames.length) {
                    requiresNames.forEach(moduleName => {
                        addModule(depTree, path.dirname(filename), moduleName, options, function(err, moduleId) {
                            if (err) {
                                errors.push(
                                    err + "\n @ " + filename + " (line " + requires[moduleName][0].line + ", column " + requires[moduleName][0].column + ")"
                                );
                            } else {
                                requires[moduleName].forEach(function(requireItem) {
                                    requireItem.id = moduleId;
                                });
                            }
                            count--;
                            if (count === 0) {
                                if (errors.length) {
                                    callback(errors.join("\n"));
                                } else {
                                    end();
                                }
                            }
                        });
                    });
                } else {
                    end();
                }

                function end() {
                    callback(null, module.id);
                }
            });
        }
    });
}

function addChunk(depTree, chunkStartpoint, options) {
    var chunk = {
        id: depTree.nextChunkId++,
        modules: {},
        context: chunkStartpoint
    };
    depTree.chunks[chunk.id] = chunk;
    if (chunkStartpoint) {
        chunkStartpoint.chunkId = chunk.id;
        addModuleToChunk(depTree, chunkStartpoint, chunk.id, options);
    }
    return chunk;
}

function addModuleToChunk(depTree, context, chunkId, options) {
    context.chunks = context.chunks || [];
    if (context.chunks.indexOf(chunkId) === -1) {
        context.chunks.push(chunkId);
        if (context.id !== undefined) depTree.chunks[chunkId].modules[context.id] = "include";
        if (context.requires) {
            context.requires.forEach(function(requireItem) {
                addModuleToChunk(depTree, depTree.modulesById[requireItem.id], chunkId, options);
            });
        }
        if (context.asyncs) {
            context.asyncs.forEach(function(context) {
                var subChunk;
                if (context.chunkId) {
                    subChunk = depTree.chunks[context.chunkId];
                } else {
                    subChunk = addChunk(depTree, context, options);
                }
                subChunk.parents = subChunk.parents || [];
                subChunk.parents.push(chunkId);
            });
        }
    }
}
