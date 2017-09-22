'use strict'

const tasks = {

  "task1": task(function(resolve) {
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

module.exports = tasks

// The second arguments is array to reorder task execute or repeat task
if (!global.wkno) {
  const wkno = require('../lib/wkno')
  wkno.serie(tasks, [
    'task3', 'task1', 'task2',
    'task3', 'task1', 'task2'
  ])
}