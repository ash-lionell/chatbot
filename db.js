const client = require("mongodb").MongoClient;
const MONGO_URL = 'mongodb://localhost:27017';
const db_name = "snappbot";
const coll_name = "snappbot";

module.exports = (()=>{

    let db, replies;

    return {
        init : ()=>{
            return new Promise((res, rej)=>{
                client.connect(MONGO_URL, (err, client)=>{
                    if (err) {
                        console.log("ERROR : Error occurred while trying to connect to database.");
                        rej(err);
                    }
                    db = client.db(db_name);
                    replies = db.collection(coll_name);
                    res({status:"ok"});
                });
            });
        },
        get : find=>{
            return new Promise((res, rej)=>{
                replies.find(find).toArray((err, docs)=>{
                    console.log("DEBUG : Querying db with ", find);
                    console.log(err, docs);
                    if (err) {
                        console.log("ERROR : Error occurred for the find query : "+find);
                        rej(err);
                    }
                    res(docs);
                });
            });
        }
    }
})();