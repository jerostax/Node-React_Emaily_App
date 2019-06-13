# Emaily App 
(Node with React Udemy Course @ Stephen Grider)

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
6. [MongoDB](#mongodb)
    1. [MongoDB Setup](#mongodb-setup)
    2. [Create a mongoDB collection with mongoose Model Classes](#model-class)
    3. [Create a new User in your database with the Google flow](#create-user)
    4. [Mongoose Queries](#mongoose-queries)
    5. [Generate Token for the user](#generate-token)
    6. [Test the authentification flow](#test-auth)
    7. [Handle Logout User](#logout)
  7. [Dev vs Prod environment](#dev-prod)
  8. [Client Side Setup](#client-setup)

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

## 6 - MongoDB <a name="mongodb"></a>

### 6.1 - MongoDB Setup <a name="mongodb-setup"></a>

#### 6.1.1 Steps to setup MongoDB account and Atlas cluster for the project

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

### 6.2 - Create a mongoDB collection with mongoose Model Classes

#### 6.2.1 - models folder

- Create a new folder called models in the server directory 
- Create an User.js file inside the models folder

#### 6.2.2 - Create a mongoose model class in User.js

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

### 6.3 - Create a new User in your database with the Google flow <a name="create-user"></a>

#### 8.3.1 - Get acces to the mongoose model inside the google flow

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

### 6.4 - Mongoose Queries  and Passport Callbacks <a name="mongoose-queries"></a>

#### 6.4.1 - Initiate query

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

- That's it! now we handle existing users from new user in the database when we attempt to connect on our app

#### 6.4.2 - Passport Callback

- We now need to say to passport when we're done with the authentification flow with done() :

```js 
  passport.use(
    new GoogleStrategy(
      {
        clientID: keys.googleClientID,
        clientSecret: keys.googleClientSecret,
        callbackURL: '/auth/google/callback'
      },
      (accessToken, refreshToken, profile, done) => {
        User.findOne({ googleId: profile.id }).then(existingUser => {
          if (existingUser) {
            // we already have a record with the given profile ID
+           done(null, existingUser);
          } else {
            // we don't have a user record with the given ID, create a new one
            new User({ googleId: profile.id })
              .save()
+             .then(user => done(null, user));
          }
        });
      }
    )
  );

```

note: first argument null = everything went fine, second argument the existingUser if the first case or the new user 'user' in the second case

### 6.5 - Generate a Token for the user <a name="generate-token"></a>

#### 6.5.1 - Use serializeUser to generate a token in the passport file

```js
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
``` 

note: we pass user.id as a second argument (which is not the profile.id but the id property in our user collection in mongoDB)

#### 6.5.2 - Use deserializeUser to find the user in the database

```js
  passport.deserializeUser((id, done) => {
    User.findById(id).then(user => {
      done(null, user);
    });
  });
``` 

#### 6.5.3 - Make sure passport is aware that we make use of cookies to keep track of the currently signed user

- First install the library cookie-session like so :

```
  npm install --save cookie-session
``` 

- Require cookie-session and passport library in index.js :

``` js
  const cookieSession = require('cookie-session');
  const passport = require('passport');
``` 

- Add the fonction app.use() to pass cookieSession and config it like so : 

```js
  app.use(
    cookieSession({
      maxAge: 30 * 24 * 60 * 60 * 1000,
      keys: [keys.cookieKey]
    })
  );
``` 

note : maxAge is the cookie expiration, 30 days (with days, hours, minuts, seconds, milliseconds), the keys property encrypt our cookie

- Create the cookieKey in the Keys.js file (you can call it the way you want) :

```js 
  module.exports = {
    googleClientID:
      'yourGoogleClientID',
    googleClientSecret: 'yourGoogleClientSecret',
    mongoURI:
      'yourMongoDbUri',
+   cookieKey: 'yourcookiekey'
  };
```

- Now we tell passport that it has to use cookies for authentification in index.js :

```js
  app.use(passport.initialize());
  app.use(passport.session());
```

### 6.6 - Test the authentification flow <a name="test-auth"></a>

- Create a new route handler in the authRoute file, we want the user as response : 

```js
  module.exports = app => {
    app.get(
      '/auth/google',
      passport.authenticate('google', {
        scope: ['profile', 'email']
      })
    );

    app.get('/auth/google/callback', passport.authenticate('google'));

+   app.get('/api/current_user', (req, res) => {
+     res.send(req.user);
+   });
  };
```

- Now you can run the identification process in your browser again (you'll probably get an error like Cannot GET auth/google/callback but that's fine) and go to http://localhost:5000/api/current_user, you should see your datas 

### 6.7 - Handle Logout User <a name="logout"></a>

- Create a new route handler to request logout() like so :

```js
  app.get('/api/logout', (req, res) => {
      req.logout();
      res.send(req.user);
    });
``` 

- You can now go to http://localhost:5000/api/logout to log out !

## 7 - Dev vs Prod environment <a name="dev-prod"></a>

- We are going to create another a seperate production database for Heroku on MongoDB and 2 sets of keys in the project. This is usefull for api keys security.

### 7.1 - Create another database on MongoDB Atlas & a second project in the Google dev console

- First Sign in to your MongoDB account
- Then go to "Context" and under it click on the "New Project" link
- Name your project (emaily-prod for exemple) and click the "Next" button then the "Create Project" one
- Now click he "Build a Cluster" button
- Leave the free tier options and click on "Create a CLuster"
- After the Cluster has been succesfuly created, click the "Connect" button
- Click "Add a Different IP Adress" button
- Enter 0.0.0.0/0 in the IP Adress field and click "Add IP Adress"

note: This part is extremely important as our Heroku server will not be able to connect to our database unless we whitelist all IP addresses. <br>
In a real production app you would typically have a static IP and a Fully Qualified Domain Name. In this case we would whitelist only the static IP. You can read up on this more here:

https://help.heroku.com/JS13Y78I/i-need-to-whitelist-heroku-dynos-what-are-ip-address-ranges-in-use-at-heroku

- Enter a new Username, generate a secure password and click "Create MongoDB User"
- Click the "Choose a Connection Method" then select "Connect Your Application"
- Copy the address under "Connection String Only" (remember you'll have to change the `<PASSWORD>` with the database user's actual password generated few steps ago), then click the "Close" button

- Now you can create a new project "emaily-prod" in the console.developers.google.com to generate a new Google OAuth ClientID and ClientSecret credential but this time you can fullfield the Configure consent screen better since it's gonna be our prod project. (Make sure you name the product "Emaily" and not "emaily-prod")

- Once you set the Configure consent screen, go back to your terminal, kill the server and type the command below to open your heroku address on your browser :

```
  heroku open
``` 

- Copy the address and paste it into the Authorized JavaScript field without the "/" in the end (make sure you allow this address in the Configure consent screen)
- then passed the same addresse into the Authorized redirect URIs with the route "/auth/google" the click the "Create" button

### 7.2 - Separate in 2 sets of keys 

- Create 2 new files dev.js and prod.js inside the Config file
- Dev mode : Cut & Paste the keys from the keys.js file inside of the new dev.js file (add the dev.js file to .gitignore and remove the keys.js file from it) 
- In the file keys.js we're going to define the logic to know which set of keys we use (prod or dev) like so :

```js
  if (process.env.NODE_ENV === 'production') {
    //we are in production - return the prod set of keys
    module.exports = require('./prod');
  }else {
    // we are in development - return the dev keys
    module.exports = require('./dev');
  }
```

- Prod mode: Copy & paste the code of the dev.js file into the prod.js file and replace the keys by Env variables like so :

```js
  module.exports = {
    googleClientID:  process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    mongoURI: process.env.MONGO_URI,
    cookieKey: process.env.COOKIE_KEY
  };
```

### 7.3 - Setup Env variable in Heroku

- Go to your Heroku dashboard and select your app
- Then click on the "settings" button
- Next to "Config var" click the "Reveal Config vars" 
- Now you setup all the Env variables for our App in the KEY and VALUE fields (add the key + value one by one, ex: GOOGLE_CLIENT_ID as key and yourGoogleClientKey as value, then click the "Add" button)
- You can now go back to your terminal and add/commit/push your project on the heroku git repo and go back to your browser to check if your heroku url app works
- You should have a redirect_uri_mismatch error when going to https://yourherokuurl.herokuapp.com/auth/google due to the "http" (and not https) redirection

### 7.4 - Fix the redirection issue

- We need to add another property to handle the callbackURL in the GoogleStrategy to handle on Heroku (by saying to GoogleStrategy that if our request runs through any proxy, trust the proxy and calculate the callback url) like so :

```js 
  passport.use(
    new GoogleStrategy(
      {
        clientID: keys.googleClientID,
        clientSecret: keys.googleClientSecret,
        callbackURL: '/auth/google/callback',
+       proxy: true
      },
      (accessToken, refreshToken, profile, done) => {
        User.findOne({ googleId: profile.id }).then(existingUser => {
          if (existingUser) {
            // we already have a record with the given profile ID
            done(null, existingUser);
          } else {
            // we don't have a user record with the given ID, create a new one
            new User({ googleId: profile.id })
              .save()
              .then(user => done(null, user));
          }
        });
      }
    )
  );
``` 

- You can now push the changes on Heroku GIT repo and go back to your browser to test it out, everything should be fine now!

## 8 - Client Side Setup <a name="client-setup"></a>

### 8.1 - Generate a React App

- Inside the server directory :

```
 create-react-app client
```

### 8.2 - Run the Server and Client at the same time

- in the server directory go to the package.json file
- In the script section, rename the actual dev command as "server" and add the 2 new command for the client and both server + client like so:

```js
  "scripts": {
      "start": "node index.js",
+-    "server": "nodemon index.js",
+     "client": "npm run start --prefix client",
+     "dev": "concurrently \"npm run server\" \"npm run client \""
    }
```

- Now we need to install concurrently in the terminal with the following command :

```
  npm install --save concurrently
``` 

- Now you can start back your App by running the command " npm run dev ", this will run both server and client =) !

### 8.3 - Routing Stumbling block 

- We need to find a way that our routes work both on the localhost and heroku server

- You need to do Quick setup to avoid Proxy errors with create-react-app 2.0 or higher

- Install the package below in the client directory :

```
  npm install http-proxy-middleware --save
```  

- Now create a setupProxy.js file inside the src directory and add the code below :

```js
  const proxy = require('http-proxy-middleware')
  
  module.exports = function(app) {
      app.use(proxy(['/api', '/auth/google'], { target: 'http://localhost:5000' }));
  }
``` 

- That should be ok to fix the proxy errors

- Also think to add another Authorized redirect UIRs in your emaily-dev google console project for the client side like so :

  http://localhost:3000/auth/google/callback





