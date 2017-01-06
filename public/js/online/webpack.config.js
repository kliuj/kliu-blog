var webpack = require('webpack');
var path = require('path');
var glob = require('glob');
var _date = new Date();
function getEntry(globPath, pathDir) {
    var files = glob.sync(globPath);
    var entries = {},
        entry, dirname, basename, pathname, extname;

    for (var i = 0; i < files.length; i++) {
        entry = files[i];
        dirname = path.dirname(entry);
        extname = path.extname(entry);
        basename = path.basename(entry, extname);
        pathname = basename;
      //  pathname = pathDir ? pathname.replace(new RegExp('^' + pathDir), '') : pathname;
        entries[pathname] =  ['./' + entry];
    }
    return entries;
}
var entries = getEntry('src/*.js');
console.log(entries)
module.exports = {
  entry: entries,
  output: {
    path: path.join(__dirname, './dest'),
    filename: '[name].js?'+Date.now()
  },
  module: {
    loaders: [
      {test: /\.css$/, loader: 'style!css'},
      {
          test: /\.(html|tpl)$/,
          loader: 'html-loader'
      }
    ]
  },
  plugins: [
    new webpack.BannerPlugin('k.liu build at '+(_date.getMonth() + 1)+':'+_date.getDate()+':'+_date.getHours()+':'+_date.getMinutes()+':'+_date.getSeconds())
  ]
}
