'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/zpage-site-base.cjs.prod.js')
} else {
  module.exports = require('./dist/zpage-site-base.cjs.js')
}
