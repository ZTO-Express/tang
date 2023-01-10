
import type { Enginer } from './tpl'

function compile(str: string, { data }) {
  return str.replace(/\$\{\{(.*?)\}\}/g, (a, b) => {
    const fn = new Function('data', 'return ' + b);
    try {
      return fn(data || {})
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
