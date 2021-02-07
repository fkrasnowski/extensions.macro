"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _require = require('babel-plugin-macros'),
    createMacro = _require.createMacro,
    MacroError = _require.MacroError;

var _require2 = require('./optionalChain'),
    optionalChain = _require2.optionalChain;

module.exports = createMacro(extMacro);
var extensionsObjName = '__extensions';
var extensionFnName = '__extensionFn';

function extMacro(_ref) {
  var references = _ref.references,
      babel = _ref.babel;
  var t = babel.types,
      parse = babel.parseSync; // dev options:

  var libPath;
  references.dev.forEach(function (path) {
    var parent = path.parentPath;

    if (t.isMemberExpression(parent)) {
      if (parent.node.property.name === 'libPath') {
        libPath = parent.parentPath.node.right.value;
        parent.parentPath.remove();
      }
    }
  }); // if extension is used

  if (references["default"][0]) {
    var error = function error() {
      throw new MacroError("Wrong form of extension declaration");
    };

    var extensions = {}; // The name of default import eg. "extension", "ext"

    var deafultName = references["default"][0].node.name;
    references["default"].forEach(function (path) {
      // extension has the from "extension.{constructorName}.{property}
      var constructorName = optionalChain(path, 'parentPath.node.property.name', error);
      var property = optionalChain(path, 'parentPath.parentPath.node.property.name', error);

      var extensionFunction = _objectSpread({}, optionalChain(path, 'parentPath.parentPath.parentPath.node.right', error)); // The node type of 5th parent shoud be "Program" -> Main scope of file


      var pType = path.parentPath.parentPath.parentPath.parentPath.parentPath.node.type;

      if (pType !== 'Program') {
        throw new MacroError("Extension must be declared in the main scope of the file, instead you have put it in ".concat(pType));
      }

      path.parentPath.parentPath.parentPath.remove();
      if (!extensions[property]) extensions[property] = {};
      extensions[property][constructorName] = extensionFunction;
    });

    var getReplacement = function getReplacement() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return t.callExpression(t.identifier(extensionFnName), [].concat(args, [t.identifier(extensionsObjName)]));
    };

    var programPath = references["default"][0].find(function (path) {
      return t.isProgram(path.node);
    });
    var extensionReferences = [];
    var IndentifierVisitor = {
      Identifier: function Identifier(path) {
        var prop = path.node;
        if (path.parentPath.node.type === 'MemberExpression') if (extensions[prop.name]) {
          extensionReferences.push({
            path: path.parentPath,
            property: prop.name
          });
        }
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
    extensionReferences.forEach(function (_ref2) {
      var path = _ref2.path,
          property = _ref2.property;
      return path.replaceWith(getReplacement(path.node.object, t.stringLiteral(property)));
    });

    var prop = function prop(_prop, value) {
      return t.objectProperty(t.identifier(_prop), value, false, false, null);
    };

    var getExtensionNode = function getExtensionNode(extensions) {
      return t.objectExpression(Object.entries(extensions).map(function (_ref3) {
        var _ref4 = _slicedToArray(_ref3, 2),
            name = _ref4[0],
            typesObj = _ref4[1];

        return prop(name, t.objectExpression(Object.entries(typesObj).map(function (_ref5) {
          var _ref6 = _slicedToArray(_ref5, 2),
              type = _ref6[0],
              fn = _ref6[1];

          return prop(type, fn);
        })));
      }));
    };

    var afterImportIndex = programPath.node.body.findIndex(function (v) {
      return v.type !== 'ImportDeclaration';
    });
    programPath.node.body.splice(afterImportIndex, 0, t.importDeclaration([t.importSpecifier(t.identifier(extensionFnName), t.identifier('extensionFn'))], t.stringLiteral("".concat(libPath || 'extensions.macro', "/helpers"))), t.variableDeclaration('const', [t.variableDeclarator(t.identifier(extensionsObjName), getExtensionNode(extensions))]));
  }
}