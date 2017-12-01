const path = require("path");


module.exports = function(app, passport) {
	const distPath = path.join(__dirname, "../dist");
	const indexFileName = "index.html";
	

	// =========================================================================
	// FACEBOOK ================================================================
	// =========================================================================
	app.get("/auth/facebook",
	  passport.authenticate("facebook"));

	app.get("/auth/facebook/callback", 
	  passport.authenticate("facebook", { failureRedirect: "/sign-in", failureFlash: true }),
	  function(req, res) {
	    res.redirect("/");
		}
	);

	// =========================================================================
	// GOOGLE ==================================================================
	// =========================================================================
	app.get("/auth/google",
		passport.authenticate("google", { scope: ["profile"] }));

	app.get("/auth/google/callback", 
		passport.authenticate("google", { failureRedirect: "/sign-in" }),
		function(req, res) {
			res.redirect("/");
		}
	);

	// =========================================================================
	// LinkedIn ================================================================
	// =========================================================================
	app.get("/auth/linkedin",
		passport.authenticate("linkedin"));
	
	app.get("/auth/linkedin/callback", passport.authenticate("linkedin", {
		successRedirect: "/",
		failureRedirect: "/",
	}));


	app.get("/auth/log-out", function(req, res) {
		req.logout();
		res.redirect("/");
	});

	app.get("/api/get/user", (req, res) => {
		res.send(req.user);
	});

	app.get("/*", (req, res) => {
		 res.sendFile(path.join(distPath, indexFileName));
	});
	
};
