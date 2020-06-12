export const optionalChain = (object, chain, ifNullish = () => null) => {
  let result = object;
  for (let member of chain.split('.')) {
    if (result[member] === undefined || result[member] === null)
      return ifNullish(result, member);
    result = result[member];
  }
  return result;
};
