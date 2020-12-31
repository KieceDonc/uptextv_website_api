
const { MongoClient } = require("mongodb")
const secret = require("secret")

const mongodb_username = secret.getMongoDB_username()
const mongodb_password = secret.getMongoDB_password()
const mongodb_db_name = secret.getMongoDB_db_name()
const mongodb_users_collection = secret.getMongoDB_users_collection()

const mongodb_uri = "mongodb+srv://"+mongodb_username+":"+mongodb_password+"@main.i8bys.mongodb.net/"+mongodb_db_name+"?retryWrites=true&w=majority";
const mongodb_client = new MongoClient(mongodb_uri, { useUnifiedTopology: true,suseNewUrlParser: true });

var db = null

function getDB(){
    return new Promise((resolve,reject)=>{
        if(!db){
            mongodb_client.connect(err => {
                if(err){
                    reject(err)
                }
                db = mongodb_client.db(mongodb_db_name);
                resolve(db)
            });
        }else{
            resolve(db)
        }
    })
}

module.exports= {

    getUser(userID){
        return new Promise((resolve,reject)=>{
            getDB().then((db)=>{        
                var cursor=db.collection(mongodb_users_collection).find({ID: userID})
                cursor.each(function(err, doc) {
                    if(doc!=null&&doc.ID!=null&&doc.ID!=0){
                        resolve(doc)
                    }else{
                        resolve(null)
                    }
                });
            }).catch((err)=>{
                reject(err)
            })
        })
    },

    isUserExist(userID){
        return new Promise((resolve,reject)=>{
            getUser(userID).then((user)=>{
                if(user){
                    resolve(true)
                }else{
                    resolve(false)
                }
            }).catch((err)=>{
                reject(err)
            })
        })
    },

    createUser(userID){
        return new Promise((resolve,reject)=>{
            getDB().then((db)=>{
                let newUser = {}
                newUser['ID']=userID
                newUser['website_create_at']=new Date()
                db.collection(mongodb_users_collection).insertOne(newUser);
                resolve()
            }).catch((err)=>{
                reject(err)
            })
        })
    },

    // ( broadcasterType ) User’s broadcaster type: "partner", "affiliate", or "".
    // ( twitchType ) User’s type: "staff", "admin", "global_mod", or "".
    updateUser(userID,displayName,email,twitch_type,broadcaster_type,view_count,profile_picutre){
      return new Promise((resolve,reject)=>{
        getDB().then((db)=>{
            db.collection(mongodb_users_collection).updateOne(
                {ID: userID}, 
                {
                    $set: {
                      'displayname':displayName,
                      'email':email,
                      'twitch_type':twitch_type,
                      'broadcaster_type':broadcaster_type,
                      'view_count':view_count,
                      'profile_picture':profile_picutre
                    }
                }
            )
            resolve()
        }).catch((err)=>{
            reject(err)
        })
      })
    },

    updateUserToken(userID,token){
        return new Promise((resolve,reject)=>{
            getDB().then((db)=>{
                db.collection(mongodb_users_collection).updateOne(
                    {ID: userID}, 
                    {
                        $set: {
                          'token':token
                        }
                    }
                )
                resolve()
            }).catch((err)=>{
                reject(err)
            })
          })
    },

    getUserToken(userID){
        getUser(userID).then((user)=>{
            return user['token']
        })
    }
}