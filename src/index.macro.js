const { createMacro, MacroError } = require('babel-plugin-macros');
module.exports = createMacro(extMacro);

const optionalChain = (object, chain, ifNullish = () => null) => {
  let result = object;
  for (let member of chain.split('.')) {
    if (result[member] === undefined || result[member] === null)
      return ifNullish(result, member);
    result = result[member];
  }
  return result;
};

function extMacro({ references, babel }) {
  const { types: t, parseSync: parse } = babel;

  // if extension is used
  if (references.default[0]) {
    const error = () => {
      throw new MacroError(`Wrong form of extension declaration`);
    };

    let extensions = [];
    const deafultName = references.default[0].node.name;

    references.default.forEach((path) => {
      const constructorName = t.stringLiteral(
        optionalChain(path, 'parentPath.node.property.name', error)
      );
      const property = optionalChain(
        path,
        'parentPath.parentPath.node.property.name',
        error
      );
      const extensionFunction = {
        ...optionalChain(
          path,
          'parentPath.parentPath.parentPath.node.right',
          error
        ),
      };
      const pType =
        path.parentPath.parentPath.parentPath.parentPath.parentPath.node.type;
      if (pType !== 'Program') {
        throw new MacroError(
          `Extension must be declared in the body of file, instead you have put it in ${pType}`
        );
      }
      const id = t.identifier(
        `_extension_${constructorName.value}_${property}`
      );
      path.parentPath.parentPath.parentPath.replaceWithMultiple(
        t.variableDeclaration('const', [
          t.variableDeclarator(id, extensionFunction),
        ])
      );
      const propIndex = extensions.findIndex((v) => v.property === property);

      const moreNode = t.objectExpression(
        //{ type, ext }
        [
          t.objectProperty(t.identifier('type'), constructorName),
          t.objectProperty(t.identifier('ext'), /*extensionFunction*/ id),
        ]
      );

      if (propIndex === -1) extensions.push({ property, moreList: [moreNode] });
      else extensions[propIndex].moreList.unshift(moreNode);
    });

    const replacementCode = `
    ((obj, property, moreList) => {
      if(!obj[property]) {
        const more = moreList
        .find(v => (v.type === 'any' || v.type === obj.constructor.name ) 
        && v.ext !== undefined);
        if(more) return more.ext(obj);
        return undefined;
      } 
      else if(typeof obj[property] === 'function')
      return obj[property].bind(obj);
      return obj[property];
    })()
    `;
    const replacementNode = parse(replacementCode).program.body[0];
    const getReplacement = (...args) => {
      let rep = replacementNode;
      const arg = { arguments: args };
      rep = { ...rep, expression: { ...rep.expression, ...arg } };
      return rep;
    };
    const programPath = references.default[0].find((path) =>
      t.isProgram(path.node)
    );

    let extensionReferences = [];

    const IndentifierVisitor = {
      Identifier(path) {
        const prop = path.node;
        if (path.parentPath.node.type === 'MemberExpression')
          extensions.find(({ property, moreList }) => {
            if (prop.name === property) {
              extensionReferences.push({
                path: path.parentPath,
                property,
                moreList,
              });
              return true;
            }
            return false;
          });
      },
    };

    const MemberVisitor = {
      MemberExpression(path) {
        const maybeExtensionName = optionalChain(
          path,
          'node.object.object.name'
        );
        //deafult name
        if (maybeExtensionName === deafultName) {
          path.skip();
        } else {
          path.traverse(IndentifierVisitor);
          path.skip();
        }
      },
    };
    programPath.traverse(MemberVisitor);
    extensionReferences.forEach(({ path, property, moreList }) =>
      path.replaceWith(
        getReplacement(
          path.node.object,
          t.stringLiteral(property),
          t.arrayExpression(moreList)
        )
      )
    );
  }
}
