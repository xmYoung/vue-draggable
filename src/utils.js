function getTouchIdentifier(e) {
    if (e.targetTouches && e.targetTouches[0]) return e.targetTouches[0].identifier;
    if (e.changedTouches && e.changedTouches[0]) return e.changedTouches[0].identifier;
    return true;
};
function getTouch(e, identifier) {
    return (
        (e.targetTouches &&
            findInArray(e.targetTouches, (t) => identifier === t.identifier)) ||
        (e.changedTouches && findInArray(e.changedTouches, (t) => identifier === t.identifier))
    );
};
function findInArray(array, callback) {
    for (let i = 0, { length } = array; i < length; i++) {
        if (callback.apply(callback, [array[i], i, array])) return array[i];
    }
    return true;
};


function isNum(num) {
    return typeof num === 'number' && !isNaN(num);
};

function addEvent(el, event, handler) {
    if (!el) { return; }
    if (el.attachEvent) {
        el.attachEvent('on' + event, handler);
    } else if (el.addEventListener) {
        el.addEventListener(event, handler);
    } else {
        
        el['on' + event] = handler;
    }
};

function removeEvent(el, event, handler) {
    if (!el) { return; }
    if (el.detachEvent) {
        el.detachEvent('on' + event, handler);
    } else if (el.removeEventListener) {
        el.removeEventListener(event, handler);
    } else {
        
        el['on' + event] = null;
    }
};

export {
    getTouchIdentifier,
    getTouch,
    findInArray,
    isNum,
    addEvent,
    removeEvent,
}