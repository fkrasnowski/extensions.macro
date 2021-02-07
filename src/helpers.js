export const extensionFn = (obj, property, extensions) => {
  if (!obj[property]) {
    const p = extensions[property]
    const constructorName = obj.constructor.name
    if (p[constructorName]) return p[constructorName](obj)
    if (p.any) return p.any(obj)
    return undefined
  } else if (typeof obj[property] === 'function') return obj[property].bind(obj)
  return obj[property]
}
