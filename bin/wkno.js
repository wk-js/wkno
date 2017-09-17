#!/usr/bin/env node
'use strict'

const { Parser } = require('wk-argv-parser')
Object.assign(global, require('../lib/wkno'))

const path      = require('path')
const fs        = require('fs')
const { spawn } = require('child_process')

const argv = process.argv.slice(2)
const cli  = path.basename(process.argv[1])
argv.unshift(cli)

const WKCmd = Parser

.command(cli)

// --file, -F
.describe('file', 'Precise a default file')
.string('file', process.cwd() + '/Wkfile')
.alias('file', [ 'F' ])
.validate('file', function(pth) {
  const fs = require('fs')
  try {
    fs.accessSync(pth, fs.constants.R_OK)
    return true
  } catch(e) {
    return false
  }
})

// --parallel
.describe('parallel', 'Execute tasks in parallel')
.boolean('parallel', false)
.alias('parallel', [ 'p' ])

// --tasks, -T
.describe('tasks', 'List available tasks')
.boolean('tasks', false)
.alias('tasks', [ 'T' ])

// .required('file', 'Need a Wkfile')

.help()
const ContextArgv = Parser.getContextARGV(argv, WKCmd.config)
const TaskArgv    = argv.filter((str) => {
  return ContextArgv.indexOf(str) === -1
})

const ContextResult = WKCmd.parse(ContextArgv)

if (ContextResult.errors) {
  console.log(ContextResult.errors.map(function(error) {
    return `${error.message} (missings: ${error.missings})`
  }).join('\n'))
  process.exit(1)
  return
}

const options = ContextResult.result.params

function listTask( tasks ) {
  const { pad } = require('lol/utils/string')

  const tsks = []

  let length = 0

  Object.keys(tasks)
  .filter(function(tsk) {
    const valid = (!tasks[tsk].hasOwnProperty('visible') || tasks[tsk].visible)
    if (valid) length = Math.max(length, tsk.length)
    return valid
  })
  .forEach(function(tsk) {
    if (!tasks[tsk].description) return tsks.push( `wkn ${tsk}` )
    tsks.push( `wkn ${tsk}` + pad('# ' + tasks[tsk].description, length + 5, ' ', true) )
  })

  console.log(tsks.join('\n'))
}

function getFile( p ) {
  try {
    fs.accessSync( path.resolve(p), fs.constants.R_OK )
    return require( path.resolve(p) )
  } catch(e) {
    return null
  }
}

function exec(cmd) {
  return function(resolve, reject) {
    let exited = false
    let bash   = '/bin/sh'
    let args   = [ '-c', cmd ]

    if (process.platform === 'win32') {
      bash = 'cmd'
      args = [ '/c', cmd ]
      // bash  = 'bash'
      // args = [ '-c', cmd ]
    }

    function exit(code, signal, err) {
      if (exited) return
      exited = true

      const result = {
        code: code,
        signal: signal,
        err: err
      }

      if (code != 0 || err) {
        return reject(result)
      }

      resolve(result)
    }

    const ps = spawn(bash, args, { stdio: 'inherit' })

    ps.on('error', function(value) {
      let err
      if (value) {
        if (value instanceof Error) err = value
        else if ( typeof value === 'string' ) err = new Error( value )
        else err = new Error( value.toString() )
      } else {
        err = new Error()
      }

      exit(null, null, err)
    })

    ps.on('exit', exit)
  }
}

// --file, -F
const tasks = {}
Object.assign(tasks, getFile( options.file ) || {})

const pkg = getFile( 'package.json' )
if (pkg) {
  for (const key in pkg.scripts) {
    tasks[key] = exec(`npm run ${key}`)
  }
}


// --tasks, -T
if (options.tasks) {
  return listTask( tasks )
}

// --help, -h
if (options.help) {
  const pkg = require('./../package.json')
  console.log( `${pkg.name} v${pkg.version} \n`)
  console.log( ContextResult.result.config.help.description )
  return
}

if (TaskArgv.length > 0) {
  if (options.parallel) {
    parallel(tasks, TaskArgv)
  } else {
    serie(tasks, TaskArgv)
  }

  return
}

// By default list tasks
listTask(tasks)