const database = require('./database')

module.exports = {

  /*
    Your security work like this :
    you create a unique token for one session 
    everytime the user log out he will loose the refence of the token 
  */
  create_token(userID){
    return new Promise((resolve)=>{
      let token = generate_token()
      database.updateUserToken(userID,token).then(()=>{
        resolve(token)
      })
    })
  },

  check_token(userID,token){
    return new Promise((resolve)=>{
      database.getUserToken(userID).then((db_token)=>{
        resolve(token==db_token)
      })
    })
  }
}

function generate_token(){
  let token =''
  for(let x=0;x<100;x++){
    token+=getRamdomLetter()
  }
  return token
}



function getRamdomLetter(){
  let upper_or_lower = randomIntFromInterval(0,1);
  let ascii_letter
  if(upper_or_lower==0){ // upper
      ascii_letter = randomIntFromInterval(65,90)
  }else{ // lower
      ascii_letter = randomIntFromInterval(97,122)
  }
  return String.fromCharCode(ascii_letter)
}

function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min);
}