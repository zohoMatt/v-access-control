const merge = require('webpack-merge');
const baseOptions = require('./webpack.base.config');

module.exports = merge(baseOptions, {
    mode: "development",
    watch: true,
    watchOptions: {
        poll: 3000
    }
});