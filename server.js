const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require ('helmet');
const compression = require('compression');
const morgan = require('morgan');

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));


const PORT = 3000;

app.listen(PORT, () => {
  console.log("estoy funcionando en el puerto " + PORT);
});

app.post('/logIn', (req, res) => {
  let dni = req.body.dni;
  let password =  req.body.password;
  res.status(200).json('success');
});

app.post('/crearNuevaCuenta', (req, res) => {
  let dni = req.body.dni;
  let nombre = req.body.dni;
  res.status(200).json('success');
});
