const { WebClient } = require('@slack/client');
const SLACK_TOKEN = "xoxp-148733971857-449242100449-566806086502-aa6bf01ae1e2e1f2e196b16ec2bd1936";
const BOT_TOKEN = "xoxb-148733971857-556658577345-Mp9HBIMxJ18yUjvy9FnXjxtC";
const web = new WebClient(BOT_TOKEN);

const sleep= require("system-sleep");

const db = require("./db");
db.init();

module.exports = (()=>{

    const users = {};

    const post = web.chat.postMessage;

    const get_channel_id = entity=>{
        let channel_id;
        switch (entity.type) {
            case "message": channel_id = entity.channel; break;
            case "block_actions": channel_id = entity.channel.id; break;
        }
        return channel_id;
    }

    const send_msg = (entity, msgs, mode)=>{
        if (msgs!=="undefined" && msgs.constructor.name!=="Array")
            msgs = [msgs];
        let channel_id = get_channel_id(entity);
        msgs.forEach(msg=>{
            let t = msg.message;
            t.channel = channel_id;
            mode(t);
        });
    }

    const get_username = user_id=>{
        let user = users[user_id];
        if (!user) {
            users[user_id] = {};
            users[user_id].first_name = web.users.info({user:user_id}).then(user=>{
                return user.user.profile.first_name;
            });
        }
        return users[user_id].first_name;
    }

    const handle = (find, event, transform) => {
        db.get(find).then(reply=>{
            if (typeof transform==="function")
                transform(reply);
            send_msg(event, reply, post);
        });
    }

    const replace = (find, event, response) => {
        db.get(find).then(reply=>{
            send_msg(event, reply, response);
        });
    }

    return {
        on : {
            message : event => {
                let text = event.text.toLowerCase();
                if (text === "hi") {
                    Promise.all([db.get({type:"start"}),get_username(event.user)]).then(responses=>{
                        let reply = responses[0][0];
                        let first_name = responses[1];
                        let t = reply.message.blocks[0].text;
                        t.text = t.text.replace("<FIRST_NAME>",first_name);
                        reply.message.text = reply.message.text.replace("<FIRST_NAME>",first_name);
                        send_msg(event, responses[0], post);
                        //handle({type:"start"},event);
                    });
                }
            },
            block_interaction : (interaction, response) => {
                let action = interaction.actions[0];
                let action_id = action.action_id;
                let action_name = action.text.text;

                console.log("action : ", action);
                let reply_transform;
                switch (action_id) {
                    case "create-pnr":
                        db.get({type:"start:acknowledge"}).then(reply=>{
                            reply = reply[0];
                            let message = reply.message;
                            message.text = message.text.replace("<ORIGINAL_MSG_TEXT>",interaction.message.text);
                            message.attachments[0].text = message.attachments[0].text.replace("<REQUIREMENT>",action_name);
                            send_msg(interaction, reply, response);
                        });
                        //replace({type:"start:acknowledge"}, interaction, response);
                        break;
                    case "create-pnr:domestic-single:defaults":
                        db.get({type:"create-pnr:acknowledge"}).then(reply=>{
                            reply = reply[0];
                            let message = reply.message;
                            message.text = message.text.replace("<ORIGINAL_MSG_TEXT>",interaction.message.text);
                            message.attachments[0].text = message.attachments[0].text.replace("<PNR_PROFILE>",action_name);
                            send_msg(interaction, reply, response);
                        });
                        reply_transform = reply=>{
                            reply = reply[0];
                            let message = reply.message;
                            message.blocks[0].text.text = message.blocks[0].text.text.replace("<PNR_PROFILE>",action_name);
                        }
                        break;
                }
                sleep(2000);
                handle({type:action_id},interaction,reply_transform);
            },
            attachment_interaction : (interaction, response) => {

            }
        }
    }
})();