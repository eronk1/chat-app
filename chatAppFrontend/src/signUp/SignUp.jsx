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
            navigate('/channel/@me')
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
          <p className='signUpText'>SIGN UP AND CHAT</p>
          <div className='age'>
            <select name="months" id="month-select">
              <option value="1">January</option>
              <option value="2">February</option>
              <option value="3">March</option>
              <option value="4">April</option>
              <option value="5">May</option>
              <option value="6">June</option>
              <option value="7">July</option>
              <option value="8">August</option>
              <option value="9">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>
            <select name="days" id="day-select">
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
              <option value="8">8</option>
              <option value="9">9</option>
              <option value="10">10</option>
              <option value="11">11</option>
              <option value="12">12</option>
              <option value="13">13</option>
              <option value="14">14</option>
              <option value="15">15</option>
              <option value="16">16</option>
              <option value="17">17</option>
              <option value="18">18</option>
              <option value="19">19</option>
              <option value="20">20</option>
              <option value="21">21</option>
              <option value="22">22</option>
              <option value="23">23</option>
              <option value="24">24</option>
              <option value="25">25</option>
              <option value="26">26</option>
              <option value="27">27</option>
              <option value="28">28</option>
              <option value="29">29</option>
              <option value="30">30</option>
              <option value="31">31</option>
            </select>
            <select name="year" id="year-select">
              <option value="2000">2000</option>
              <option value="2001">2001</option>
              <option value="2002">2002</option>
              <option value="2003">2003</option>
              <option value="2004">2004</option>
              <option value="2005">2005</option>
              <option value="2006">2006</option>
              <option value="2007">2007</option>
              <option value="2008">2008</option>
              <option value="2009">2009</option>
              <option value="2010">2010</option>
              <option value="2011">2011</option>
              <option value="2012">2012</option>
              <option value="2013">2013</option>
              <option value="2014">2014</option>
              <option value="2015">2015</option>
              <option value="2016">2016</option>
              <option value="2017">2017</option>
              <option value="2018">2018</option>
              <option value="2019">2019</option>
              <option value="2020">2020</option>
              <option value="2021">2021</option>
              <option value="2022">2022</option>
              <option value="2023">2023</option>
              <option value="2024">2024</option>
            </select>

          </div>
          <div className='inputParent'>
            <p className='inputLabel'>Choose Username</p>
            <input name='inputUsername' value={inputValues.inputUsername} onChange={handleInputChange} className='input' type="text" placeholder='VDRS_Pro123'/>
          </div>
          <div className='inputParent'>
            <p className='inputLabel'>Choose Preferred Name</p>
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