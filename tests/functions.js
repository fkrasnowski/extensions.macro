"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var test = require('ava');

var _extension_any_returnIt = function _extension_any_returnIt(obj) {
  return function () {
    return obj;
  };
};

var _extension_Array_take5 = function _extension_Array_take5(array) {
  return function () {
    return function (obj, property, moreList) {
      if (!obj[property]) {
        var more = moreList.find(function (v) {
          return (v.type === 'any' || v.type === obj.constructor.name) && v.ext !== undefined;
        });
        if (more) return more.ext(obj);
        return undefined;
      } else if (typeof obj[property] === 'function') return obj[property].bind(obj);

      return obj[property];
    }(array, "map", [{
      type: "Array",
      ext: _extension_Array_map
    }])(function () {
      return 5;
    });
  };
};

var _extension_String_take5 = function _extension_String_take5(str) {
  return function (prefix) {
    return prefix + str + '5';
  };
};

var _extension_Function_returnIt = function _extension_Function_returnIt(fun) {
  return function () {
    return fun();
  };
};

var _extension_Array_second = function _extension_Array_second(array) {
  return array[1];
};

test('properly executed function', function (t) {
  t.is(function (obj, property, moreList) {
    if (!obj[property]) {
      var more = moreList.find(function (v) {
        return (v.type === 'any' || v.type === obj.constructor.name) && v.ext !== undefined;
      });
      if (more) return more.ext(obj);
      return undefined;
    } else if (typeof obj[property] === 'function') return obj[property].bind(obj);

    return obj[property];
  }('rattlesnake', "returnIt", [{
    type: "Function",
    ext: _extension_Function_returnIt
  }, {
    type: "any",
    ext: _extension_any_returnIt
  }])(), 'rattlesnake');
  t.is(function (obj, property, moreList) {
    if (!obj[property]) {
      var more = moreList.find(function (v) {
        return (v.type === 'any' || v.type === obj.constructor.name) && v.ext !== undefined;
      });
      if (more) return more.ext(obj);
      return undefined;
    } else if (typeof obj[property] === 'function') return obj[property].bind(obj);

    return obj[property];
  }(5, "returnIt", [{
    type: "Function",
    ext: _extension_Function_returnIt
  }, {
    type: "any",
    ext: _extension_any_returnIt
  }])(), 5);
  t.deepEqual(function (obj, property, moreList) {
    if (!obj[property]) {
      var more = moreList.find(function (v) {
        return (v.type === 'any' || v.type === obj.constructor.name) && v.ext !== undefined;
      });
      if (more) return more.ext(obj);
      return undefined;
    } else if (typeof obj[property] === 'function') return obj[property].bind(obj);

    return obj[property];
  }([1, 2, 3], "take5", [{
    type: "String",
    ext: _extension_String_take5
  }, {
    type: "Array",
    ext: _extension_Array_take5
  }])(), [5, 5, 5]);
  t.is(function (obj, property, moreList) {
    if (!obj[property]) {
      var more = moreList.find(function (v) {
        return (v.type === 'any' || v.type === obj.constructor.name) && v.ext !== undefined;
      });
      if (more) return more.ext(obj);
      return undefined;
    } else if (typeof obj[property] === 'function') return obj[property].bind(obj);

    return obj[property];
  }('take', "take5", [{
    type: "String",
    ext: _extension_String_take5
  }, {
    type: "Array",
    ext: _extension_Array_take5
  }])('q-'), 'q-take5');
});
test('overridnig function', function (t) {
  var fun = function fun() {
    return 'works!';
  };

  t.is(function (obj, property, moreList) {
    if (!obj[property]) {
      var more = moreList.find(function (v) {
        return (v.type === 'any' || v.type === obj.constructor.name) && v.ext !== undefined;
      });
      if (more) return more.ext(obj);
      return undefined;
    } else if (typeof obj[property] === 'function') return obj[property].bind(obj);

    return obj[property];
  }(fun, "returnIt", [{
    type: "Function",
    ext: _extension_Function_returnIt
  }, {
    type: "any",
    ext: _extension_any_returnIt
  }])(), 'works!');
  t.is(function (obj, property, moreList) {
    if (!obj[property]) {
      var more = moreList.find(function (v) {
        return (v.type === 'any' || v.type === obj.constructor.name) && v.ext !== undefined;
      });
      if (more) return more.ext(obj);
      return undefined;
    } else if (typeof obj[property] === 'function') return obj[property].bind(obj);

    return obj[property];
  }('take', "take5", [{
    type: "String",
    ext: _extension_String_take5
  }, {
    type: "Array",
    ext: _extension_Array_take5
  }])('q-'), 'q-take5');
});
test('extension properties (getter)', function (t) {
  t.is(function (obj, property, moreList) {
    if (!obj[property]) {
      var more = moreList.find(function (v) {
        return (v.type === 'any' || v.type === obj.constructor.name) && v.ext !== undefined;
      });
      if (more) return more.ext(obj);
      return undefined;
    } else if (typeof obj[property] === 'function') return obj[property].bind(obj);

    return obj[property];
  }([3, 2], "second", [{
    type: "Array",
    ext: _extension_Array_second
  }]), 2);
});
test('extension is proper type', function (t) {
  t.is(_typeof(function (obj, property, moreList) {
    if (!obj[property]) {
      var more = moreList.find(function (v) {
        return (v.type === 'any' || v.type === obj.constructor.name) && v.ext !== undefined;
      });
      if (more) return more.ext(obj);
      return undefined;
    } else if (typeof obj[property] === 'function') return obj[property].bind(obj);

    return obj[property];
  }('', "returnIt", [{
    type: "Function",
    ext: _extension_Function_returnIt
  }, {
    type: "any",
    ext: _extension_any_returnIt
  }])), 'function');
  t.is(_typeof(function (obj, property, moreList) {
    if (!obj[property]) {
      var more = moreList.find(function (v) {
        return (v.type === 'any' || v.type === obj.constructor.name) && v.ext !== undefined;
      });
      if (more) return more.ext(obj);
      return undefined;
    } else if (typeof obj[property] === 'function') return obj[property].bind(obj);

    return obj[property];
  }([1, 2], "second", [{
    type: "Array",
    ext: _extension_Array_second
  }])), 'number');
});

var _extension_String_charAt = function _extension_String_charAt(str) {
  return function (index) {
    return 'pranked!';
  };
};

var _extension_Array_map = function _extension_Array_map(arr) {
  return function () {
    return ["it's", 'a', 'map'];
  };
};

var _extension_Object_add = function _extension_Object_add(obj) {
  return function (prop, value) {
    return _objectSpread({
      prop: value
    }, obj);
  };
};

var fruit = {
  banana: 10,
  add: function add(v) {
    return 'fruit' + v;
  }
};
test("don't override object properies", function (t) {
  t.is(function (obj, property, moreList) {
    if (!obj[property]) {
      var more = moreList.find(function (v) {
        return (v.type === 'any' || v.type === obj.constructor.name) && v.ext !== undefined;
      });
      if (more) return more.ext(obj);
      return undefined;
    } else if (typeof obj[property] === 'function') return obj[property].bind(obj);

    return obj[property];
  }('Hello', "charAt", [{
    type: "String",
    ext: _extension_String_charAt
  }])(0), 'H');
  t.deepEqual(function (obj, property, moreList) {
    if (!obj[property]) {
      var more = moreList.find(function (v) {
        return (v.type === 'any' || v.type === obj.constructor.name) && v.ext !== undefined;
      });
      if (more) return more.ext(obj);
      return undefined;
    } else if (typeof obj[property] === 'function') return obj[property].bind(obj);

    return obj[property];
  }([1, 2, 3], "map", [{
    type: "Array",
    ext: _extension_Array_map
  }])(function (v) {
    return v * 2;
  }), [2, 4, 6]);
  t.is(function (obj, property, moreList) {
    if (!obj[property]) {
      var more = moreList.find(function (v) {
        return (v.type === 'any' || v.type === obj.constructor.name) && v.ext !== undefined;
      });
      if (more) return more.ext(obj);
      return undefined;
    } else if (typeof obj[property] === 'function') return obj[property].bind(obj);

    return obj[property];
  }(fruit, "add", [{
    type: "Number",
    ext: _extension_Number_add
  }, {
    type: "Object",
    ext: _extension_Object_add
  }])(10), 'fruit10');
});

var _extension_Number_inc = function _extension_Number_inc(num) {
  return function () {
    return num + 1;
  };
};

var _extension_Number_add = function _extension_Number_add(num) {
  return function (value) {
    return num + value;
  };
};

test('function chain', function (t) {
  t.is(function (obj, property, moreList) {
    if (!obj[property]) {
      var more = moreList.find(function (v) {
        return (v.type === 'any' || v.type === obj.constructor.name) && v.ext !== undefined;
      });
      if (more) return more.ext(obj);
      return undefined;
    } else if (typeof obj[property] === 'function') return obj[property].bind(obj);

    return obj[property];
  }(function (obj, property, moreList) {
    if (!obj[property]) {
      var more = moreList.find(function (v) {
        return (v.type === 'any' || v.type === obj.constructor.name) && v.ext !== undefined;
      });
      if (more) return more.ext(obj);
      return undefined;
    } else if (typeof obj[property] === 'function') return obj[property].bind(obj);

    return obj[property];
  }(function (obj, property, moreList) {
    if (!obj[property]) {
      var more = moreList.find(function (v) {
        return (v.type === 'any' || v.type === obj.constructor.name) && v.ext !== undefined;
      });
      if (more) return more.ext(obj);
      return undefined;
    } else if (typeof obj[property] === 'function') return obj[property].bind(obj);

    return obj[property];
  }(10, "inc", [{
    type: "Number",
    ext: _extension_Number_inc
  }])(), "inc", [{
    type: "Number",
    ext: _extension_Number_inc
  }])(), "add", [{
    type: "Number",
    ext: _extension_Number_add
  }, {
    type: "Object",
    ext: _extension_Object_add
  }])(5), 17);
});

var _extension_String_first = function _extension_String_first(str) {
  return str[0];
};

var _extension_String_name = function _extension_String_name(str) {
  return function (obj, property, moreList) {
    if (!obj[property]) {
      var more = moreList.find(function (v) {
        return (v.type === 'any' || v.type === obj.constructor.name) && v.ext !== undefined;
      });
      if (more) return more.ext(obj);
      return undefined;
    } else if (typeof obj[property] === 'function') return obj[property].bind(obj);

    return obj[property];
  }(str.constructor, "name", [{
    type: "String",
    ext: _extension_String_name
  }]);
};

var _extension_String_tag = function _extension_String_tag(str) {
  return "string: ".concat(str);
};

test('property chain', function (t) {
  t.is(function (obj, property, moreList) {
    if (!obj[property]) {
      var more = moreList.find(function (v) {
        return (v.type === 'any' || v.type === obj.constructor.name) && v.ext !== undefined;
      });
      if (more) return more.ext(obj);
      return undefined;
    } else if (typeof obj[property] === 'function') return obj[property].bind(obj);

    return obj[property];
  }(function (obj, property, moreList) {
    if (!obj[property]) {
      var more = moreList.find(function (v) {
        return (v.type === 'any' || v.type === obj.constructor.name) && v.ext !== undefined;
      });
      if (more) return more.ext(obj);
      return undefined;
    } else if (typeof obj[property] === 'function') return obj[property].bind(obj);

    return obj[property];
  }(function (obj, property, moreList) {
    if (!obj[property]) {
      var more = moreList.find(function (v) {
        return (v.type === 'any' || v.type === obj.constructor.name) && v.ext !== undefined;
      });
      if (more) return more.ext(obj);
      return undefined;
    } else if (typeof obj[property] === 'function') return obj[property].bind(obj);

    return obj[property];
  }('Wow', "name", [{
    type: "String",
    ext: _extension_String_name
  }]), "first", [{
    type: "String",
    ext: _extension_String_first
  }]), "tag", [{
    type: "String",
    ext: _extension_String_tag
  }]), 'string: S');
});
test('error if property undefinded', function (t) {
  t["throws"](function () {
    return function (obj, property, moreList) {
      if (!obj[property]) {
        var more = moreList.find(function (v) {
          return (v.type === 'any' || v.type === obj.constructor.name) && v.ext !== undefined;
        });
        if (more) return more.ext(obj);
        return undefined;
      } else if (typeof obj[property] === 'function') return obj[property].bind(obj);

      return obj[property];
    }(10, "tag", [{
      type: "String",
      ext: _extension_String_tag
    }])();
  }, {
    instanceOf: Error
  });
});