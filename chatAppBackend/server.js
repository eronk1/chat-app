import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import 'dotenv/config.js';

//SIGN UP
// let authVal = {
//   username: inputValues.inputUsername,
//   password: inputValues.inputPassword,
//   confirmPassword: inputValues.inputConfirmPassword,
//   gender: inputValues.inputGender
// }

// LOGIN
// let authVal = {
//   username: inputValues.inputUsername,
//   password: inputValues.inputPassword
// }


// use session storage for jwt tokens

const app = express();

app.use(cors({origin: 'http://localhost:5173',credentials: true}));
app.use(cookieParser());

app.get('/', (req, res) => {
  res.render('../chatAppFrontend/index.html');
});
app.get('/channel/@me/:id', (req, res) => {
  const { id } = req.params; 

  if (userC.hasOwnProperty(id)) {
    res.json(userC[id]);
  } else {
    res.status(404).send('User not found');
  }
});

app.listen(process.env.CHAT_SERVER_LOCAL_PORT, () => {
  console.log(`Server running at http://localhost:${process.env.CHAT_SERVER_LOCAL_PORT}`);
});