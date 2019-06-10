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
