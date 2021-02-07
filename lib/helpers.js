"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.extensionFn = void 0;

var extensionFn = function extensionFn(obj, property, extensions) {
  if (!obj[property]) {
    var p = extensions[property];
    var constructorName = obj.constructor.name;
    if (p[constructorName]) return p[constructorName](obj);
    if (p.any) return p.any(obj);
    return undefined;
  } else if (typeof obj[property] === 'function') return obj[property].bind(obj);

  return obj[property];
};

exports.extensionFn = extensionFn;