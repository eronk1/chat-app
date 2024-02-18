export default function fornitebattlepass(input){
    //check if exists
    console.log(input)
    if(!input.username){
        return {valid:false,field:'username', mistake:'noUsername',message:'Please input a username.'}
    }
    //age
    const isValid = isValidDate(input.age);
    if(!isValid){
        return {valid:false,field:'age',mistake:'invalid',message:"Your age input was invalid"}
    }
    //Nickname
    if(input.preferredName.length==0){        
        if(input.preferredName.length<3 || input.preferredName.length>20){
            return {valid:false,field:'preferredName',mistake:'wrongUsernameLength',message:"Your display name must be between 3 and 20"}
        }
        if(!/^[a-zA-Z0-9]*_?[a-zA-Z0-9]*$/.test(input.preferredName)){
            return {valid:false,field:'preferredName',mistake:'unwantedCharacter',message:"Your display name must only include alphabetical letters and one underscore."}
        }
        if(input.preferredName.startsWith('_')||input.preferredName.endsWith('_')){
            return {valid:false,field:'preferredName',mistake:'badUnderscore',message:"You cannot have an underscore at the start or end of your display name."}
        }
    }

    //gender
    if(input.gender!='none'&&input.gender!='male'&&input.gender!='female'){
       return {valid: false,field:'button', mistake: 'wrongGenderField', message: "Something went wrong."};
    }

    //username
    
    if(input.username.length<3 || input.username.length>20){
        return {valid:false,field:'username',mistake:'wrongUsernameLength',message:"Your username must be between 3 and 20"}
    }
    if(!/^[a-zA-Z0-9]*_?[a-zA-Z0-9]*$/.test(input.username)){
        return {valid:false,field:'username',mistake:'unwantedCharacter',message:"Your username must only include alphabetical letters and one underscore."}
    }
    if(input.username.startsWith('_')||input.username.endsWith('_')){
        return {valid:false,field:'username',mistake:'ERROR: CODE CORRUPTED-PLEASE REINSTALL',message:"You cannot have an underscore at the start or end of your username."}
    }
    //password
    if(!input.password){
        return {valid:false, field:'password',mistake:'noPassword',message:'Please input a password.'}
    }
    if(input.password.length<8 || input.password.length>40){
        return {valid:false,field:'password',mistake:'wrongPasswordLength',message:"Your password must be between 8 to 40."}
    }
    if(!/[a-z]/.test(input.password)){
        return {valid:false,field:'password',mistake:'noLowerCaseLetter',message:"You must include at least 1 lower case letter."}
    }
    if(!/[A-Z]/.test(input.password)){
        return {valid:false,field:'password',mistake:'noUpperCaseLetter',message:"You must include at least 1 upper case letter."}
    }
    if(!/[0-9]/.test(input.password)){
        return {valid:false,field:'password',mistake:'noNumber',message:"You must include at least 1 number."}
    }
    if(!/[^a-zA-Z0-9]/.test(input.password)){
        return {valid:false,field:'password',mistake:'noSpecialCharacter',message:"You must include at least 1 special character."}
    }
    //confirmpassword
    if(!input.confirmPassword){
        return {valid:false, field:'confirmPassword',mistake:'noConfirmPassword',message:'Please input a confirm password.'}
    }
    if(input.password!==input.confirmPassword){
        return{valid:false,field:'confirmpassword',mistake:'confirmPasswordDoesNotMatch',message:'Your password and confirm password do not match.'}
    }
    return {valid:true}
}

// Example input structure
const input = {
    age: {
        day: 29,
        month: 2,
        year: 2024
    }
};

// Function to check if the year is a leap year
function isLeapYear(year) {
    return (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0));
}

// Function to validate the date
function isValidDate(age) {
    const { day, month, year } = age;
    if(!day||!month||!year) return false;
    // Days in each month; February is set to 28 or 29 depending on leap year
    const daysInMonth = [0, 31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    // Validate month
    if (month < 1 || month > 12) {
        console.log("Invalid month");
        return false;
    }

    // Validate day based on month and leap year
    if (day < 1 || day > daysInMonth[month]) {
        console.log("Invalid day for the given month/year");
        return false;
    }

    return true; // The date is valid
}