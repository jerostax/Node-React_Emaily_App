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
9. [Dev the Client Side](#dev-client)
    1. [Refacto with Async Await](#async-await)
    2. [React Setup](#react-setup)
    3. [Redux Setup](#redux-setup)
    4. [React Router Setup](#router-setup)
    5. [Design](#design)
    6. [Current User API](#user-api)
10. [Handling Payments with Stripe](#payments)
  

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

- Also think to add another Authorized redirect URIs in your emaily-dev google console project for the client side like so :

  http://localhost:3000/auth/google/callback


## 9 - Dev the Client Side <a name="dev-client"></a>

- First we're gonna do a little refacto in the back-end then setup/dev Client Side with React

### 9.1 - Refacto the promises with the async await syntaxe <a name="async-await">

- Check async-await.js file in the additional-doc folder to know more about it
- We refacto the GoogleStrategy promise in the passport.js file like so :

```js
  passport.use(
    new GoogleStrategy(
      {
        clientID: keys.googleClientID,
        clientSecret: keys.googleClientSecret,
        callbackURL: '/auth/google/callback',
        proxy: true
      },
+-    async (accessToken, refreshToken, profile, done) => {
+-      const existingUser = await User.findOne({ googleId: profile.id });
        if (existingUser) {
          // we already have a record with the given profile ID
+-        return done(null, existingUser);
        }
        // we don't have a user record with the given ID, create a new one
+-      const user = await new User({ googleId: profile.id }).save();
+-      done(null, user);
      }
    )
  );

``` 

note: We also refacto a little bit the if statement by adding a return key word that will automatically stop the instruction if it's called so we don't need the else statement anymore =)


### 9.2 - React Setup <a name="setup-react"></a>

- Let's now install some dependencies such as redux and react-router like so :

``` 
  npm install --save redux react-redux react-router-dom
``` 

- Now we setup our src folder pattern by deleting all the files inside of it exept the setupProxy.js and the serviceWorker.js and create a new index.js file with the code below :

```js 
import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';

ReactDOM.render(<App />, document.querySelector('#root'));
```  

note: here we import React, ReactDOM and the App component that we're going to create, then we render the App component inside the div with the id "root" in the index.html file which is in the public directory.

- Now it's time to create our components folder where we will have all of our components inside the src directory, then create the App.js file inside of it and code it as a simple functionnal component for now like so :

```js
import React from 'react';

const App = () => {
  return <div>App</div>;
};

export default App;
```  

note: we can create functionnal or class based components, in both cases we will import react and export the component, also the code below the return statement is what the component will show on the screen.

### 9.3 - Redux Setup <a name="redux-setup"></a>

We are going to use reducers to record whether or not the user is logged in and a list of all surveys that the user has created

#### 9.3.1 - How does Redux works :

Redux Store : This is where all of our state exists <br>

To determine our current state or to update it we call an action creator which dispatches an action. <br>

The action is sent to all the different reducers (the reducers are combined together with **combineReducers** call that is use to update the state in our Redux Store)

- In the end we can see it that way : <br>

A React component calls an **Action Creator** that returns an **Action** that will be sent to the **Reducers** which will update the **State** inside of our **Redux Store**. In the end the updated **State** will be sent back to the component that will rerender and display new content on the screen.

#### 9.3.2 - How to setup Redux

- Inside of our index.js file we will create our Redux Store and render a Provider tag
- The Provider tag is a React component provided to us by the react-redux library that makes the store accessible to every component in the app

Let's code this !

- First we import de Provider tag and the createStore, applyMiddleware helpers like so :

```js 
  import { Provider } from 'react-redux';
  import { createStore, applyMiddleware } from 'redux';
``` 

- Now it's time to create the store like so :

```js
  const store = createStore(() => [], {}, applyMiddleware());
```

note : The first argument is our reducers (for now we create a useless reducer to not leave it empty), the second argument is the initial state of our Application (not really usefull for our app so for now we pass an empty object), finally the third argument is the applyMiddleware call.

- Now we need to wrap the App component with the Provider tag like so :

```js
  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.querySelector('#root')
  );
```  

note : We pass the store as a prop inside the Provider tag

- Now let's create our Auth Reducer, first for the sake of our src folder pattern, we're going to create a reducers folder inside of it. In the reducers folder we now create an authReducer.js file and index.js file 

- Inside the authReducer.js file we're going to create our reducer and export it like so :

```js
export default function(state = {}, action) {
  switch (action.type) {
    default:
      return state;
  }
}
``` 

note: The first argument is the State object that is responsable for this reducer and the second argument is the Action object, then we define the switch statement where we will define the differents cases (as default case, we return the state with no changes)

- Now let's go to our index.js file inside the reducers directory to import our brand new reducer :

```js
import { combineReducers } from 'redux';
import authReducer from './authReducer';

export default combineReducers({
  auth: authReducer
});
``` 

note: We import the combineReducers where we will call all our different reducers that we will pass a value of a key that we define like auth (key) : authReducer (value)

- Last but not least, we now need to import the combineReducers in our main index.js file and pass it as the first argument of our store :

```js
+  import reducers from './reducers'

+- const store = createStore(reducers, {}, applyMiddleware());
```

### - 9.4 React Router Setup <a name="router-setup"></a>

- We're gonna use React Router to render different contents based on the route that the user is visiting

- All the configuration is gonna be in the App.js file so we first need to import react-router-dom inside of it :

```js
  import { BrowserRouter, Route } from 'react-router-dom';
``` 

note: The BrowserRouter object is what tells react how to behave by looking at the current URL and change the set of components visible on the screen. The Route object is a React Component that is used to setup a rule between a route that the user can visite and a set of component that will be visible on the screen.

- Now e're going to create 4 dummy components (Header, Dashboard, SurveyNew, Landing) that will be replace later with our real components to setup React-router in the App.js file :

```js
  const Header = () => <h2>Header</h2>
  const Dashboard = () => <h2>Dashboard</h2>
  const SurveyNew = () => <h2>SurveyNew</h2>
  const Landing = () => <h2>Landing</h2>
```  

- Let's now use BrowserRouter and Router inside of the App.js return statement (clean the "App" text before) and define our first route for the landing component :

```js
  const App = () => {
    return (
      <div>
+       <BrowserRouter>
+       <div>
+         <Route  path="/" component={Landing} />
+       </div>
+       </BrowserRouter>
+     </div>
    );
  };
```

note : We define all the possibles routes with the Route object. The BrowserObject accept only 1 child component at most so make sure you wrapp your components inside of a single div tag

- Now time to setup the others routes :

```js
  <BrowserRouter>
    <div>
+     <Header />
+-    <Route exact path="/" component={Landing} />
+     <Route exact path="/surveys" component={Dashboard} />
+     <Route path="/surveys/new" component={SurveyNew} />
    </div>
  </BrowserRouter>
```

note: We pass the keyword "exact" (could have write exact={true} but here we use the JSX syntaxe that assumes exact is true) to the "Landing" route to say that it only renders on the "/" route, otherwise it would render on every routes since they all start with a "/" (same operation for the Dashboard component that we only want to render in the /"surveys" route and not on the "/surveys/new" route). Also we want the Header on every routes so we cant juste call the component by itself on top of the routes !

### 9.5 - Design <a name="design"></a>

- Time to add some CSS/Design to our App, I'm not gonna cover in great details assuming you already now CSS.

#### 9.5.1 - Materialize CSS

- We are going to use the [Materialize CSS library](https://materializecss.com/getting-started.html), in my case i'm gonna use the npm package but you can definetely only use the CDN link tag :

```
  npm install --save materialize-css
``` 

- To use it we simply have to do an import statement in the index.js file with the good path like so (check the path in the .node_module file) :

```js
  import 'materialize-css/dist/css/materialize.min.css';
```

note: we don't specify a relative path because webpack is gonna automatically assume that it's a npm package of our node_modules directory that way

#### 9.5.2 - User

- Let's now make our Header Component as a class based component in the components directory and import it in the App.js file to replace the dummy Header component that we did before and design it with some Materialize CSS classes like so :

```js
  class Header extends React.Component {
    render() {
      return (
        <nav>
          <div className='nav-wrapper'>
            <a className='left brand-logo'>Emaily</a>
            <ul className='right'>
              <li>
                <a>Sign Up With Google</a>
              </li>
            </ul>
          </div>
        </nav>
      );
    }
  }
``` 

### 9.6 - Current User API <a name="user-api"></a>

- We now need to figure out whether or not the user is logged in  to render the appropriate buttons in the Header
- On the server side, in the routes file, we're gonna use the "/api/current_user" route to decide if wheter or not the user is connected by doing an Ajax request

- The React App boots up -> App component calls an **action creator** (redux) -> this action Creator will make an **API request** (with the **axios** library to do the Ajax request to the "/api/current_user" route) to the back-end to ask whether or not the current user is logged in -> then we're going to get a response back presumably containing the user if he's logged in -> with that response we're gonna use another library **redux-thunk** to dispatch an action off to all the different **reducers** of our app -> the action which contains whether or not the user is logged in is then send to the **authReducer** -> the authReducer will be then responsable for looking at that action and update the state to say whether or not the user is logged in -> then with the updated state we're gonna update the content inside our Header by setting up the Header to communicate with our **Redux Store**.

- First we install the axios and redux-thunk library :

``` 
  npm install --save axios redux-thunk
``` 

- Now import the redux-thunk and hook it up to the createStore as a middleware :

```js
+  import reduxThunk from 'redux-thunk';

+- const store = createStore(reducers, {}, applyMiddleware(reduxThunk));
``` 

- Now let's make the Action Creator, first create a new folder named "actions" inside the src directory (where we will code all of our actions creators)
- Now create an index.js file inside of the actions folder where we're gonna code our first action creator even if we will refacto it later :

```js 
  import axios from 'axios';
  import { FETCH_USER } from './types';

  export const fetchUser = () => {
    axios.get('/api/current_user');
  };
``` 

note: we first import the axios library to handle the Ajax request and the FETCH_USER action type (we will create the action types right after in a seperate file). Then we define our action creator (fetchUser) and inside we do our Ajax request using axios to get the "/api/current_user" route

- We define our action types in another file in the actions folder, name it types.js :

```js
  export const FETCH_USER = 'fetch_user';
```

- Redux-Thunk : Gives us direct access to the dispatch function to manually dispatch an anction at point in time from an action creator
- Now let's complete our action creator (we will refacto later) :

```js
  export const fetchUser = () => {
+   return function(dispatch) {
      axios
        .get('/api/current_user')
+       .then(res => dispatch({ type: FETCH_USER, payload: res }));
+   };
  };
``` 

note: Here we now return a function, thanks to the Redux Thunk middleware, it's gonna inspect whatever value is inside the action creator and if it sees that we return a function instead of a normal action it's gonna automatically call the function pass the dispatch function as an argument to it. In the end we say that we want to dispatch a function after the request has been succesfully completed (when we have the response from the API).

- Now we want to add this action creator to our App component to make sure that when our app boot up we fetch the current user
- For that we need to refacto the App component as a class based component that we can make use of the lifecycle method for the action creator to be automatically called when the app renders to the screen :

```js
+-class App extends React.Component {
+   componentDidMount() {
+      
+   }
+   render() {
      return (
        <div className='container'>
          <BrowserRouter>
            <div>
              <Header />
              <Route exact path='/' component={Landing} />
              <Route exact path='/surveys' component={Dashboard} />
              <Route path='/surveys/new' component={SurveyNew} />
            </div>
          </BrowserRouter>
        </div>
      );
+   }
  }
``` 

note: we use the componentDidMount() lifecycle method to fetch the current user

- Now we're going to hook up our App component to our redux store with the connect helper function
- We first import the connect helper from the react-redux library then we import our actions creators like so :

```js
  import { connect } from 'react-redux';
  import * as actions from '../actions';
``` 

- Let's now add the connect function to the export default of our App component :

```js
  export default connect(
    null,
    actions
  )(App);
```
note : The first argument is the mapStateToProps function (but we don't use it so we pass null), in the second argument we pass all the actions creators that we want to wire up

- Now the actions creators are props of the App component so let's call them in the componentDidMount() lifecycle method :

```js
  componentDidMount() {
+     this.props.fetchUser();
    }
``` 
- Now we need to make sure it works by adding a console log in the authReducer like so:

```js
  export default function(state = {}, action) {
+   console.log(action);
    switch (action.type) {
      default:
        return state;
    }
  }
``` 

note : Refresh the browser, you should see 4 console logs. The first 3 are part of the redux boot up process, so we only care about the 4th one which tell us wheter or not the user is logged in. The payload Object is the axios response object with all the different properties. The data property communicates back the actual json that the server sent to us. We now know that redux-thunk works correcty (we made the request to our back end server and after it was completed we dispatched an action which was sent to all of our reducers).

- Now that it's working correctly, let's refacto the fetchUser action creator with the async/await syntaxe and arrow fx instead of function keyword :

```js
+-export const fetchUser = () => async dispatch => {
+-  const res = await axios.get('/api/current_user');
+-  dispatch({ type: FETCH_USER, payload: res.data });
+-};
``` 

- Now we need to make sure that our action gets picked up inside of our authReducer, just before we're gonna do a little change to our response because we only want the data property :

```js
  export const fetchUser = () => async dispatch => {
    const res = await axios.get('/api/current_user');
+   dispatch({ type: FETCH_USER, payload: res.data });
  };
```

- Now we need to import the fetchUser action type to our authReducer and set another switch case statement :

```js
+-export default function(state = null, action) {
    switch (action.type) {
+     case FETCH_USER:
+       return action.payload || false;
      default:
        return state;
    }
  }
```

note: "null" => we don't know yet if the user is logged in or not / "User model" (actually the data property which is the payload object, yes the user is logged in) => object with the user's id
 / "false" => no, the user isn't logged in

- Time to make sure that the Header component is aware of whether or not the user is logged in using the auth state
- First we connect the Header to the reducers like we did before then we define our mapStateToProps function which contains the entire state object out of the redux store :

```js
+ import { connect } from 'react-redux';

+ function mapStateToProps({ auth }) {
+   return { auth };
+ }

+-export default connect(mapStateToProps)(Header);
``` 

note: we use the ES6 syntaxe but the mapStateToProps could be like that :

```js
function mapStateToProps(state) {
  return { auth: state.auth };
}
``` 
- Now we need to use the auth property to decide what content to show on the Header
- Let's create a helper method that we call renderContent with a switch statement to render the appropriate content if we're logged in or not (don't forget to replace the actual li tag that has the "Sign Up With Google" with the `{this.renderContent()}`method) :

```js
  renderContent() {
      switch (this.props.auth) {
        case null:
          return;
        case false:
          return (
            <li>
              <a href='/auth/google'>Sign Up With Google</a>
            </li>
          );
        default:
          return (
            <li>
              <a>Logout</a>
            </li>
          );
      }
    }
```

- Now we have to handle the redirection after we logged in 
- First let's go back to our server's authRoutes.js file and add some redirection to the auth/google/callback route :

```js
  app.get(
      '/auth/google/callback',
      passport.authenticate('google'),
+     (req, res) => {
+       res.redirect('/surveys');
+     }
    );
```

note: We add an arrow fx which is where the request is sent to after the passport authenticate middleware is executed

- Let's now handle the logout redirection, remember we need to unset the cookie to logout
- First add the href to the logout "a" tag inside the header to go on the route "/api/logout" and then we just have to redirect the user to the "/" landing page in the authRoute.js file like so (don't forget to delete the res.send reponse that is useless since it's empty) :

```js
  app.get('/api/logout', (req, res) => {
      req.logout();
+-    res.redirect('/');
    });
```

- Now we can create our Landing component instead of the dummy one that we created in the App.js file
- Here you can do a simple functionnal component and some title such as "Emaily" in a h1 tag and whatever you want to say in this "marketing" page
- Also don't forget to import your new Landing component in the App.js and delete the dummy one

- Now let's take care of the links tag inside of the app with the React Router Link tag
- First import the Link component in the Header component and change the "a" tag arround the Emaily text with a Link tag that conditionaly navigates to the "/surveys" route if we're logged in or the "/" homepage route if we're logged out :

```js
import { Link } from 'react-router-dom';

<Link
  to={this.props.auth ? '/surveys' : '/'}
  className='left brand-logo'
>
    Emaily
</Link>
```

## 10 - Handling Payments with Stripe <a name="payments"></a>

- We're gonna use the billing company Stripe

### 10.1 - Stripe API

- First you need to Sign Up to [Stripe](https://www.stripe.com)
- Once you're done, stay with the test mode and go to "Get your test API keys"
- Now we need to install the Stripe pluging that we're going to use to accept credit cards with a credit card form but we're gonna use [react-stripe-react](https://github.com/azmenak/react-stripe-checkout) instead of the stripe's checkout.js library and install with a npm package in the client directory :

```
  npm install --save react-stripe-checkout
``` 

- Let's now put the publishable key and secret key on our client and server side.

#### 10.1.1 - Server side

- First copy the publishable key and the secret key, then add it to your dev.js like :

```js
  module.exports = {
    googleClientID:
      'yourkey',
    googleClientSecret: 'yourkey',
    mongoURI:
      'yourkey',
    cookieKey: 'yourkey',
+   stripePublishableKey: 'yourkey',
+   stripeSecretKey: 'yourkey'
  };
```
- Now let's add they key for the prod.js file like so:

```js
module.exports = {
    googleClientID:  process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    mongoURI: process.env.MONGO_URI,
    cookieKey: process.env.COOKIE_KEY,
+   stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
+   stripeSecretKey: process.env.STRIPE_SECRET_KEY
  };
``` 

- Now let's set up in the heroku environement, go to your heroku dashbord and add the 2 new variables for the 2 keys

#### 10.1.2 - Client side

- Inside the client directory create those 2 new files : .env.development and .env/production

- Now add the publishable key in both files like so :

```
REACT_APP_STRIPE_KEY=yourpublishablekey
``` 
note: don't wrapp the key with quotes here

### 10.2 - Payment Component

- Let's now create our payment component that will be accessible with the 'Add Credit' button in the header
- First create a new component called Payments.js and make it a class based component like so :

```js
  import React from 'react';
  import StripeCheckout from 'react-stripe-checkout';

  class Payments extends React.Component {
    render() {
      return <StripeCheckout />;
    }
  }
  export default Payments;
``` 
note: we import Stripe Checkout and return it but we need to add some config now

- Now we need to add a few required properties to our StripeCheckout compo :

```js
  <StripeCheckout
    amount={500}
    token={token => console.log(token)}
    stripeKey={process.env.REACT_APP_STRIPE_KEY}
  />
``` 
note: the prop amount is the amount of money that we want to request from the user (the amount is in dollar and cents, so 500 cents = 5 dollars, we could chose another currency). The token prop is the call back token provided by stripe that represent the transaction

- Now just import the Payments compo in the Header one and show it in the header in the case that the user is logged in :

 ```js
+- return [
+           <li>
+             <Payments />
+           </li>,
            <li>
              <a href='/api/logout'>Logout</a>
            </li>
          ];
 ```

- Now we can fix the console log warning by adding a key prop to our li tags like so :

```js
  [
+-  <li key="1">
      <Payments />
    </li>,
+-  <li key="2">
      <a href='/api/logout'>Logout</a>
    </li>
  ];
```

- And custom our payment window like so :

```js
  <StripeCheckout
+   name='Emaily'
+   description='$5 for 5 email credits'
    amount={500}
    token={token => console.log(token)}
    stripeKey={process.env.REACT_APP_STRIPE_KEY}
  />
```

- Now we want to style the button and we can do that by adding a button as a child component of the StripeCheckout compo.

### 10.3 - Send stripe Token to our API

- First let's create a new action creator handleToken, let's st rt with the actions/index.js file :

```js
  export const handleToken = token => async dispatch => {
    const res = await axios.post('/api/stripe', token);

    dispatch({ type: FETCH_USER, payload: res.data });
  };
```
note: Here we want to do a post request to the backend server because we want to send the information to it (we havent define the route handler yet but it's gonna be /api/stripe)

- Now let's make sure it get called whenever we got a token from the stripe checkout form. In the Payments.js component, import connect and all the actions, then wire up the connect helper and finaly update the token arrow fx to call our action creator :

```js
+ import { connect } from 'react-redux';
+ import * as actions from '../actions';

  class Payments extends React.Component {
    render() {
      return (
        <StripeCheckout
          name='Emaily'
          description='$5 for 5 email credits'
          amount={500}
+-        token={token => this.props.handleToken(token)}
          stripeKey={process.env.REACT_APP_STRIPE_KEY}
        >
          <button className='btn'>Add Credits</button>
        </StripeCheckout>
      );
    }
  }
+-export default connect(
+   null,
+   actions
+ )(Payments);
```

- Now we need to create the route handler in the routes directory to receive the token (we will do that in a new file billingRoutes.js) :

```js
  module.exports = app => {
    app.post('/api/stripe', (req, res) => {
      
    });
  };
```

- Don't forget to require the file in the index.js file of your server :

```js
  require('./routes/authRoutes')(app);
+ require('./routes/billingRoutes')(app);
``` 

- Now we're going to install an npm module that we use for our server side to help work with the Stripe API :

```
  npm install --save stripe
``` 

- Let's now import stripe in the billingRoutes.js file and the Stripe Secret key :

```js
  const keys = require('../config/keys');
  const stripe = require('stripe')(keys.stripeSecretKey);
``` 
note: we pass the key as a second set of parentheses like the stripe's document ask so

- Now we have an issue because express doesn't parse the request payload that contains the stripe token, to solve that issue we can install another npm modul in the server directory that will tell express to parse the request body and make it available to everything inside of our app (the modul is body-parser) :

```
  npm install --save bnody-parser
```  

- Now let's require that modul in the index.js file and use it :

```js
  const bodyParser = require('body-parser');

  app.use(bodyParser.json());
``` 

note: app.use(bodyParser.json()) above all first app.use that we coded before

- Let's create a [charge object](https://stripe.com/docs/api/charges/create) to credit and bill the credit card in the billingRoutes.js file :

```js
  module.exports = app => {
    app.post('/api/stripe', (req, res) => {
+     stripe.charges.create({
+       amount: 500,
+       currency: 'usd',
+       description: '$5 for 5 credits',
+       source: req.body.id
+     })
    });
  };
``` 
- Now we can console log the returned promise and refacto with the async/await syntaxe :

```js
  module.exports = app => {
+-  app.post('/api/stripe', async (req, res) => {
+-    const charge = await stripe.charges.create({
        amount: 500,
        currency: 'usd',
        description: '$5 for 5 credits',
        source: req.body.id
      });
+     console.log(charge);
    });
  };
``` 
- Now we need to give credits to the user when the payment was successfuly done 
- First we need to add another property to our User model :

```js
  const userSchema = new Schema({
    googleId: String,
    name: String,
=   credits: { type: Number, default: 0 }
  });
``` 

note: here we pass a default value of 0 and specify it's a number

- Now let's take the user model to add credits and send the user model back to the client side with the request response :

```js
  module.exports = app => {
    app.post('/api/stripe', async (req, res) => {
      const charge = await stripe.charges.create({
        amount: 500,
        currency: 'usd',
        description: '$5 for 5 credits',
        source: req.body.id
      });
+     req.user.credits += 5;
+     const user = await req.user.save();

+     res.send(user);
    });
  };
``` 

- Next we need to make sure that the user is logged in before we add credits or bill any credit card. We can make sure of that by using a new middleware that will verify if the user is logged in 
- We are going to centralize our middlewares in a new directory that we call middlewares
- Inside of it, create a new file named "requireLogin.js" and create our middleware :

```js
  module.exports = (req, res, next) => {
    if (!req.user) {
      return res.status(401).send({ error: 'You must log in !' });
    }

    next();
  };
``` 


note: the argument "next" is a callback fx that we call when our middleware is complete. Here we say that if the user isn't logged in the send back the response with the of status 401 which means forbidden, and if he's logged in the go to the "next()" middleware.

- Now we need to wire up this middleware to the route handler billingRoutes "/api/stripe" like so:

```js
+ const requireLogin = require('../middlewares/requireLogin');

  module.exports = app => {
+-  app.post('/api/stripe', requireLogin, async (req, res) => {
      const charge = await stripe.charges.create({
        amount: 500,
        currency: 'usd',
        description: '$5 for 5 credits',
        source: req.body.id
      });
      req.user.credits += 5;
      const user = await req.user.save();

      res.send(user);
    });
  };
``` 


