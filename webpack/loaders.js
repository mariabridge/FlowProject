const production = process.env.NODE_ENV === "production";
const ExtractTextPlugin = require("extract-text-webpack-plugin");

if(production){
	exports.scss = {
		test: /\.scss/,
		use: ExtractTextPlugin.extract({
			fallback: "style-loader",
			use: [
				"css-loader",
				"sass-loader",
				"postcss-loader",
			],
		}),
	};
} else {
	exports.scss = {
		test: /\.scss/,
		use: [
			"style-loader",
			"css-loader",
			"sass-loader",
			"postcss-loader",
		],
	};
}


exports.js = {
	test: /.js?$/,
	exclude: /node_modules/,
  
	use: {
		loader: "babel-loader",
	},
};

exports.jquery = {
	test: /bootstrap-sass[\/\\]assets[\/\\]javascripts[\/\\]/, 
	loader: "imports-loader?jQuery=jquery",
};

exports.image = {
	test: /\.(png|jpg|jpeg|gif|svg)$/,
	loader: "url-loader?prefix=img/&limit=5000",
};

exports.font = {
	test: /\.(woff|woff2|ttf|eot)$/,
	loader: "url-loader?prefix=font/&limit=5000",
};
