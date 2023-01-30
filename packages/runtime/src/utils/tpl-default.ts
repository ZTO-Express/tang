
import type { Enginer } from './tpl'
import { filters, registerFilter } from './tpl-builtin'

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
    let rs = null
    const bs = b.split(/(?<=[^|])\|(?=[^|])/)
    
    try {
      const fn = new Function('data', 'return ' + bs.shift().trim());
      rs =  fn.call('', data || {})
    } catch (error) {
    }

    try {
      rs = bs.reduce((pv, filter) => {
        const fs = filter.split(":")
        const fn = filters[fs.shift().trim()]
        return fn ? fn.apply('', [pv, ...fs]): pv
      }, rs)
    } catch (error) {
    }

    return rs
  })
}

export function register(): Enginer & { name: string } {
  return {
    name: 'default',
    test: (str: string) => !!~str.indexOf('${{'),
    compile
  }
}
