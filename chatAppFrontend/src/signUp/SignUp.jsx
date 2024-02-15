import React from 'react'
import { useState, useEffect } from 'react'
import './SignUp.css'
import StarterHeader from '../SharedStarterPage/StarterHeader'
import { useNavigate } from 'react-router-dom';

export default function SignUp(props) {
  let navigate = useNavigate();
  const [inputValues, setInputValues] = props.inputSignUp;
  const [valid,changeValid] = useState(false);
  const [femaleId, setFemaleId] = useState(["femaleImgParent","femaleImg"]);
  const [maleId, setmaleId] = useState(["maleImgParent","maleImg"]);
  function handleButtonClick() {
    let authVal = {
      username: inputValues.inputUsername,
      password: inputValues.inputPassword,
      confirmPassword: inputValues.inputConfirmPassword,
      gender: inputValues.inputGender
    }
    let settings = {
        method: "POST",
        body: JSON.stringify(authVal),
        credentials: 'include',
        headers: {
            "Content-Type": "application/json"
        }
    };
    fetch("http://localhost:3000/signUp", settings)
        .then(response => response.json())
        .then(data => {
          if(data.valid){
            props.setLoggedValue(data)
            props.setAuthStatus(true);
            navigate('/home')
          };
        })
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
  if(!props.authStatus) {
    return (
      <div id='SignUpParent'>
        <StarterHeader topRightButtonLink="/Login" topRightButtonValue="Login" />
        <div id='signUpPageContainer'>
          <p className='signUpText'>SIGN UP AND START DINING</p>
          <div className='inputParent'>
            <p className='inputLabel'>Choose Username</p>
            <input name='inputUsername' value={inputValues.inputUsername} onChange={handleInputChange} className='input' type="text" placeholder='VDRS_Pro123'/>
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
  }
}