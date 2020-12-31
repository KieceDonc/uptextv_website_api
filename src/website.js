const express = require('express'); 
const fs = require('fs')
const https = require('https')
const twitch = require('./twitch')
const database = require('./database')
const security = require('./security');
const domain="uptextv.com"
const port = 1000; 

const privateKey = fs.readFileSync('/etc/letsencrypt/live/'+domain+'/privkey.pem', 'utf8'); // https://itnext.io/node-express-letsencrypt-generate-a-free-ssl-certificate-and-run-an-https-server-in-5-minutes-a730fbe528ca
const certificate = fs.readFileSync('/etc/letsencrypt/live/'+domain+'/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/'+domain+'/chain.pem', 'utf8');

const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};

var app = express();  
app.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin' , 'https://uptextv.com');
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    next();
});

var server = https.createServer(credentials, app).listen(port, function () {
})  

var io = require('socket.io').listen(server);

io.on('connection', (socket) => {
    socket.on('onLogin',(twitch_code)=>{
        onLogin(twitch_code,socket)
    })

    socket.on('getUserInfo'),(userID)=>{
        getUserInfo(userID).then((userData)=>{
            socket.emit('callback_getUserInfo','done',userData)
        }).catch((err)=>{
            console.log(err)
            socket.emit('callback_getUserInfo',err)
        })
    }
});

/**
 * This function have two main role :
 * handle work for user information in database
 * handle work for security token 
 * This function will also the callback cuz db_background_work() might take more time than security_work() and if you do a resolve in a promise it will stop the work
 * @param {*} twitch_code 
 */
function onLogin(twitch_code,socket){
    twitch.getAcccessTokenAndID(twitch_code).then((JSON0)=>{
        let bearer_token = JSON0.access_token
        twitch.getUserBasicInfo(bearer_token).then((JSON1)=>{
            let userID = JSON1.sub

            security_work = ()=>{
                security.create_token(userID).then((token)=>{
                    socket.emit('callback_onLogin','token',token)
                })
            }

            security_work()

            database_background_work = ()=>{
                twitch.getUserAllInfo(bearer_token,userID).then((JSON2)=>{
                    
                    let userData = JSON2.data[0] 
                    let userEmail = userData['email']
                    let userID = userData['id']
                    let userName = userData['login']
                    let userType = userData['type']
                    let userBroadcasterType = userData['broadcaster_type']
                    let userViewCount = userData['view_count']
                    let userProfilePicture = userData['profile_image_url']
    
                    updateUser = ()=>{
                        database.updateUser(userID,userName,userEmail,userType,userBroadcasterType,userViewCount,userProfilePicture)
                    }

                    database.isUserExist(userID).then((isUserExist)=>{
                        if(isUserExist){
                            updateUser()
                        }else{
                            database.createUser(userID).then(()=>{
                                updateUser()
                            })
                        }
                    })                 
                })
            }

            database_background_work()
        })
    }).catch((err)=>{
        // normally not happening
        console.log(err)
        socket.emit('callback_onLogin','err',err)
    })
}

function getUserInfo(userID){
    return new Promise((resolve,reject)=>{
        database.getUser(userID).then((userData)=>{
            resolve(userData)
        }).catch((err)=>{
            reject(err)
        })
    })
}

/**
 * This function will check the security token 
 * @param {*} token 
 */
function checkToken(token){
    return new Promise((resolve)=>{
        security.checkToken(token).then((isTokenValid)=>{
            resolve(isTokenValid)
        })
    })
}