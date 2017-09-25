'use strict'

const wkno = require('../lib/wkno')
wkno.config.defaults.async = true

const tasks = {

  "task1": function(resolve) {
    this.result.shared.name = 'John'
    resolve([ this.result.shared.name ])
  },

  "task2": function(resolve) {
    this.result.shared.message = 'Salut'
    this.result.previous.push( this.result.shared.message )
    resolve(this.result.previous)
  },

  "task3": function(resolve) {
    this.result.shared.day = 'monday'
    this.result.previous.push( this.result.shared.day )
    resolve(this.result.previous)
  },

  "task4": function(resolve) {
    console.log(this.result)
    resolve()
  }

}

wkno.serie(tasks, null, {})
