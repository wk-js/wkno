'use strict'

const { Print, Levels, Plugins } = require('wk-print')
const P = new Print

P.level('debug', Levels.debug)
P.level('error', Levels.error)

P.plugin('tag', Plugins.tag)
P.plugin('date', Plugins.date)
P.plugin('style', Plugins.style)

P.visibility('log'  , true)
P.visibility('debug', false)
P.visibility('error', true)

// Time
const timers = {}

P.time = function(key) {
  if (key) timers[key] = Date.now()
}

P.timeEnd = function(key) {
  if ( timers[key] ) {
    const r = (Date.now() - timers[key]) + 'ms'
    delete timers[key]
    return r
  }
}

module.exports = P