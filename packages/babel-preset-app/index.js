module.exports = () => {
  return {
    presets: [
      [
        '@babel/preset-env', { useBuiltIns: 'entry' }
      ],
    ]
  }
}
