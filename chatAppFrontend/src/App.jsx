import { useState, useEffect } from 'react'
import './App.css'
import { Route , Routes, redirect } from "react-router-dom"
import SignUp from './signUp/SignUp'
import Login from './login/Login'
import ErrorPage from './ErrorPage/ErrorPage'
import io from 'socket.io-client'


function App() {
  const [loggedValue, setLoggedValue] = useState(null);
  const [isAuthenticated, setAuthenticated] = useState(false);
  const signUpInputs = useState({
    inputUsername: "",
    inputPassword: "",
    inputConfirmPassword: "",
    inputGender: "none"
  });
  const loginInputs = useState({
    inputUsername: "",
    inputPassword: ""
  });

  return (
    <Routes>
      <Route path="/" element={<SignUp setLoggedValue={setLoggedValue} setAuthStatus={setAuthenticated} authStatus={isAuthenticated} inputSignUp={signUpInputs} />} />
      <Route path="/Login" element={<Login setLoggedValue={setLoggedValue} setAuthStatus={setAuthenticated} authStatus={isAuthenticated} inputLogin={loginInputs} />} />
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  )
}

export default App
