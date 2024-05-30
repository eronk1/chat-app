import {useState, useEffect} from 'react'
import { Link } from 'react-router-dom'
import './Login.css'
import StarterHeader from '../SharedStarterPage/StarterHeader.jsx'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { easeIn, motion } from 'framer-motion';
import { delay } from 'lodash';

export default function Login(props) {
  let navigate = useNavigate();
  let [errorMessage, setErrorMessage] = useState('');
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
    fetch("https://chat.cags2.com:4443/login", settings)
        .then(response => response.json())
        .then(data => {
          if(data.valid){
            props.setLoggedValue(data)
            axios.get('https://chat.cags2.com:3443/getUserData', {
              headers: {
                Authorization: `Bearer ${data.accessToken}`
              }
            }).then(response => {
                props.setUserSummary(response.data);
                props.setAuthStatus(true);
                navigate('/channel/@me');
            }).catch(error => {
                console.error('There was an error fetching the user data:', error);
            });
          } else {
            setErrorMessage(data.message)
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
  const horizDur = 0.3;
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: horizDur, ease: "easeOut" },
    },
    exit: { opacity: 0.5 },
  };
  let itemMoveVariants = '5rem';
  const itemVariants = {
    hidden: { opacity: 0.5, y:`-${itemMoveVariants}` },
    visible: { opacity: 1, y:0, transition: { duration: horizDur, ease: "easeOut" } },
    exit: { opacity: 0.5, y:`-${itemMoveVariants}`, transition: { duration: horizDur, ease: "easeOut" }},
  };
  const oItemVariants = {
    hidden: { opacity: 0.5, y: itemMoveVariants },
    visible: { opacity: 1, y:0, transition: { duration: horizDur, ease: "easeOut" } },
    exit: { opacity: 0.5, y: itemMoveVariants, transition: { duration: horizDur, ease: "easeOut" }},
  };
  const staggerTime = 0.2;
  const slowAppear = {
    hidden: { opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: horizDur-0.2, ease: "easeOut", delay: horizDur } },
    exit: { opacity: 0, transition: { duration: staggerTime, ease: "easeOut" } },
  };
  const slowAppear2 = {
    hidden: { opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: horizDur-0.2, ease: "easeOut", delay: horizDur} },
    exit: { opacity: 0, transition: { duration: staggerTime, ease: "easeOut" } },
  }
  if(!props.authStatus) {
    return (
      <div
      id='loginPageParent'
    >
      <StarterHeader topRightButtonLink="/" topRightButtonValue="Sign Up" />
      <motion.div
        id='loginContainer'
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <motion.p
          className='loginText'
          tabIndex="1"
          variants={itemVariants}
        >
          Login to Start
        </motion.p>
        <motion.input
          name='inputUsername'
          value={inputValues.inputUsername}
          onChange={handleInputChange}
          tabIndex="2"
          className='box inputs'
          placeholder='Username'
          type="text"
          variants={slowAppear}
        />
        <motion.input
          name='inputPassword'
          value={inputValues.inputPassword}
          onChange={handleInputChange}
          tabIndex="3"
          className='box inputs'
          placeholder='Password'
          type="password"
          variants={slowAppear2}
        />
        <motion.div
          id='checkRequest'
        >
          <p className='errorText'>{errorMessage}</p>
          <motion.button
            onClick={handleButtonClick}
            id='loginButton'
            tabIndex="4"
            className='box'
            variants={oItemVariants}
          >
            Login
          </motion.button>
        </motion.div>
        <motion.p className='dhaa' variants={oItemVariants}>
          Don't have an account? <Link to="/">Sign Up</Link>
        </motion.p>
      </motion.div>
    </div>
    )
  }
}
