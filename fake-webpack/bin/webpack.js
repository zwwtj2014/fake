const path = require("path");
const webpack = require("../lib/webpack");

let args = process.argv.slice(2);
if (args.length <= 0) {
    return;
}
let options = {};

let input = args[0];
let output = args[1];
if (input && input[0] !== "/" && input[1] !== ":") {
    options.input = path.join(process.cwd(), input);
    options.context = path.dirname(input);
}

if (!output) {
    options.output = path.join(process.cwd(), "bundle.js");
} else {
    if (path.isAbsolute(output)) {
        options.output = output;
    } else {
        options.output = path.join(options.context, output);
    }
}

webpack().then();

// webpack(options.input, options);
