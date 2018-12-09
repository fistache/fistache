#!/usr/bin/env node

const {manage} = require('@seafood/project-manager')
const path = require('path')

manage(path.resolve(__dirname, '..'))
