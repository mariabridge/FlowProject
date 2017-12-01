# Entiros FlowProject

![Entiros logo](http://www.entiros.se/sites/default/files/entiros_logo_4f_square.png "Entiros logo")

## [Wiki](https://github.com/adamsdm/FlowChart-mockup/wiki)


## About 

## Installation
Make sure that `npm` and `node` is installed on your computer.

1. `git clone https://github.com/adamsdm/FlowChart-mockup.git`
2. Install dependencies with:
  * `npm install`
3. To start the server in development (start up a development server with HMR): 
  * `npm run dev`
4. For production, build the project with the command `npm run build`
5. Start the server with `npm run start`

## Setup OAuth

The authentication Keys/Secrets are stored in a config file in the directory `server/config/auth` and the server uses [Passport.js](http://passportjs.org/) to authenticate users.

### Facebook
1. Create an app at [Facebook development](https://developers.facebook.com/)
2. Save the given key/secret in the config file.
3. Add `http://localhost:3000/auth/facebook/callback` and `http://www.mysite.com/auth/facebook/callback`
to the field Valid OAuth redirect URIs

### Google
1. Create an app at [Google developer console](https://console.developers.google.com/)
2. Save the given key/secret in the config file.
3. Add `http://localhost:3000/auth/google/callback` and `http://www.mysite.com/auth/google/callback`
to the field Valid OAuth redirect URIs
4. Enable the Google+ API under `Library -> Google+ API`

### LinkedIn
1. Create an app at [LinkedIn developer](https://www.linkedin.com/developer/apps)
2. Save the given key/secret in the config file.
3. Add `http://localhost:3000/auth/linkedIn/callback` and `http://www.mysite.com/auth/linkedIn/callback`
to the field Valid OAuth redirect URIs


## Core technologies

* NodeJS
* Express
* Webpack
* Babel/ES6
* React
* Redux
* SASS
* mxGraph
* lodash
