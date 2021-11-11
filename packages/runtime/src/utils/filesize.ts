/* eslint-disable no-void */
const b = /^(b|B)$/,
  symbol: Record<string, any> = {
    iec: {
      bits: ['b', 'Kib', 'Mib', 'Gib', 'Tib', 'Pib', 'Eib', 'Zib', 'Yib'],
      bytes: ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']
    },
    jedec: {
      bits: ['b', 'Kb', 'Mb', 'Gb', 'Tb', 'Pb', 'Eb', 'Zb', 'Yb'],
      bytes: ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    }
  },
  fullform: Record<string, any> = {
    iec: ['', 'kibi', 'mebi', 'gibi', 'tebi', 'pebi', 'exbi', 'zebi', 'yobi'],
    jedec: ['', 'kilo', 'mega', 'giga', 'tera', 'peta', 'exa', 'zetta', 'yotta']
  }

export interface FilesizeDescriptor {
  base?: number // Number base, default is 2
  bits?: boolean // Enables bit sizes, default is false
  exponent?: number // Specifies the symbol via exponent, e.g. 2 is MB for base 2, default is -1
  fullform?: boolean // Enables full form of unit of measure, default is false
  fullforms?: [] //Array of full form overrides, default is []
  locale?: string | boolean //  BCP 47 language tag to specify a locale, or true to use default locale, default is ""
  localeOptions?: object // Dictionary of options defined by ECMA-402 (Number.prototype.toLocaleString). Requires locale option to be explicitly passed as a string, otherwise is ignored.
  output?: string // Output of function (array, exponent, object, or string), default is string
  round?: number // Decimal place, default is 2
  separator?: string // Decimal separator character, default is .
  spacer?: string // Character between the result and symbol, default is " "
  standard?: string // Standard unit of measure, can be iec or jedec, default is jedec; can be overruled by base
  symbols?: Record<string, any> // Dictionary of SI/JEDEC/IEC symbols to replace for localization, defaults to english if no match is found
  unix?: boolean // Enables unix style human readable output, e.g ls -lh, default is false
}

export type FilesizeResult = string | number | any[] | { value: any; symbol: any; exponent: number }

/**
 * filesize https://github.com/avoidwork/filesize.js
 *
 * @method filesize
 * @param  {Mixed}   arg        String, Int or Float to transform
 * @param  {Object}  descriptor [Optional] Flags
 * @return {String}             Readable file size String
 */
export function filesize(arg: number, descriptor: FilesizeDescriptor = {}): FilesizeResult {
  if (isNaN(arg)) {
    throw new TypeError('Invalid number')
  }
  const result: any[] = []
  let val = 0
  let e = descriptor.exponent !== void 0 ? descriptor.exponent : -1
  const base = descriptor.base || 2
  const bits = descriptor.bits === true
  const ceil = base > 2 ? 1000 : 1024
  const full = descriptor.fullform === true
  const fullforms: any[] = descriptor.fullforms instanceof Array ? descriptor.fullforms : []
  const locale = descriptor.locale !== void 0 ? descriptor.locale : ''
  const localeOptions = descriptor.localeOptions || {}
  let num = Number(arg)
  const neg = num < 0
  const output = descriptor.output || 'string'
  const unix = descriptor.unix === true
  const round = descriptor.round !== void 0 ? descriptor.round : unix ? 1 : 2
  const separator = descriptor.separator !== void 0 ? descriptor.separator : ''
  const spacer = descriptor.spacer !== void 0 ? descriptor.spacer : unix ? '' : ' '
  const standard = base === 2 ? descriptor.standard || 'jedec' : 'jedec'
  const symbols = descriptor.symbols || {}

  // Flipping a negative number to determine the size
  if (neg) {
    num = -num
  }

  // Determining the exponent
  if (e === -1 || isNaN(e)) {
    e = Math.floor(Math.log(num) / Math.log(ceil))

    if (e < 0) {
      e = 0
    }
  }

  // Exceeding supported length, time to reduce & multiply
  if (e > 8) {
    e = 8
  }

  if (output === 'exponent') {
    return e
  }

  // Zero is now a special case because bytes divide by 1
  if (num === 0) {
    result[0] = 0
    result[1] = unix ? '' : symbol[standard][bits ? 'bits' : 'bytes'][e]
  } else {
    val = num / (base === 2 ? Math.pow(2, e * 10) : Math.pow(1000, e))

    if (bits) {
      val = val * 8

      if (val >= ceil && e < 8) {
        val = val / ceil
        e++
      }
    }

    result[0] = Number(val.toFixed(e > 0 ? round : 0))

    if (result[0] === ceil && e < 8 && descriptor.exponent === void 0) {
      result[0] = 1
      e++
    }

    result[1] =
      base === 10 && e === 1 ? (bits ? 'kb' : 'kB') : symbol[standard][bits ? 'bits' : 'bytes'][e]

    if (unix) {
      result[1] =
        standard === 'jedec' ? result[1].charAt(0) : e > 0 ? result[1].replace(/B$/, '') : result[1]

      if (b.test(result[1])) {
        result[0] = Math.floor(result[0])
        result[1] = ''
      }
    }
  }

  // Decorating a 'diff'
  if (neg) {
    result[0] = -result[0]
  }

  // Applying custom symbol
  result[1] = symbols[result[1]] || result[1]

  if (locale === true) {
    result[0] = result[0].toLocaleString()
  } else if (locale && locale.length > 0) {
    result[0] = result[0].toLocaleString(locale, localeOptions)
  } else if (separator.length > 0) {
    result[0] = result[0].toString().replace('.', separator)
  }

  // Returning Array, Object, or String (default)
  if (output === 'array') {
    return result
  }

  if (full) {
    result[1] = fullforms[e]
      ? fullforms[e]
      : fullform[standard][e] + (bits ? 'bit' : 'byte') + (result[0] === 1 ? '' : 's')
  }

  if (output === 'object') {
    return { value: result[0], symbol: result[1], exponent: e }
  }

  return result.join(spacer)
}

// Partial application for functional programming
filesize.partial = (opt: any) => (arg: any) => filesize(arg, opt)

export default filesize
