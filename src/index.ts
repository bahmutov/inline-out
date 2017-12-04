import { InlineOutArguments, inlineOut, writeFiles } from './utils'

import * as debug from 'debug'
import * as minimist from 'minimist'

const log = debug('inline-out')

log('starting ...')

function extractScripts (cliArguments: string[]): void {
  const args = minimist(cliArguments, {
    string: 'file',
    alias: {
      file: 'f'
    }
  })
  log('CLI arguments')
  log(args)

  const inputArgs = (args as any) as InlineOutArguments
  inlineOut(inputArgs).then(writeFiles).catch(e => {
    console.error('Hit a problem 🔥')
    console.error(e)
    const url = 'https://github.com/bahmutov/inline-out/issues'
    console.error('See if there is a solution at:', url)
  })
}

extractScripts(process.argv.slice(2))
