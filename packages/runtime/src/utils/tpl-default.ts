
import type { Enginer } from './tpl'

export function filterXSS(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/ /g, '&nbsp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/&lt;br[&nbsp;]*\/?&gt;/g, '<br/>')
    .replace(/\r{0,}\n/g, '<br/>')
}

function filterObj(obj: any) {
  if (!obj || typeof obj !== 'object') {
    return obj
  }

  if (['[object Date]', '[object RegExp]'].includes(Object.prototype.toString.call(obj))) {
    return obj
  }

  let newObj = Array.isArray(obj) ? [] : {}

  Object.keys(obj).map(key => {
    if (typeof obj[key] === 'object') {
      newObj[key] = filterObj(obj[key])
    } else if (typeof obj[key] === 'string') {
      newObj[key] = filterXSS(obj[key])
    } else {
      newObj[key] = obj[key]
    }
  })

  return newObj

}

function compile(str: string, { data }) {
  data = filterObj(data)
  return str.replace(/\$\{\{(.*?)\}\}/g, (a, b) => {
    const fn = new Function('data', 'return ' + b);
    try {
      return fn.call('', data || {})
    } catch (error) {
      return null
    }
  })
}

export function register(): Enginer & { name: string } {
  return {
    name: 'default',
    test: (str: string) => !!~str.indexOf('${{'),
    compile
  }
}
