# Emaily App (Node with React Udemy Course @ Stephen Grider)

## Table of Contents

1. [Server Setup](#server-setup)
2. [Heroku Deployment](#heroku)
3. [Google OAuth](#google)
   1. [Passport Library](#passport)
   2. [Enable Google Auth](#enable-google)
   3. [Secure API keys](#secure-api)
   4. [Google Strategy](#google-strategy)
   5. [OAuth Callbacks](#oauth-callbacks)
4. [Nodemon](#nodemon)
5. [Refacto Server Folder](#refacto-server)
6. [MongoDB Setup](#mongodb-setup)
7. [Create a mongoDB collection with mongoose Model Classes](#model-class)
8. [Create a new User in your database with the Google flow](#create-user)
9. [Mongoose Queries](#mongoose-queries)

## 1 - Server Setup <a name="server-setup"></a>

### 1.1 - Init npm

- Create a server folder and initialize npm inside of it :

```
  npm init
```

### 1.2 - Generate Express App

- Install express with npm :

```
  npm install --save express
```

### 1.3 - Require express and setup

- Create index.js file in the server folder and add :

```js
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send({ hi: 'there' });
});

app.listen(5000);
```

Here we require express in a const express that we pass into another const app and we create a route handler with app.get(). We also configure the app to run on the port 5000

## 2 - Heroku deployment <a name="heroku"></a>

### 2.1 - PORT listening in index.js

- config the PORT like so that it can run both on heroku or localhost:

```js
const PORT = process.env.PORT || 5000;
app.listen(PORT);
```

### 2.2 - Specify Node and NPM version in package.json

- in package.json right below "main" :

```js
 "engines": {
    "node": "10.15.3",
    "npm": "6.9.0"
  },
```

### 2.3 - Specify the start script in package.json

- in the scripts section of package.json :

```js
"start": "node index.js"
```
### 2.4 - Create an account on heroku <a name="https://www.heroku.com"></a>

### 2.5 - Git init in your project and add + commit

- Initial GIT to the project so we can push to heroku later :

```
git init
git add .
git commit -m "initial commit"
```

### 2.6 - Install Heroku CLI in the project after commited it

- Follow the steps in the link below :

https://devcenter.heroku.com/articles/heroku-cli

### 2.7 - Login to Heroku account

- On the terminal inside the project :

```
heroku login
```

### 2.8 - Create a new Heroku app

```
heroku create
```

### 2.9 - Push on GIT

- Use the .git link provided in Heroku create command then :

```
git remote add heroku https://git.heroku.com/this-is-an-exemple.git
git push heroku master
```

### 2.10 - RE-Deploy

- You only need to add, commit and push into the heroku master branch when you make changes :

```
git add .
git commit -m "another commit"
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

- Require passport and passport strategy (for google oauth) in index.js :

```js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
```

- Create a new instance of GoogleStrategy and delete the previous app.get() route handler that won't be necessary for our app :

```js
passport.use(new GoogleStrategy());
```

### 3.2 - Enable Google OAuth API <a name="enable-google"></a>

#### 3.2.1 - Passport Google auth update

- Since passport-google-oauth20 2.0 version we don't need to enable Google+ api in the [google developer console](http://console.developers.google.com) so make sure you run this command :

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
- Then add your api keys like so in keys.js :

```js
module.exports = {
  googleClientID: 'yourClientId',
  googleClientSecret: 'yourClientSecret'
};
```

- Then add keys.js to .gitignore file to not push it on github

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
+     clientID: keys.googleClientID,
+     clientSecret: keys.googleClientSecret
    })
  );
```

#### 3.4.2 - Add a callback URL to GoogleStrategy

- We add the callback URL as a third property of GoogleStrategy :

```js
    passport.use(
      new GoogleStrategy({
        clientID: keys.googleClientID,
        clientSecret: keys.googleClientSecret,
+       callbackURL: '/auth/google/callback'
    })
  );
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
+     accessToken => {
+      console.log(accessToken);
+    }
    )
  );
```
#### 3.4.4 - Add a route handler


- Add the code below to tell express to handle the path we want with passport :

```js
  app.get(
    '/auth/google',
    passport.authenticate('google', {
      scope: ['profile', 'email']
    })
  );
``` 
The scope specify to google what acces we want to have in the user's account (profile, email here)

#### 3.4.5 - Test if it works

- Start back your server with the command node index.js and go to http://localhost:5000/auth/google

### 3.5 - Handle OAuth Callbacks <a name="oauth-callbacks">

#### 3.5.1 - New route handler

- we create a second route handler in our index.js to handle AOuth callbacks when we click to authentificate with Google :

```js
  app.get('/auth/google/callback', passport.authenticate('google'));
```

#### 3.5.2 - Console log accesToken / refreshToken / profile / done

- Now update your arrow fx passing 3 other arguments and console.log the first 3 with the code below (crash and run back your server and go back to http://localhost:5000/auth/google to see the console logs in the terminal) :

```js
passport.use(
  new GoogleStrategy(
    {
      clientID: keys.googleClientID,
      clientSecret: keys.googleClientSecret,
      callbackURL: '/auth/google/callback'
    },
+   (accessToken, refreshToken, profile, done) => {
+     console.log('acces token', accessToken);
+     console.log('refresh token', refreshToken);
+     console.log('profile:', profile);
    }
  )
);
``` 

## 4 - Nodemon <a name="nodemon"></a>

### 4.1 - Install Nodemon to automatically restart our server

```
  npm install --save nodemon
``` 

### 4.2 - Setup nodemon

- In package.json we add the script below in the scripts section :

```js
  "dev": "nodemon index.js"
```

### 4.3 - Start the server with nodemon

- Just run the command below : 

```
 npm run dev
```  

## 5 - Refacto server folder <a name="refacto-server"></a>

### 5.1 - routes folder

- Create a new folder called routes inside the server folder and create a file authRoutes.js inside of it
- Cut & Paste the 2 routes handlers in the authRoutes.js file
- Add the passport require statement at the top like so :

```js
  const passport = require('passport');
``` 
- Export the routes handlers like so :
```js
+ module.exports = app => {
    app.get(
      '/auth/google',
      passport.authenticate('google', {
        scope: ['profile', 'email']
      })
    );

    app.get('/auth/google/callback', passport.authenticate('google'));
+ };
```  

### 5.2 - services folder

- Create a new folder called services inside the server folder and create a file passport.js inside of it
- Cut & Paste the passport configuration in the passport.js file
- Add the passport, GoogleStrategy and keys require statement at the top like so :

```js
  const passport = require('passport');
  const GoogleStrategy = require('passport-google-oauth20').Strategy;
  const keys = require('./config/keys');
```

### 5.3 - index.js file

- We don't need passport, GoogleStrategy and keys anymore so delete the require statements
- require the passport.js file like so :

```js
  require('./services/passport');
```   
- require authRoutes.js file and call it like so :

```js
  const app = express();

+ require('./routes/authRoutes')(app);
```  
## 6 - MongoDB Setup <a name="mongodb-setup"></a>

### 6.1 Steps to setup MongoDB account and Atlas cluster for the project

- Go to https://www.mongodb.com/cloud.atlas and click the "Start Free" button
- Create your account
- Leave all free tier options selected - AWS North America: N. Virginia etc (you can use europe location if it's closer).
- Scrool down to name your app (cluster name)
- Click the "Create Cluster" button and wait for installation to complete
- Click the "CONNECT" button and click "Add your current IP address" button
- Then create a database Username and Password (autogenerate recommanded, note the psw)
- Then click the "Choose a connextion method" button
- Select "Connect Your Application"
- Copy the adress under "Connection String Only", you'll need to replace ` <PASSWORD> ` with your database password created earlier
- Click the "Close" button and go back to your Emaily App
- Crash your server and install mongoose like so :

```
  npm install --save mongoose
```
- Require moongose in index.js file and connect it like so :

```js
  const express = require('express');
+ const mongoose = require('mongoose');
+ const keys = require('./config/keys');
  require('./services/passport');

+ mongoose.connect(keys.mongoURI, { useNewUrlParser: true });

  const app = express();

  require('./routes/authRoutes')(app);

  const PORT = process.env.PORT || 5000;
  app.listen(PORT);
``` 

- In config/keys.js file create the mongoURI key value pair like so :

```js
  module.exports = {
    googleClientID:
      'yourGoogleClientID',
    googleClientSecret: 'yourGoogleClientSecret',
+   mongoURI: 'pasteTheAdressYouCopiedFromStringOnlyWithThePassword'
  };
``` 

- That's it! Now you can run your server back 

## 7 - Create a mongoDB collection with mongoose Model Classes

### 7.1 - models folder

- Create a new folder called models in the server directory 
- Create an User.js file inside the models folder

### 7.2 - Create a mongoose model class in User.js

- first require mongoose and pull out mongoose's Schema property on top of the file 

```js
  const mongoose = require('mongoose');
  const { Schema } = mongoose;
```  

note : could be const Schema = mongoose.Schema but we use the ES2015 syntaxe

- Define the collection's properties with the Schema object and tell mongoose we want to create a new collection 'users' like so :

```js
  const userSchema = new Schema({
    googleId: String
  });

  mongoose.model('users', userSchema);
``` 

- Require the User.js file in index.js like so :

```js
  const express = require('express');
  const mongoose = require('mongoose');
  const keys = require('./config/keys');
+ require('./models/User');
  require('./services/passport');
``` 
note : the order matters, we want to call User Model before we define it with passport

- That's it! we now have a new collection called users =)

## 8 - Create a new User in your database with the Google flow <a name="create-user"></a>

### 8.1 - Get acces to the mongoose model inside the google flow

- Go in the passport.js file that contains the google flow 
- first require the mongoose library and get acces to the User Model Class like so :

```js 
  const passport = require('passport');
  const GoogleStrategy = require('passport-google-oauth20').Strategy;
+ const mongoose = require('mongoose');
  const keys = require('../config/keys');

+ const User = mongoose.model('users');
```
note : now the User const is the user model class

- Now we use the model class ton create a new instance of user and save it to the database (delete the 3 console.log in the GoogleStrategy) :

```js
  passport.use(
    new GoogleStrategy(
      {
        clientID: keys.googleClientID,
        clientSecret: keys.googleClientSecret,
        callbackURL: '/auth/google/callback'
      },
      (accessToken, refreshToken, profile, done) => {
+       new User({ googleId: profile.id }).save();
      }
    )
  );
``` 

- Now you can run back your server, go to http://localhost:5000/auth/google and then check your mongoDB database that you created in mongoDB Atlas Cluster and you'll find your user's collection with your Google's Id

## 9 - Mongoose Queries <a name="mongoose-queries"></a>

### 9.1 - Initiate query

- We initiate a query (a search) to find if we already have the user in the collection in the GoogleStrategy callback fx

```js 
passport.use(
  new GoogleStrategy(
    {
      clientID: keys.googleClientID,
      clientSecret: keys.googleClientSecret,
      callbackURL: '/auth/google/callback'
    },
    (accessToken, refreshToken, profile, done) => {
+     User.findOne({ googleId: profile.id })

      new User({ googleId: profile.id }).save();
    }
  )
);
``` 
- We make use of a promise to conditionnaly handle new user from existing users

```js
passport.use(
  new GoogleStrategy(
    {
      clientID: keys.googleClientID,
      clientSecret: keys.googleClientSecret,
      callbackURL: '/auth/google/callback'
    },
    (accessToken, refreshToken, profile, done) => {
      User.findOne({ googleId: profile.id })
+       .then((existingUser) => {
+         if (existingUser) {
+           // we already have a record with the given profile ID
+         } else {
            // we don't have a user record with the given ID, create a new one
+           new User({ googleId: profile.id }).save();
+         }
+       })
    }
  )
);
```

- That's it! now we handle existing users or new user in the database when we attempt to connect on our app

