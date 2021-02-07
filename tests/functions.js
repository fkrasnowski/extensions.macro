"use strict";

var _helpers = require("..//lib/helpers");

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var __extensions = {
  returnIt: {
    any: function any(obj) {
      return function () {
        return obj;
      };
    },
    Function: function Function(fun) {
      return function () {
        return fun();
      };
    }
  },
  take5: {
    Array: function Array(array) {
      return function () {
        return array.map(function () {
          return 5;
        });
      };
    },
    String: function String(str) {
      return function (prefix) {
        return prefix + str + '5';
      };
    }
  },
  second: {
    Array: function Array(array) {
      return array[1];
    }
  },
  charAt: {
    String: function String(str) {
      return function (index) {
        return 'pranked!';
      };
    }
  },
  map: {
    Array: function Array(arr) {
      return function () {
        return ["it's", 'a', 'map'];
      };
    }
  },
  add: {
    Object: function Object(obj) {
      return function (prop, value) {
        return _objectSpread({
          prop: value
        }, obj);
      };
    },
    Number: function Number(num) {
      return function (value) {
        return num + value;
      };
    }
  },
  inc: {
    Number: function Number(num) {
      return function () {
        return num + 1;
      };
    }
  },
  first: {
    String: function String(str) {
      return str[0];
    }
  },
  name: {
    String: function String(str) {
      return str.constructor.name;
    }
  },
  tag: {
    String: function String(str) {
      return "string: ".concat(str);
    }
  }
};

var test = require('ava');

test('properly executed function', function (t) {
  t.is((0, _helpers.extensionFn)('rattlesnake', "returnIt", __extensions)(), 'rattlesnake');
  t.is((0, _helpers.extensionFn)(5, "returnIt", __extensions)(), 5);
  t.deepEqual((0, _helpers.extensionFn)([1, 2, 3], "take5", __extensions)(), [5, 5, 5]);
  t.is((0, _helpers.extensionFn)('take', "take5", __extensions)('q-'), 'q-take5');
});
test('overridnig function', function (t) {
  var fun = function fun() {
    return 'works!';
  };

  t.is((0, _helpers.extensionFn)(fun, "returnIt", __extensions)(), 'works!');
  t.is((0, _helpers.extensionFn)('take', "take5", __extensions)('q-'), 'q-take5');
});
test('extension properties (getter)', function (t) {
  t.is((0, _helpers.extensionFn)([3, 2], "second", __extensions), 2);
});
test('extension is proper type', function (t) {
  t.is(_typeof((0, _helpers.extensionFn)('', "returnIt", __extensions)), 'function');
  t.is(_typeof((0, _helpers.extensionFn)([1, 2], "second", __extensions)), 'number');
});
var fruit = {
  banana: 10,
  add: function add(v) {
    return 'fruit' + v;
  }
};
test("don't override object properies", function (t) {
  t.is((0, _helpers.extensionFn)('Hello', "charAt", __extensions)(0), 'H');
  t.deepEqual((0, _helpers.extensionFn)([1, 2, 3], "map", __extensions)(function (v) {
    return v * 2;
  }), [2, 4, 6]);
  t.is((0, _helpers.extensionFn)(fruit, "add", __extensions)(10), 'fruit10');
});
test('function chain', function (t) {
  t.is((0, _helpers.extensionFn)((0, _helpers.extensionFn)((0, _helpers.extensionFn)(10, "inc", __extensions)(), "inc", __extensions)(), "add", __extensions)(5), 17);
});
test('property chain', function (t) {
  t.is((0, _helpers.extensionFn)((0, _helpers.extensionFn)((0, _helpers.extensionFn)('Wow', "name", __extensions), "first", __extensions), "tag", __extensions), 'string: S');
});
test('error if property undefinded', function (t) {
  t["throws"](function () {
    return (0, _helpers.extensionFn)(10, "tag", __extensions)();
  }, {
    instanceOf: Error
  });
});