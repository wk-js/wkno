'use strict'

const wkno = require('../lib/wkno')

const tasks = {

  task0: function(resolve) {
    console.log('task0')
    setTimeout(resolve, 1000)
  }

}

wkno.parallel(tasks, [
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