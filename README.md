# Emaily App (Node with React Udemy Course @ Stephen Grider)

# Table of Contents

1. [Server Setup](#server-setup)
2. [Heroku Deployment](#heroku)
3. [Google OAuth](#google)
   1. [Passport Library](#passport)
   2. [Enable Google Auth](#enable-google)
   3. [Secure API keys](#secure-api)
   4. [Google Strategy](#google-strategy)
4. [MongoDB](#mongodb)

## 1 - Server Setup <a name="server-setup"></a>

### 1.1 - Init npm

Created server folder and initialized npm inside of it.

```
  npm init
```

### 1.2 - Generate Express App

```
  npm install --save express
```

### 1.3 - Require express and setup

Create index.js file in the project and add :

```js
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send({ hi: 'there' });
});

app.listen(5000);
```

## 2 - Heroku deployment <a name="heroku"></a>

### 2.1 - PORT listening in index.js

```js
const PORT = process.env.PORT || 5000;
app.listen(PORT);
```

### 2.2 - Specify Node and NPM version in package.json

```js
 "engines": {
    "node": "10.15.3",
    "npm": "6.9.0"
  },
```

### 2.3 - Specify the start script in package.json

```js
"start": "node index.js"
```

### 2.4 - Git init in your project and add + commit

```
git init
git add .
git commit -m "initial commit"
```

### 2.5 - Install Heroku CLI in the project after commited it

https://devcenter.heroku.com/articles/heroku-cli

### 2.6 - Login to Heroku account

On the terminal inside the project :

```
heroku login
```

### 2.7 - Create a new Heroku app

```
heroku create
```

### 2.8 - Push on GIT

Use the .git link provided in Heroku create command then :

```
git remote add heroku https://git.heroku.com/this-is-an-exemple.git
git push heroku master
```

### 2.9 - RE-Deploy

```
git add .
git commit -m "un nouveau commit"
git push heroku master
```

## 3 - Google OAuth <a name="google"></a>

### 3.1 - Passport Library <a name="passport"></a>

We use [passport library](http://www.passportjs.org/packages/) to handle a part of the Google OAuth flow <br>

- passport: General helpers for handling auth in Express apps
- passport strategy: helpers for authenticating with one specific method (email/password, Google, Facebook...)

#### 3.1.1 - Installation

```
npm install --save passport passport-google-oauth20
```

#### 3.1.2 - Setup in index.js

Require passport and passport strategy (for google oauth)

```js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
```

Create a new instance of GoogleStrategy

```js
passport.use(new GoogleStrategy());
```

### 3.2 - Enable Google OAuth API <a name="enable-google"></a>

#### 3.2.1 - Passport Google auth update

Since passport-google-oauth20 2.0 version we don't need to enable Google+ api in the [google developer console](http://console.developers.google.com)

```
  npm install passport-google-oauth20@2 --save
```

#### 3.2.2 - Create a new project in [google developer console](http://console.developers.google.com) and get OAuth credentials

- Create a new project
- Create new credentials (OAuth client ID)
- Config the application name at least
- Choose the type of App
- Add http://localhost:5000 as Authorized JavaScript origins
- Add http://localhost:5000/auth/google/callback as Authorized redirect URIs
- Then Create to get your Client ID and Client Secret

### 3.3 - Secure API keys <a name="secure-api"></a>

#### 3.3.1 - Config folder

- Create a config Folder and a keys.js file inside of it
- Then add your api keys like so in keys.js:

```js
module.exports = {
  googleClientID: 'yourClientId',
  googleClientSecret: 'yourClientSecret'
};
```

- Then add keys.js to .gitignore file

### 3.4 - Setup Google Strategy <a name="google-strategy"></a>

#### 3.4.1 - Add the API keys

- Get the keys from the config/key.js file :

```js
const keys = require('./config/keys');
```

- We pass the keys to the GoogleStrategy as arguements :

```js
passport.use(
  new GoogleStrategy({
  + clientID: keys.googleClientID,
  + clientSecret: keys.googleClientSecret
  })
);
```

#### 3.4.2 - Add a route handler

- We add the callback URL as a third property in GoogleStrategy :

```js
    passport.use(new GoogleStrategy({
    clientID: keys.googleClientID,
    clientSecret: keys.googleClientSecret,
  + callbackURL: '/auth/google/callback'
  }));
```

#### 3.4.3 - Add the accesToken arrow fx

- We pass an arrow fx as a second argument of GoogleStrategy :

```js
  passport.use(
    new GoogleStrategy(
      {
        clientID: keys.googleClientID,
        clientSecret: keys.googleClientSecret,
        callbackURL: '/auth/google/callback'
      },
  +   accesToken => {
  +     console.log(accessToken);
  +   }
    )
  );
```

## 4 - MongoDB <a name="mongodb"></a>
