
// DEPENDENCIES // 
const express = require("express");
const path = require("path");
const colors = require("colors");
const app = express();
const helmet = require("helmet");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const passport = require("passport");

// HOT MODULE RELOADING //
if ( app.get("env") !== "production" ) {
	let webpack = require("webpack");
	let webpackDevMiddleware = require("webpack-dev-middleware");
	let webpackHotMiddleware = require("webpack-hot-middleware");
	
	console.log( colors.yellow("STARTING IN DEVELOPMENT") );
	let config = require("../webpack.config.js");
	
	let compiler = webpack(config);
	app.use(webpackDevMiddleware(compiler, {
	    noInfo: true, publicPath: config.output.publicPath,
	}));
	app.use(webpackHotMiddleware(compiler));
} else {
	console.log( colors.red("STARTING IN PRODUCTION") );
}

require("./config/passport.js")(passport);

// ROUTING //
//const distPath = path.join(__dirname, "../dist");
//const indexFileName = "index.html";

const distPath = path.join(__dirname, "../src");
const indexFileName = "index-template.html";


app.use(helmet());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(require("cookie-session")({
	name: "session",
	keys: ["mysecretkeyboardcat"],
	// Cookie Options
	maxAge: 7 * 24 * 60 * 60 * 1000, //1 week
}));
/*app.use(passport.initialize());
app.use(passport.session());


app.use(express.static(distPath));
require("./routes")(app, passport);*/


// START SERVER //
app.listen(process.env.PORT || 4001, function() {
	console.log( colors.green("Listening on port 4001") );
});