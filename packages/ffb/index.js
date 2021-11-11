'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/zpage-ffb.cjs.prod.js')
} else {
  module.exports = require('./dist/zpage-ffb.cjs.js')
}
