#!/usr/bin/env node

const path = require('path')
const {manage} = require('@fistache/webpack-kit')

manage(__dirname, path.resolve(__dirname, '../../../common'))
