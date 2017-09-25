'use strict'

const wkno = require('../lib/wkno')

wkno.parallel({
  task0: wkno.task(function(resolve) {
    console.log('task0')
    setTimeout(resolve, 1000)
  }, null, { async: true })
}, [
  'task0',
  'task0',
  'task0',
  'task0',
  'task0',
  'task0',
  'task0',
  'task0',
  'task0',
  'task0',
  'task0',
  'task0'
])