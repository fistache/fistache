#!/usr/bin/env node

const program = require('commander')
const {defineCommands} = require('../util/command')
const {checkNodeVersion} = require('../util/node')

// Validate node version before we start.
checkNodeVersion()

/**
 * Define the commands.
 *
 * It will find all .js files in the "../commands" folder and execute
 * the function inside them.
 */
defineCommands(command => {
  command(program)
})

// Let the program know that all of the commands was defined.
program.parse(process.argv)
