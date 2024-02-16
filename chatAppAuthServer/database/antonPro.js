export default function fornitebattlepass(input){
    //check if exists
    console.log(input)
    if(!input.username){
        return {valid:false,field:'username', mistake:'noUsername',message:'Please input a username.'}
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