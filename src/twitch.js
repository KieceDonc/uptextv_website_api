const request = require('request');
const secret  = require('./secret')
const app_twitch_client_id = secret.getTwitch_client_ID()
const app_twitch_secret = secret.getTwitch_secret()

module.exports = {


    getAcccessTokenAndID(twitch_code){
        return new Promise((resolve,reject)=>{
            let urlToCall = 'https://id.twitch.tv/oauth2/token?client_id='+app_twitch_client_id+'&client_secret='+app_twitch_secret+'&code='+twitch_code+'&grant_type=authorization_code&redirect_uri=https://uptextv.com/redirectAuth.html'//&claims={"id_token":{"email":null,"email_verified":null},"userinfo":{"picture":null}}'
            request.post({ 
                url: urlToCall 
            }, 
                function(error, response, body){
                    body = JSON.parse(body)
                    if(error){
                        reject(error)
                    }else{
                        resolve(body) // data[0] is needed cuz normaly you can ask for several user information but we just want data for our user
                    }
            })   
        })
    },

    /**
     * @param {String} bearer_token 
     */
    getUserBasicInfo(bearer_token){
        return new Promise((resolve,reject)=>{
            let urlToCall = 'https://id.twitch.tv/oauth2/userinfo?claims={"id_token":{"email":null,"email_verified":null},"userinfo":{"picture":null}}'
            request.get({ 
                headers: {
                    'content-type' : 'application/json',
                    'Authorization': 'Bearer '+bearer_token,
                    'Client-ID' : app_twitch_client_id
                },
                url: urlToCall 
            }, 
                function(error, response, body){
                    body = JSON.parse(body)
                    if(error){
                        reject(error)
                    }else{
                        resolve(body) // data[0] is needed cuz normaly you can ask for several user information but we just want data for our user
                    }
            })   
        })
    },

    getUserAllInfo(bearer_token,userID){
        return new Promise((resolve,reject)=>{
            let urlToCall = 'https://api.twitch.tv/helix/users?id='+userID
            request.get({ 
                headers: {
                    'content-type' : 'application/json',
                    'Authorization': 'Bearer '+bearer_token,
                    'Client-ID' : app_twitch_client_id
                },
                url: urlToCall 
            }, 
                function(error, response, body){
                    body = JSON.parse(body)
                    if(error){
                        reject(error)
                    }else{
                        resolve(body) // data[0] is needed cuz you can call this api with many userID so return an array
                    }
            })   
        })
    }
}
