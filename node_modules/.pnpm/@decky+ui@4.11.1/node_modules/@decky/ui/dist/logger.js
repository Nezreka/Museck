const bgStyle1 = 'background: #16a085; color: black;';
export const log = (name, ...args) => {
    console.log(`%c @decky/ui %c ${name} %c`, bgStyle1, 'background: #1abc9c; color: black;', 'background: transparent;', ...args);
};
export const group = (name, ...args) => {
    console.group(`%c @decky/ui %c ${name} %c`, bgStyle1, 'background: #1abc9c; color: black;', 'background: transparent;', ...args);
};
export const groupEnd = (name, ...args) => {
    console.groupEnd();
    if (args?.length > 0)
        console.log(`^ %c @decky/ui %c ${name} %c`, bgStyle1, 'background: #1abc9c; color: black;', 'background: transparent;', ...args);
};
export const debug = (name, ...args) => {
    console.debug(`%c @decky/ui %c ${name} %c`, bgStyle1, 'background: #1abc9c; color: black;', 'color: blue;', ...args);
};
export const warn = (name, ...args) => {
    console.warn(`%c @decky/ui %c ${name} %c`, bgStyle1, 'background: #ffbb00; color: black;', 'color: blue;', ...args);
};
export const error = (name, ...args) => {
    console.error(`%c @decky/ui %c ${name} %c`, bgStyle1, 'background: #FF0000;', 'background: transparent;', ...args);
};
class Logger {
    constructor(name) {
        this.name = name;
        this.name = name;
    }
    log(...args) {
        log(this.name, ...args);
    }
    debug(...args) {
        debug(this.name, ...args);
    }
    warn(...args) {
        warn(this.name, ...args);
    }
    error(...args) {
        error(this.name, ...args);
    }
    group(...args) {
        group(this.name, ...args);
    }
    groupEnd(...args) {
        groupEnd(this.name, ...args);
    }
}
export default Logger;
