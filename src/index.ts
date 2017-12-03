'use strict'

import { join, dirname, sep } from 'path'
import * as debug from 'debug'
import * as minimist from 'minimist'
import * as fs from 'fs-extra'

const catsup = require('catsup')
const replaceString = require('replace-string')
const stripIndent = require('strip-indent')

const log = debug('inline-out')

log('starting ...')

const args = minimist(process.argv.slice(2), {
  string: 'file',
  alias: {
    file: 'f'
  }
})
log('CLI arguments')
log(args)

interface InlineOutArguments {
  file: string
}

const inputArgs = (args as any) as InlineOutArguments

interface FileWithContents {
  filename: string
  contents: string
}

interface OutputContents {
  html: FileWithContents
  js: FileWithContents[]
}

function cleanupJS(source: string) {
  return stripIndent(source).trim()
}

export function inlineOut(
  options: InlineOutArguments
): Promise<OutputContents> {
  return fs
    .readFile(options.file, 'utf-8')
    .then(contents => {
      return {
        filename: options.file,
        contents
      }
    })
    .then(catsup)
    .then((processed: any) => {
      const result: OutputContents = processed as OutputContents
      // remove full paths, including path separator
      const folder = dirname(result.html.filename) + sep
      result.html.contents = replaceString(result.html.contents, folder, '')

      // TODO can use Ramda evolve here
      result.js = result.js.map((js: FileWithContents) => {
        js.contents = cleanupJS(js.contents) + '\n'
        return js
      })

      return result
    })
}

export function writeFiles(data: OutputContents): Promise<any> {
  return fs
    .writeFile(data.html.filename, data.html.contents)
    .then(() =>
      Promise.all(
        data.js.map(script => fs.writeFile(script.filename, script.contents))
      )
    )
}

if (!module.parent) {
  const testIndex = join(__dirname, '..', 'test', 'index.html')
  inlineOut({ file: testIndex })
    .then(writeFiles)
    .then(() => {
      console.log('all done')
    }, console.error)
}
