const express    = require('express');
const router     = require('./router.js');
const morgan     = require('morgan');
const bodyParser = require('body-parser');

const app     = express();
const port    = 1337;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan('tiny'));

app.use(router);

app.listen(port, () => {
  console.log(`Convention server listening on port ${port}`)
});