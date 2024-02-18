import {useState, useEffect} from 'react'
import { Link } from 'react-router-dom'
import './Login.css'
import StarterHeader from '../SharedStarterPage/StarterHeader.jsx'
import { useNavigate } from 'react-router-dom';
export default function Login(props) {
  let navigate = useNavigate();
  
  const [inputValues, setInputValues] = props.inputLogin;
  let handleButtonClick = () => {
    let authVal = {
      username: inputValues.inputUsername,
      password: inputValues.inputPassword
    }
    let settings = {
        method: "POST",
        body: JSON.stringify(authVal),
        credentials: 'include',
        headers: {
            "Content-Type": "application/json"
        }
    };
    fetch("http://localhost:4000/login", settings)
        .then(response => response.json())
        .then(data => {
          if(data.valid){
            props.setLoggedValue(data)
            props.setAuthStatus(true);
            navigate('/home');
          }
        })
  }
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputValues({
      ...inputValues,
      [name]: value
    });
  };
  if(!props.authStatus) {
    return (
      <div id='loginPageParent'>
        <StarterHeader topRightButtonLink="/" topRightButtonValue="Sign Up" />
        <div id='loginContainer'>
          <p className='loginText' tabIndex="1">Login to Start</p>
          <input name='inputUsername' value={inputValues.inputUsername} onChange={handleInputChange} tabIndex="2" className='box inputs' placeholder='Username' type="text" />
          <input name='inputPassword' value={inputValues.inputPassword} onChange={handleInputChange} tabIndex="3" className='box inputs' placeholder='Password' type="password" />
          <div id='checkRequest'>
            <p className='errorText' >The input was invalid</p>
            <button onClick={handleButtonClick} id='loginButton' tabIndex="4" className='box'>Login</button>
          </div>
          <p className='dhaa'>Dont have an account? <Link to="/">Sign Up</Link></p>
        </div>
      </div>
    )
  }
}
