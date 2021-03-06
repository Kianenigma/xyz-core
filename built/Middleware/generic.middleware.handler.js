Object.defineProperty(exports, "__esModule", { value: true });
var Logger_1 = require("./../Log/Logger");
var Util_1 = require("./../Util/Util");
/**
 * This class is used in various modules to handle middlewares.
 *
 * A middleware is basically an array of functions
 *
 * `[fn1, fn2, fn3]`
 *
 * as we apply a set of parameters to a middleware (aka Middleware stack) these parameters will be passed to each function
 * in this array. Functions have the ability to stop the execution of the next function.
 *
 * ```
 * params = ['foo', 1]
 * fn1(params)
 * fn2(params)
 * ...
 * ```
 */
var GenericMiddlewareHandler = (function () {
    function GenericMiddlewareHandler(xyz, name, route) {
        this.middlewares = [];
        this.xyz = xyz;
        this.name = name;
        this.route = route;
    }
    /**
     * prints the info of this class
     */
    GenericMiddlewareHandler.prototype.inspect = function () {
        var str = this.route
            ? Util_1.wrapper('bold', this.name) + " [/" + Util_1.wrapper('yellow', this.route) + "] || "
            : Util_1.wrapper('bold', this.name) + " || ";
        for (var i = 0; i < this.middlewares.length; i++) {
            if (i === this.middlewares.length - 1) {
                str += this.middlewares[i].name + "[" + i + "]";
            }
            else {
                str += this.middlewares[i].name + "[" + i + "] -> ";
            }
        }
        return str;
    };
    /**
     * same data returned by `inspect` is returened in json format
     */
    GenericMiddlewareHandler.prototype.inspectJSON = function () {
        return {
            name: this.name,
            middlewares: this.middlewares.map(function (mw) { return mw.name; })
        };
    };
    /**
     * Registering a new middleware
     *
     * The number passed to as the first index will be the position of the function
     * **0** will prepend the function by default and **-1** will append it
     * You'll use 0 most of the time
     * @param index {Number} index of insertion
     * @param fn {Function} function to be invoked
     */
    GenericMiddlewareHandler.prototype.register = function (index, fn) {
        if (typeof (fn) !== 'function') {
            Logger_1.logger.error("GMWH :: attempting to insert " + fn + " which is not a function");
        }
        Logger_1.logger.debug("GMWH :: Registering middleware at " + this.name + "[" + index + "] : " + fn.name);
        if (index === -1) {
            this.middlewares.push(fn);
        }
        else if (index === 0) {
            this.middlewares.unshift(fn);
        }
        else {
            this.middlewares.splice(index, 0, fn);
        }
    };
    /**
     * apply a specific function from middleware array over a set of arguments
     *
     * Note that `.apply` will continue to call functions on parameters until the end of
     * the middleware array
     *
     * should be called with
     * `.apply([...], 0)`
     *
     * Note that each middleware funciton has access to `next` and `end` callback.
     * The names suggest what they do. `next` will immediately invoke the next function
     * and end will end the execution of the current stack
     * @param  {array} params - Array of parameters passed to the handler
     * @param {Number} index - current index inside the middleware array to be applied
     */
    GenericMiddlewareHandler.prototype.apply = function (params, index, xyz) {
        var _this = this;
        if (xyz === void 0) { xyz = null; }
        Logger_1.logger.silly("GMWH :: applying middleware " + this.name + "[" + index + "]");
        if (!this.middlewares[index]) {
            Logger_1.logger.error("GMWH :: attempting to call " + this.name + "[" + index + "] which is not defined. teminating execution...");
            return;
        }
        this.middlewares[index](params, function (_params) {
            if ((index + 1) < _this.middlewares.length) {
                _this.apply(params, index + 1, _this.xyz);
            }
            else {
                Logger_1.logger.silly("GMWH :: middleware Stack for " + _this.name + " finished");
            }
        }, function () {
            Logger_1.logger.silly("GMWH :: middleware Stack for " + _this.name + " terminated by calling end()");
        }, this.xyz);
    };
    /**
     * Return an array of middlewares registered so far.
     */
    GenericMiddlewareHandler.prototype.getMiddlewares = function () {
        return this.middlewares;
    };
    /**
     * remove a middleware from the stack
     * @param {Number} idx - the idx of the removal. if `idx` is -1, then all of the functions will be removed
     * otherwise, the function at index `idx` will be removed
     */
    GenericMiddlewareHandler.prototype.remove = function (idx) {
        Logger_1.logger.silly("GMWH :: removing middleware " + this.name + "[" + idx + "]");
        if (idx === -1) {
            this.middlewares = [];
        }
        else if (idx > -1 && idx < this.middlewares.length) {
            this.middlewares.splice(idx, 1);
        }
        else {
            Logger_1.logger.error('GMWH :: Trying to remove a middleware that does not exists.');
        }
    };
    return GenericMiddlewareHandler;
}());
exports.GenericMiddlewareHandler = GenericMiddlewareHandler;
