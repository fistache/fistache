#!/usr/bin/env node

const {manage} = require('@seafood-app/webpack-kit')
const path = require('path')

manage(path.resolve(__dirname, '..'))
