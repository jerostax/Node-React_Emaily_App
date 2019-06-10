# Emaily App (Node with React Udemy Course @ Stephen Grider)

#### Table of Contents

1. [Server Setup](#server-setup)
2. [Heroku Deployment](#heroku)
3. [Google OAuth](#google)
    1. [Passport Library](#passport)
4. [MongoDB](#mongodb)

## Server Setup <a name="server-setup"></a>

### `npm init`

Created server folder and initialized npm inside of it. <br>

### Generate Express App

Create index.js file in the project and add :

```js
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send({ hi: 'there' });
});

app.listen(5000);
```

## Heroku deployment <a name="heroku"></a>

### 1 - PORT listening in index.js

```js
const PORT = process.env.PORT || 5000;
app.listen(PORT);
```

### 2 - Specify Node and NPM version in package.json

```js
 "engines": {
    "node": "10.15.3",
    "npm": "6.9.0"
  },
```

### 3 - Specify the start script in package.json

```js
"start": "node index.js"
```

### 4 - Git init in your project and add + commit

```
git init
git commit -m "initial commit"
```

### 5 - Install Heroku CLI in the project after commited it

https://devcenter.heroku.com/articles/heroku-cli

### 6 - Login to Heroku account

On the terminal inside the project :

```
heroku login
```

### 7 - Create a new Heroku app

```
heroku create
```

### 8 - Push on GIT

Use the .git link provided in Heroku create command then :

```
git remote add heroku https://git.heroku.com/this-is-an-exemple.git
git push heroku master
```

### 9 - RE-Deploy

```
git add .
git commit -m "un nouveau commit"
git push heroku master
```

## Google OAuth <a name="google"></a>

### Passport Library <a name="passport"></a>

We use [passport library](http://www.passportjs.org/packages/) to handle a part of the Google OAuth flow <br>

- passport: General helpers for handling auth in Express apps
- passport strategy: helpers for authenticating with one specific method (email/password, Google, Facebook...)

## MongoDB <a name="mongodb"></a>
