'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/zpage-runtime.cjs.prod.js')
} else {
  module.exports = require('./dist/zpage-runtime.cjs.js')
}
