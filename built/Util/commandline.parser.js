Object.defineProperty(exports, "__esModule", { value: true });
function get(argName) {
    var args = process.argv;
    for (var idx = 2; idx < args.length; idx++) {
        if (args[idx] === argName) {
            return args[idx + 1];
        }
    }
}
exports.get = get;
function has(argName) {
    var args = process.argv;
    return args.indexOf(argName) > -1;
}
exports.has = has;
function xyzGeneric(prefix) {
    if (prefix === void 0) { prefix = '--xyz-'; }
    var args = process.argv;
    var _args = {};
    for (var idx = 2; idx < args.length; idx++) {
        var arg = args[idx];
        if (arg.slice(0, 6) === prefix) {
            var specificArg = arg.slice(6);
            if (_args[specificArg]) {
                if (typeof (_args[specificArg]) !== 'object') {
                    _args[specificArg] = [_args[specificArg]];
                }
                _args[specificArg].push(args[idx + 1]);
            }
            else {
                _args[specificArg] = args[idx + 1];
            }
            idx += 1;
        }
    }
    return _args;
}
exports.xyzGeneric = xyzGeneric;
