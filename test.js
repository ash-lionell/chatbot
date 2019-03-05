const { WebClient } = require('@slack/client');
const SLACK_TOKEN = "xoxp-148733971857-449242100449-566806086502-aa6bf01ae1e2e1f2e196b16ec2bd1936";
const BOT_TOKEN = "xoxb-148733971857-556658577345-Mp9HBIMxJ18yUjvy9FnXjxtC";
const web = new WebClient(BOT_TOKEN);

const fse = require("fs");
let data = fse.readFileSync("./test_response.json");
response = JSON.parse(data);
response.channel = "DGE9X3PSB";

web.chat.postMessage(response).then(res=>{
    console.log("INFO : Success sending test message : ",res);
}).catch(err=>{
    console.log("ERROR : Error occurred while sending test message : ", err);
});