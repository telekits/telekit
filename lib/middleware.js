/**
 * This is manager that a provides storage
 * and transmitting updates for middleware
 *
 * @module telekit/middleware
 * @author Denis Maslennikov <mrdenniska@gmail.com> (nofach.com)
 * @license MIT
 */

/** Dependencies */
const isArrow = require('isarrow');
const isClass = require('isclass');
const debug = require('debug')('telekit:middleware');

/**
 * Implementation
 * @public
 */
class Middleware {
    constructor(kit) {
        this.kit = kit;
        this.store = [];
    }

    transmit(type, ...params) {
        return new Promise((resolve, reject) => {
            let handles = this.store.keys();
            let fn = () => {
                let result = handles.next();
                if (result.done) return resolve(true);

                if (!this.store[result.value][type]) return fn();
                this.store[result.value][type](...params, fn);
            };

            debug('transmits %s into middleware', type);
            fn();
        });
    }

    /**
     * Register middleware into stack
     *
     * @param  {Class|Function} value - The middleware
     * @return {Middleware}
     */
    use(value, ...others) {
        let handle = value;

        /** Value is empty */
        if (!value) return this.kit;

        /** Value is array */
        if (Array.isArray(handle)) {
            handle.forEach((item) => this.use(item, ...others));
            return this.kit;
        }

        debug('use %s', value.name || '_');

        /** Value is function */
        if (typeof(value) == 'function') {
            /** Value is Class */
            if (isClass(value) && !isArrow(value)) {
                handle = new handle(this.kit, ...others);
            } else {
                handle = handle(this.kit, ...others);
            }
        }

        /** Add handle into stack if it there's */
        if (handle) {
            debug('added %s into stack', value.name || '_');
            this.store.push(handle);
        }

        return this.kit;
    }
}

/** Methods */
module.exports = Middleware;
