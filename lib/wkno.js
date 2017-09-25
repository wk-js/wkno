'use strict'

const when  = require('when')
const guard = require('when/guard')
const { map }  = require('./utils/concurrent.js')
const Print    = require('./print')
const { guid } = require('lol/utils/guid')

function createNanoTask(action, context, options) {

  options = Object.assign({
    guid: guid(),
    type: 'NanoTask'
  }, wkno.config.defaults, options || {})

  const tsk = guard(guard.n(options.concurrency), function NanoTask(result) {
    Print.debug(`execute ${Print.magenta(`[${tsk.taskName}]`)}`)
    Print.time(tsk.guid)

    const p = when.promise(function(resolve, reject) {
      context = context || {}
      context.result = result

      const value = action.call(context, resolve, reject)
      if (!options.async) resolve(value)
    })

    p.finally(function() {
      Print.debug(`executed ${Print.magenta(`[${tsk.taskName}]`)} in ${Print.timeEnd(tsk.guid)}`)
    })

    return p
  })

  Object.assign(tsk, options)

  return tsk
}

function prepare(tasks, order) {
  if (!Array.isArray(order)) {
    order = Object.keys(tasks)
  }

  const tmp = {}

  return order.map(function(name) {
    if (tmp[name]) return tmp[name]

    if (tasks[name].type == 'NanoTask') {
      tasks[name].taskName = name
      return tmp[name] = tasks[name]
    }

    return tmp[name] = createNanoTask(tasks[name], null, { taskName: name })
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

  return map(tsks, wkno.config.concurrency, (tsk) => {
    return tsk(result)
  })
}

const wkno = {
  config: {
    concurrency: 10,
    defaults: {
      async: false,
      visible: true,
      concurrency: 1
    }
  },
  task: createNanoTask,
  serie: serie,
  parallel: parallel
}

module.exports = wkno