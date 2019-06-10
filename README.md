# Emaily App (Node with React Udemy Course @ Stephen Grider)

## Server Setup

### `npm init`

Created server folder and initialized npm inside of it. <br>

### Generated Express App

```js
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send({ hi: 'there' });
});

app.listen(5000);
```

## Heroku deployment

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
