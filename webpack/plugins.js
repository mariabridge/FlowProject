const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const devmode = process.env.NODE_ENV !== "production";

const basePlugins = [
	new webpack.NoEmitOnErrorsPlugin(),
	new HtmlWebpackPlugin({
		template: "./src/index-template.html",
		hash: true,
		inject: "body",
	}),
	new ExtractTextPlugin({
		filename: "styles.css",
		ignoreOrder: true,
		disable: devmode,
	}),
	new CopyWebpackPlugin([
		{ from: "./src/assets", to: "./assets" },
	]),
];

const devPlugins = [
	new webpack.HotModuleReplacementPlugin(),  
	new webpack.DefinePlugin({
		"process.env": {
			"NODE_ENV": JSON.stringify("development"),
		},
	}),
];


const prodPlugins = [
	new webpack.LoaderOptionsPlugin({
		minimize: true,
		debug: false,
	}),
	new webpack.DefinePlugin({
		"process.env": {
			"NODE_ENV": JSON.stringify("production"),
		},
	}),

	new webpack.optimize.UglifyJsPlugin({
		beautify: false,
		mangle: {
			screw_ie8: true,
			keep_fnames: true,
		},
		compress: {
			screw_ie8: true,
			warnings: false,
		},
		comments: false,
	}),
];


module.exports = basePlugins
	.concat(process.env.NODE_ENV === "production" ? prodPlugins : [])
	.concat(process.env.NODE_ENV === "development" ? devPlugins : []);
