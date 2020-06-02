"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var _require = require('babel-plugin-macros'),
    createMacro = _require.createMacro,
    MacroError = _require.MacroError;

module.exports = createMacro(extMacro);

var optionalChain = function optionalChain(object, chain) {
  var ifNullish = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function () {
    return null;
  };
  var result = object;

  var _iterator = _createForOfIteratorHelper(chain.split('.')),
      _step;

  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var member = _step.value;
      if (result[member] === undefined || result[member] === null) return ifNullish(result, member);
      result = result[member];
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  return result;
};

function extMacro(_ref) {
  var references = _ref.references,
      babel = _ref.babel;
  var t = babel.types,
      parse = babel.parseSync; // if extension is used

  if (references["default"][0]) {
    var error = function error() {
      throw new MacroError("Wrong form of extension declaration");
    };

    var extensions = [];
    var deafultName = references["default"][0].node.name;
    references["default"].forEach(function (path) {
      var constructorName = t.stringLiteral(optionalChain(path, 'parentPath.node.property.name', error));
      var property = optionalChain(path, 'parentPath.parentPath.node.property.name', error);

      var extensionFunction = _objectSpread({}, optionalChain(path, 'parentPath.parentPath.parentPath.node.right', error));

      var pType = path.parentPath.parentPath.parentPath.parentPath.parentPath.node.type;

      if (pType !== 'Program') {
        throw new MacroError("Extension must be declared in the body of file, instead you have put it in ".concat(pType));
      }

      var id = t.identifier("_extension_".concat(constructorName.value, "_").concat(property));
      path.parentPath.parentPath.parentPath.replaceWithMultiple(t.variableDeclaration('const', [t.variableDeclarator(id, extensionFunction)]));
      var propIndex = extensions.findIndex(function (v) {
        return v.property === property;
      });
      var moreNode = t.objectExpression( //{ type, ext }
      [t.objectProperty(t.identifier('type'), constructorName), t.objectProperty(t.identifier('ext'),
      /*extensionFunction*/
      id)]);
      if (propIndex === -1) extensions.push({
        property: property,
        moreList: [moreNode]
      });else extensions[propIndex].moreList.unshift(moreNode);
    });
    var replacementCode = "\n    ((obj, property, moreList) => {\n      if(!obj[property]) {\n        const more = moreList\n        .find(v => (v.type === 'any' || v.type === obj.constructor.name ) \n        && v.ext !== undefined);\n        if(more) return more.ext(obj);\n        return undefined;\n      } \n      else if(typeof obj[property] === 'function')\n      return obj[property].bind(obj);\n      return obj[property];\n    })()\n    ";
    var replacementNode = parse(replacementCode).program.body[0];

    var getReplacement = function getReplacement() {
      var rep = replacementNode;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var arg = {
        arguments: args
      };
      rep = _objectSpread(_objectSpread({}, rep), {}, {
        expression: _objectSpread(_objectSpread({}, rep.expression), arg)
      });
      return rep;
    };

    var programPath = references["default"][0].find(function (path) {
      return t.isProgram(path.node);
    });
    var extensionReferences = [];
    var IndentifierVisitor = {
      Identifier: function Identifier(path) {
        var prop = path.node;
        if (path.parentPath.node.type === 'MemberExpression') extensions.find(function (_ref2) {
          var property = _ref2.property,
              moreList = _ref2.moreList;

          if (prop.name === property) {
            extensionReferences.push({
              path: path.parentPath,
              property: property,
              moreList: moreList
            });
            return true;
          }

          return false;
        });
      }
    };
    var MemberVisitor = {
      MemberExpression: function MemberExpression(path) {
        var maybeExtensionName = optionalChain(path, 'node.object.object.name'); //deafult name

        if (maybeExtensionName === deafultName) {
          path.skip();
        } else {
          path.traverse(IndentifierVisitor);
          path.skip();
        }
      }
    };
    programPath.traverse(MemberVisitor);
    extensionReferences.forEach(function (_ref3) {
      var path = _ref3.path,
          property = _ref3.property,
          moreList = _ref3.moreList;
      return path.replaceWith(getReplacement(path.node.object, t.stringLiteral(property), t.arrayExpression(moreList)));
    });
  }
}