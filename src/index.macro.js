const { createMacro, MacroError } = require('babel-plugin-macros')
const { optionalChain } = require('./optionalChain')
module.exports = createMacro(extMacro)

const extensionsObjName = '__extensions'
const extensionFnName = '__extensionFn'
function extMacro({ references, babel }) {
  const { types: t, parseSync: parse } = babel
  // dev options:
  let libPath
  references.dev.forEach(path => {
    const parent = path.parentPath
    if (t.isMemberExpression(parent)) {
      if (parent.node.property.name === 'libPath') {
        libPath = parent.parentPath.node.right.value
        parent.parentPath.remove()
      }
    }
  })

  // if extension is used
  if (references.default[0]) {
    const error = () => {
      throw new MacroError(`Wrong form of extension declaration`)
    }

    let extensions = {}

    // The name of default import eg. "extension", "ext"
    const deafultName = references.default[0].node.name

    references.default.forEach(path => {
      // extension has the from "extension.{constructorName}.{property}
      const constructorName = optionalChain(
        path,
        'parentPath.node.property.name',
        error
      )

      const property = optionalChain(
        path,
        'parentPath.parentPath.node.property.name',
        error
      )
      const extensionFunction = {
        ...optionalChain(
          path,
          'parentPath.parentPath.parentPath.node.right',
          error
        ),
      }

      // The node type of 5th parent shoud be "Program" -> Main scope of file
      const pType =
        path.parentPath.parentPath.parentPath.parentPath.parentPath.node.type
      if (pType !== 'Program') {
        throw new MacroError(
          `Extension must be declared in the main scope of the file, instead you have put it in ${pType}`
        )
      }

      path.parentPath.parentPath.parentPath.remove()

      if (!extensions[property]) extensions[property] = {}
      extensions[property][constructorName] = extensionFunction
    })

    const getReplacement = (...args) =>
      t.callExpression(t.identifier(extensionFnName), [
        ...args,
        t.identifier(extensionsObjName),
      ])
    const programPath = references.default[0].find(path =>
      t.isProgram(path.node)
    )

    let extensionReferences = []

    const IndentifierVisitor = {
      Identifier(path) {
        const prop = path.node
        if (path.parentPath.node.type === 'MemberExpression')
          if (extensions[prop.name]) {
            extensionReferences.push({
              path: path.parentPath,
              property: prop.name,
            })
          }
      },
    }

    const MemberVisitor = {
      MemberExpression(path) {
        const maybeExtensionName = optionalChain(
          path,
          'node.object.object.name'
        )
        //deafult name
        if (maybeExtensionName === deafultName) {
          path.skip()
        } else {
          path.traverse(IndentifierVisitor)
          path.skip()
        }
      },
    }
    programPath.traverse(MemberVisitor)
    extensionReferences.forEach(({ path, property }) =>
      path.replaceWith(
        getReplacement(path.node.object, t.stringLiteral(property))
      )
    )
    const prop = (prop, value) =>
      t.objectProperty(t.identifier(prop), value, false, false, null)

    const getExtensionNode = extensions =>
      t.objectExpression(
        Object.entries(extensions).map(([name, typesObj]) =>
          prop(
            name,
            t.objectExpression(
              Object.entries(typesObj).map(([type, fn]) => prop(type, fn))
            )
          )
        )
      )
    const afterImportIndex = programPath.node.body.findIndex(
      v => v.type !== 'ImportDeclaration'
    )
    programPath.node.body.splice(
      afterImportIndex,
      0,
      t.importDeclaration(
        [
          t.importSpecifier(
            t.identifier(extensionFnName),
            t.identifier('extensionFn')
          ),
        ],
        t.stringLiteral(`${libPath || 'extensions.macro'}/helpers`)
      ),
      t.variableDeclaration('const', [
        t.variableDeclarator(
          t.identifier(extensionsObjName),
          getExtensionNode(extensions)
        ),
      ])
    )
  }
}
