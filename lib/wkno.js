'use strict'

const when  = require('when')
const guard = require('when/guard')
// const { map }  = require('./utils/concurrent.js')
const Print    = require('./print')
const { guid } = require('lol/utils/guid')

const execute = guard(guard.n(1), function(fn) {
  return fn()
})

function createNanoTask(action, context, options) {
  const tsk = function NanoTask(result) {
    return execute(() => {

      Print.debug(`execute ${Print.magenta(`[${tsk.taskName}]`)}`)
      Print.time(tsk.guid)

      const p = when.promise(function(resolve, reject) {
        context = context || {}
        context.result = result
        return action.call(context, resolve, reject)
      })

      p.finally(function() {
        Print.debug(`executed ${Print.magenta(`[${tsk.taskName}]`)} in ${Print.timeEnd(tsk.guid)}`)
      })

      return p

    })
  }

  options = options || {}
  options.guid = guid()
  Object.assign(tsk, options)

  return tsk
}

function prepare(tasks, order) {
  if (!Array.isArray(order)) {
    order = Object.keys(tasks)
  }

  return order.map(function(name) {
    if (tasks[name].name == 'NanoTask') {
      tasks[name].taskName = name
      return tasks[name]
    }
    return createNanoTask(tasks[name], null, { taskName: name })
  })
}

function serie(tasks, order, shared) {
  const tsks = prepare(tasks, order)

  const results = []

  const result = {
    shared: shared
  }

  return when.reduce(tsks, (previous, tsk) => {
    result.previous = previous
    return tsk(result).then((val) => {
      results.push( val )
      return val
    })
  }, results).then(() => {
    return results
  })
}

function parallel(tasks, order, shared) {
  const tsks = prepare(tasks, order)

  const result = { shared: shared }

  return when.map(tsks, (tsk) => {
    return tsk(result)
  })
}

const wkno = {
  wkno: {
    concurrency: 10
  },
  task: createNanoTask,
  serie: serie,
  parallel: parallel
}

module.exports = wkno