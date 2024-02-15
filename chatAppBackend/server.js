import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

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
const port = 3000;

app.use(cors({origin: 'http://localhost:5173',credentials: true}));
app.use(cookieParser());

app.get('/', (req, res) => {
  res.render('../chatAppFrontend/index.html');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
