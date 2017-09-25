'use strict'

const wkno = require('../lib/wkno')

const tasks = {

  "task1": wkno.task(function() {
    this.name = this.result.previous || this.name
    return this.name
  }, { name: 'John' }),

  "task2": function() {
    console.log(this.result.previous)
  },

  "task3": function() {
    console.log('Who is there ?')
    return 'Max'
  }

}

// The second arguments is array to reorder task execute or repeat task
wkno.serie(tasks, [
  'task3', 'task1', 'task2',
  'task3', 'task1', 'task2'
])