var path = require("path");

module.exports = {
	entry: "./main.js",
	output: {
		path: path.resolve(__dirname, "../public/"),
		filename: "app.js"
	},
	module: {
		loaders: [
			{ test: /\.jsx?$/, exclude: path.join(__dirname, "node_modules"), loader: "babel" },
			{ test: /\.css$/, loader: "style!css" },
			// { test: /\.scss$/, loader: "style!css!sass?includePaths[]=" + encodeURIComponent(path.resolve(__dirname, "browser/lib/materialize-src/sass")) },
			{ test: /\.(svg|eot|woff2?|ttf|png|gif)$/, loader: "url?limit=1024" },
		]
	},
	devServer: {
		proxy: {
			"/": {
				target: "http://127.0.0.1:3000"
			},
			"/api*": {
				target: "http://127.0.0.1:3000"
			}
		}
	}
}
