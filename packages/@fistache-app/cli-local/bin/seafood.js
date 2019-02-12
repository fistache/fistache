#!/usr/bin/env node

const {manage} = require('@fistache-app/webpack-kit')
const path = require('path')

manage(path.resolve(__dirname, '..'))
