// config/passport.js

// load all the things we need
let FacebookStrategy = require("passport-facebook").Strategy;
let GoogleStrategy = require("passport-google-oauth20").Strategy;
let LinkedInStrategy = require("passport-linkedin-oauth2").Strategy;
let LocalStrategy   = require('passport-local').Strategy;

// load the auth variables
let configAuth = require("./auth");

module.exports = function(passport) {

	// used to serialize the user for the session
	passport.serializeUser(function(user, done) {
		done(null, user);
	});

	// used to deserialize the user
	passport.deserializeUser(function(user, done) {
		done(null, user);
	});



	// =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================

	passport.use('local-signup', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
	},
	
    function(req, email, password, done) {
		process.nextTick(function() {
			let newUser = {};
			newUser.id    = req.result.id; // set the users facebook id                   
			newUser.token = ""; // we will save the token that facebook provides to the user                    
			newUser.first_name = req.result.u_firstname;
			newUser.last_name = req.result.u_surname;
			newUser.pic_url = "";

			return done(null, newUser);
        });

    }));




	// =========================================================================
	// FACEBOOK ================================================================
	// =========================================================================
	
	passport.use(new FacebookStrategy({

		// pull in our app id and secret from our auth.js file
		clientID: configAuth.facebookAuth.clientID,
		clientSecret: configAuth.facebookAuth.clientSecret,
		callbackURL: configAuth.facebookAuth.callbackURL,
		profileFields: ["id", "email", "name", "updated_time", "picture"],
		proxy: true,

	},

		// facebook will send back the token and profile
	function(token, refreshToken, profile, done) {
		
		// asynchronous
		process.nextTick(function() {
			let newUser = {};

			// set all of the facebook information in our user model
			newUser.id    = profile._json.id; // set the users facebook id                   
			newUser.token = token; // we will save the token that facebook provides to the user                    
			newUser.first_name = profile._json.first_name;
			newUser.last_name = profile._json.last_name;
			newUser.pic_url = profile._json.picture.data.url;
			return done(null, newUser);

			/*
			// find the user in the database based on their facebook id
			User.findOne({ "facebook.id": profile.id }, function(err, user) {

				// if there is an error, stop everything and return that
				// ie an error connecting to the database
				if (err){
					return done(err);
				}

				// if the user is found, then log them in
				if (user) {
					return done(null, user); // user found, return that user
				} 
				// if there is no user found with that facebook id, create them
				console.log(profile._json);

				let newUser = new User();

				// set all of the facebook information in our user model
				newUser.facebook.id    = profile._json.id; // set the users facebook id                   
				newUser.facebook.token = token; // we will save the token that facebook provides to the user                    
				newUser.facebook.first_name = profile._json.first_name;
				newUser.facebook.last_name = profile._json.last_name;
				newUser.facebook.pic_url = profile._json.picture.data.url;

				// save our user to the database
				newUser.save(function(err) {
					if (err) {
						throw err;
					}

					// if successful, return the new user
					return done(null, newUser);
				});
                
				
			});
			*/
		});

	}));

	// =========================================================================
	// GOOGLE ==================================================================
	// =========================================================================
	passport.use(new GoogleStrategy({

		// pull in our app id and secret from our auth.js file
		clientID: configAuth.googleAuth.clientID,
		clientSecret: configAuth.googleAuth.clientSecret,
		callbackURL: configAuth.googleAuth.callbackURL,
		proxy: true,
	},

		// facebook will send back the token and profile
	function(accessToken, refreshToken, profile, done) {

		process.nextTick(function() {
			let newUser = {};
			newUser.id    = profile._json.id; // set the users facebook id                   
			newUser.first_name = profile._json.name.givenName;
			newUser.last_name = profile._json.name.familyName;
			newUser.pic_url = profile._json.image.url;

			return done(null, newUser);
		});
	}));
	// =========================================================================
	// LinkedIn ================================================================
	// =========================================================================
	passport.use(new LinkedInStrategy({
		clientID: configAuth.linkedInAuth.clientID,
		clientSecret: configAuth.linkedInAuth.clientSecret,
		callbackURL: configAuth.linkedInAuth.callbackURL,
		scope: ["r_emailaddress", "r_basicprofile"],
		state: true,
		proxy: true,
	}, function(accessToken, refreshToken, profile, done) {

		console.log(profile);

		process.nextTick(function() {
			let newUser = {};

			// set all of the facebook information in our user model
			newUser.id    = profile._json.id;
			newUser.first_name = profile._json.firstName;
			newUser.last_name = profile._json.lastName;
			newUser.pic_url = profile._json.pictureUrl;
			
			return done(null, newUser);
		});
	}));

};
