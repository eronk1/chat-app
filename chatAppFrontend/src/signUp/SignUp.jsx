import React from 'react'
import { useState, useEffect } from 'react'
import './SignUp.css'
import StarterHeader from '../SharedStarterPage/StarterHeader'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function SignUp(props) {
  let navigate = useNavigate();
  const [inputValues, setInputValues] = props.inputSignUp;
  const [valid,changeValid] = useState(false);
  const [femaleId, setFemaleId] = useState(["femaleImgParent","femaleImg"]);
  const [maleId, setmaleId] = useState(["maleImgParent","maleImg"]);
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
          const response = await axios.post("http://chat-app.cags2.com:4000/signUp", authVal, { withCredentials: true });
          const data = response.data;
      
          if (data.valid) {
            localStorage.setItem('userTokens', JSON.stringify(data));
            await fetchData(props.setAuthStatus, props.setUserSummary); // Wait for fetchData to complete
            navigate('/channel/@me');
          }
        } catch (error) {
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

  if(!props.authStatus) {
    return (
      <div id='SignUpParent'>
        <StarterHeader topRightButtonLink="/Login" topRightButtonValue="Login" />
        <div id='signUpPageContainer'>
          <p className='signUpText'>SIGN UP AND CHAT</p>
          <div className='age'>
            <select name="inputMonth" value={inputValues.inputMonth} onChange={handleInputChange} id="month-select">
              {months.map(month => <option key={month} value={month}>{new Date(0, month - 1).toLocaleString('default', { month: 'long' })}</option>)}
            </select>
            <select name="inputDay" value={inputValues.inputDay} onChange={handleInputChange} id="day-select">
              {days.map(day => <option key={day} value={day}>{day}</option>)}
            </select>
            <select name="inputYear" value={inputValues.inputYear} onChange={handleInputChange} id="year-select">
              {years.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>
          <div className='inputParent'>
            <p className='inputLabel'>Choose Username</p>
            <input name='inputUsername' value={inputValues.inputUsername} onChange={handleInputChange} className='input' type="text" placeholder='VDRS_Pro123'/>
          </div>
          <div className='inputParent'>
            <p className='inputLabel'>Choose Preferred Name</p>
            <input name='inputPreferredName' value={inputValues.inputPreferredName} onChange={handleInputChange} className='input' type="text" placeholder='VDRS_Pro123'/>
          </div>
          <div className='inputParent'>
            <p className='inputLabel'>Choose Password</p>
            <input name='inputPassword' value={inputValues.inputPassword} onChange={handleInputChange} maxLength={48} className='input' type='password' placeholder='At least 8 characters'/>
          </div>
          <div className='inputParent'>
            <p className='inputLabel'>Confirm Password</p>
            <input name='inputConfirmPassword' value={inputValues.inputConfirmPassword} onChange={handleInputChange} maxLength={48} className='input' type='password' placeholder='At least 8 characters' />
          </div>
          <div className='genderParent'>
            <p className='chooseGender'>Choose Gender (Optional)</p>
            <div className='chooseGenderMain'>
              <div id='femaleParent' className={femaleId[0]} onClick={femaleClicked}>
                <svg id={femaleId[1]} xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M400-80v-240H280l122-308q10-24 31-38t47-14q26 0 47 14t31 38l122 308H560v240H400Zm80-640q-33 0-56.5-23.5T400-800q0-33 23.5-56.5T480-880q33 0 56.5 23.5T560-800q0 33-23.5 56.5T480-720Z"/></svg>
              </div>
              <div id='maleParent' className={maleId[0]} onClick={maleClicked} >
                <svg id={maleId[1]} xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M400-80v-280h-80v-240q0-33 23.5-56.5T400-680h160q33 0 56.5 23.5T640-600v240h-80v280H400Zm80-640q-33 0-56.5-23.5T400-800q0-33 23.5-56.5T480-880q33 0 56.5 23.5T560-800q0 33-23.5 56.5T480-720Z"/></svg>
              </div>
            </div>
          </div>
          <button onClick={handleButtonClick} className='theSignUpButton'>Sign Up</button>
        </div>
      </div>
    )
  }else{
    return ( <div>..loading</div> )
  }
}

const fetchData = async (setAuthenticated, setUserSummary) => {
  //  await renewRefreshToken(setLoggedValue, setAuthenticated); 

    const userTokens = localStorage.getItem('userTokens');
    console.log(userTokens)
    if (userTokens) {
      const tokens = JSON.parse(userTokens);
      console.log(tokens)
      console.log('water2')
      if (tokens.accessToken) { 
        console.log(tokens.accessToken)
        try {
          const response = await axios.get('http://chat-app.cags2.com:3000/getUserData', {
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
      console.log('water22231')
      setAuthenticated(false);
    }
  };