import React from 'react'
import { useState, useEffect } from 'react'
import './SignUp.css'
import StarterHeader from '../SharedStarterPage/StarterHeader'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

export default function SignUp(props) {
  let navigate = useNavigate();
  const [inputValues, setInputValues] = props.inputSignUp;
  const [valid,changeValid] = useState(false);
  const [femaleId, setFemaleId] = useState(["femaleImgParent","femaleImg"]);
  const [maleId, setmaleId] = useState(["maleImgParent","maleImg"]);
  let [errMessage, setErrMessage] = useState('');
  function handleButtonClick() {
      // Assuming `inputValues` contains all necessary fields including the age object (day, month, year)
      let authVal = {
          username: inputValues.inputUsername,
          password: inputValues.inputPassword,
          confirmPassword: inputValues.inputConfirmPassword,
          gender: inputValues.inputGender,
          age: {
              day: inputValues.inputDay,
              month: inputValues.inputMonth,
              year: inputValues.inputYear
          },
          preferredName: inputValues.inputPreferredName
      };

      async function handleSignUp() {
        try {
          const response = await axios.post("http://localhost:4000/signUp", authVal, { withCredentials: true });
          const data = response.data;
      
          if (data.valid) {
            localStorage.setItem('userTokens', JSON.stringify(data));
            await fetchData(props.setAuthStatus, props.setUserSummary); // Wait for fetchData to complete
            navigate('/channel/@me');
          }
        } catch (error) {
          if(error.response && error.response.data && error.response.data.message){
            setErrMessage(error.response.data.message)
          }else{
            setErrMessage('Something went wrong please try again.')
          }
          console.error('There was an error!', error);
        }
      }
      
      handleSignUp();
  }
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputValues({
      ...inputValues,
      [name]: value
    });
  };
  function femaleClicked(){
    let val = 'female';
    if(maleId[0]== "maleImgParentOn"){
      setmaleId(["maleImgParent","maleImg"]);
      setFemaleId(["femaleImgParentOn","femaleImgOn"]);
    }else if(femaleId[0] == "femaleImgParentOn"){
      setFemaleId(["femaleImgParent","femaleImg"]);
      val = 'none'
    }else{
      setFemaleId(["femaleImgParentOn","femaleImgOn"]);
    }
    setInputValues({
      ...inputValues,
      inputGender: val
    });
  }
  function maleClicked(){
    let val = 'male'
    if(femaleId[0]== "femaleImgParentOn"){
      setFemaleId(["femaleImgParent","femaleImg"]);
      setmaleId(["maleImgParentOn","maleImgOn"]);
    }else if(maleId[0] == "maleImgParentOn"){
      setmaleId(["maleImgParent","maleImg"]);
      val = 'none'
    }else{
      setmaleId(["maleImgParentOn","maleImgOn"]);
    }
    setInputValues({
      ...inputValues,
      inputGender: val
    });
  }
  const days = [...Array(31).keys()].map(i => i + 1);
  const months = [...Array(12).keys()].map(i => i + 1);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1900 }, (_, i) => i + 1900).reverse();
  const horizDur = 0.1;
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: horizDur,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.04,
      },
    },
    exit: { opacity: 0.5 },
  };
  const childVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };
  if(!props.authStatus) {
    return (
      <div id='SignUpParent'>
        <StarterHeader topRightButtonLink="/Login" topRightButtonValue="Login" />
        <motion.div 
          id='signUpPageContainer'
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          >
          <motion.p variants={childVariants} className='signUpText'>SIGN UP AND CHAT</motion.p>
          <motion.div variants={childVariants} className='age'>
            <select name="inputMonth" value={inputValues.inputMonth} onChange={handleInputChange} id="month-select">
              <option key="Month" value="Month">Month</option>
              {months.map(month => <option key={month} value={month}>{new Date(0, month - 1).toLocaleString('default', { month: 'long' })}</option>)}
            </select>
            <select name="inputDay" value={inputValues.inputDay} onChange={handleInputChange} id="day-select">
              <option key="Day" value="Day">Day</option>
              {days.map(day => <option key={day} value={day}>{day}</option>)}
            </select>
            <select name="inputYear" value={inputValues.inputYear} onChange={handleInputChange} id="year-select">
            <option key="Year" value="Year">Year</option>
              {years.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
          </motion.div>
          <motion.div variants={childVariants} className='inputParent'>
            <p className='inputLabel'>Choose Username</p>
            <input name='inputUsername' value={inputValues.inputUsername} onChange={handleInputChange} className='input' type="text" placeholder='VDRS_Pro123'/>
          </motion.div>
          <motion.div variants={childVariants} className='inputParent'>
            <p className='inputLabel'>Choose Preferred Name</p>
            <input name='inputPreferredName' value={inputValues.inputPreferredName} onChange={handleInputChange} className='input' type="text" placeholder='VDRS_Pro123'/>
          </motion.div>
          <motion.div variants={childVariants} className='inputParent'>
            <p className='inputLabel'>Choose Password</p>
            <input name='inputPassword' value={inputValues.inputPassword} onChange={handleInputChange} maxLength={48} className='input' type='password' placeholder='At least 8 characters'/>
          </motion.div>
          <motion.div variants={childVariants} className='inputParent'>
            <p className='inputLabel'>Confirm Password</p>
            <input name='inputConfirmPassword' value={inputValues.inputConfirmPassword} onChange={handleInputChange} maxLength={48} className='input' type='password' placeholder='At least 8 characters' />
          </motion.div>
          <motion.div variants={childVariants} className='genderParent'>
            <p className='chooseGender'>Choose Gender (Optional)</p>
            <div className='chooseGenderMain'>
              <div id='femaleParent' className={femaleId[0]} onClick={femaleClicked}>
                <svg id={femaleId[1]} xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M400-80v-240H280l122-308q10-24 31-38t47-14q26 0 47 14t31 38l122 308H560v240H400Zm80-640q-33 0-56.5-23.5T400-800q0-33 23.5-56.5T480-880q33 0 56.5 23.5T560-800q0 33-23.5 56.5T480-720Z"/></svg>
              </div>
              <div id='maleParent' className={maleId[0]} onClick={maleClicked} >
                <svg id={maleId[1]} xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M400-80v-280h-80v-240q0-33 23.5-56.5T400-680h160q33 0 56.5 23.5T640-600v240h-80v280H400Zm80-640q-33 0-56.5-23.5T400-800q0-33 23.5-56.5T480-880q33 0 56.5 23.5T560-800q0 33-23.5 56.5T480-720Z"/></svg>
              </div>
            </div>
          </motion.div>
          <div id='the-sign-up-error-message'>{errMessage}</div>
          <motion.button variants={childVariants} onClick={handleButtonClick} className='theSignUpButton'>Sign Up</motion.button>
        </motion.div>
      </div>
    )
  }else{
    return ( <div>..loading</div> )
  }
}

const fetchData = async (setAuthenticated, setUserSummary) => {
  //  await renewRefreshToken(setLoggedValue, setAuthenticated); 

    const userTokens = localStorage.getItem('userTokens');
    if (userTokens) {
      const tokens = JSON.parse(userTokens);
      if (tokens.accessToken) { 
        try {
          const response = await axios.get('http://localhost:3000/getUserData', {
            headers: {
              'Authorization': `Bearer ${tokens.accessToken}`,
            },
          });

          setUserSummary(response.data);
          setAuthenticated(true);
        } catch (error) {
          setAuthenticated(false);
          console.error('There was an error fetching the user data:', error);
        }
      }else{
        setAuthenticated(false);
      }
    }else{
      setAuthenticated(false);
    }
  };