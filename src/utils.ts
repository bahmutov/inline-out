'use strict'

import { normalize, dirname, sep } from 'path'
import * as is from 'check-more-types'
import * as debug from 'debug'
import * as fs from 'fs-extra'
import * as pluralize from 'pluralize'

const la = require('lazy-ass')
const catsup = require('catsup')
const replaceString = require('replace-string')
const stripIndent = require('strip-indent')
const R = require('ramda')

const log = debug('inline-out')

export interface InlineOutArguments {
  file: string
}

interface FileWithContents {
  filename: string
  contents: string
}

interface OutputContents {
  html: FileWithContents
  js: FileWithContents[]
}

function cleanupJS (source: string) {
  return stripIndent(source).trim()
}

function normalizeInput (options: InlineOutArguments) {
  la(is.unemptyString(options.file), 'Missing --file <html filename>')
  options.file = normalize(options.file)
  return options
}

function asOutputContents (catsupResult: any): OutputContents {
  return catsupResult as OutputContents
}

function printOutputFiles (x: OutputContents) {
  log('extracted %d JS %s', x.js.length, pluralize('script', x.js.length))
}

export function inlineOut (
  options: InlineOutArguments
): Promise<OutputContents> {
  options = normalizeInput(options)
  log('input file', options.file)

  const contentWithFilename = (contents: string) => {
    return {
      filename: options.file,
      contents
    }
  }

  return fs
    .readFile(options.file, 'utf-8')
    .then(contentWithFilename)
    .then(catsup)
    .then(asOutputContents)
    .then(R.tap(printOutputFiles))
    .then((result: OutputContents) => {
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

export function writeFiles (data: OutputContents): Promise<any> {
  return fs
    .writeFile(data.html.filename, data.html.contents)
    .then(() =>
      Promise.all(
        data.js.map(script => fs.writeFile(script.filename, script.contents))
      )
    )
}
