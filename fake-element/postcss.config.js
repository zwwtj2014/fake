module.exports = {
  plugins: {
    'postcss-salad': {
      browsers: ['ie > 8', 'last 2 versions'],
      features: {
        bem: {
          shortcuts: {
            component: 'b', // block
            modifier: 'm', // 和BEM一样
            descendent: 'e' // element
          },
          spearators: {
            descendent: '__',
            modifier: '--'
          }
        }
      }
    }
  }
};
