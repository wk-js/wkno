#!/usr/bin/env node
'use strict'

const { Parser } = require('wk-argv-parser')
Object.assign(global, require('../lib/wkno'))
const Print = require('../lib/print')

const path      = require('path')
const fs        = require('fs')
const { spawn } = require('child_process')

const argv = process.argv.slice(2)
const cli  = path.basename(process.argv[1])
argv.unshift(cli)

const WKCmd = Parser

.command(cli)

// --verbose, -v
.describe('verbose', 'Display every logs')
.boolean('verbose', false)
.alias('verbose', [ 'v' ])

// --file, -F
.describe('file', 'Precise a default file')
.string('file', 'wkno.js')
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

// --no-color
.describe('no-color', 'Remove colors')
.boolean('no-color', false)


if (process.platform == 'win32') {
  WKCmd

  // --bash
  .describe('bash', 'Execute command in bash environment')
  .boolean('bash', false)
}

// --help, -h
WKCmd.help()

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
    if (!tasks[tsk].description) return tsks.push( `wkno ${tsk}` )
    tsks.push( `wkno ${Print.green(pad(tsk, length + 5, ' ', false))} ${Print.grey('# '+tasks[tsk].description)}` )
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

function prepareExec(cmd, description) {
  return task(function(resolve, reject) {
    let exited = false
    let bash   = '/bin/sh'
    let args   = [ '-c', cmd ]

    if (process.platform === 'win32') {
      if (options.bash) {
        bash  = 'bash'
        args = [ '-c', cmd ]
      } else {
        bash = 'cmd'
        args = [ '/c', cmd ]
      }
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
        if (err instanceof Error) {
          return reject(err)
        }
        return reject(new Error(`code=${code}, signal=${signal}, err=${err || null}`))
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
  }, {}, { description: description })
}

// --no-color
if (options['no-color']) {
  Print.use_color = false
}

// --verbose, -v
if (options['verbose']) {
  Print.verbose()
}

// --file, -F
const tasks = {}
Object.assign(tasks, getFile( options.file ) || {})

const pkg = getFile( 'package.json' )
if (pkg) {
  for (const key in pkg.scripts) {
    if (key == 'wkno') continue
    tasks[key] = prepareExec(`npm run ${key}`, pkg.scripts[key])
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