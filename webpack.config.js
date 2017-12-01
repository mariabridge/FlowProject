const devmode = process.env.NODE_ENV !== "production";


const path = require("path");
const plugins = require("./webpack/plugins");
// const postcss = require('./webpack/postcss');
const loaders = require("./webpack/loaders");

function getEntrySources(sources) {
	if (devmode) {
		sources.push("webpack-hot-middleware/client");
	}

	return sources;
}

module.exports = {
	entry: getEntrySources(["./src/entry.js", "bootstrap-loader"]),
	devtool: !devmode ? "source-map" : "inline-source-map",

	output: {
		path: path.join(__dirname, "dist"),
		filename: "bundle.js",
		publicPath: "/",
		sourceMapFilename: "[name].[hash].js.map",
		chunkFilename: "[id].chunk.js",
	},

	plugins: plugins,

	module: {
		// preLoaders: [
		//   loaders.eslint,
		// ],
		loaders: [
			loaders.scss,
			loaders.js,
			loaders.image,
			loaders.font,
			loaders.jquery,
		],
	},

	devServer: {
		contentBase: path.join(__dirname, "dist"),
		compress: true,
		port: 4000,
		historyApiFallback: true,
		stats: "errors-only",

	},

	// postcss: postcss

	externals: {
		"react/lib/ReactContext": "window",
		"react/lib/ExecutionEnvironment": "window",
		"react/addons": true,
	},
};
