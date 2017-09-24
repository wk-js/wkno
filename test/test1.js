'use strict'

const wkno = require('../lib/wkno')

const tasks = {

  "task1": wkno.task(function(resolve) {
    resolve(this.name)
    this.name = 'Max'
  }, { name: 'John' }),

  "task2": function(resolve) {
    console.log(this.result)
    resolve()
  },

  "task3": function(resolve) {
    console.log('Who is there ?')
    resolve()
  }

}

// The second arguments is array to reorder task execute or repeat task
wkno.serie(tasks, [
  'task3', 'task1', 'task2',
  'task3', 'task1', 'task2'
])