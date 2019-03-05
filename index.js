const { createEventAdapter } = require('@slack/events-api');
const SLACK_SIGNING_SECRET = "0fad7c52aff0ef890834d32040064ab6";
const events = createEventAdapter(SLACK_SIGNING_SECRET);

const { WebClient } = require('@slack/client');
const SLACK_TOKEN = "xoxp-148733971857-449242100449-557187283716-abd3ad6ba82dc50c48cdd80d91a0edc3";
const BOT_TOKEN = "xoxb-148733971857-556658577345-QbH4JyuiQJrkONWEMiQC4Bhp";
const web = new WebClient(BOT_TOKEN);

const { createMessageAdapter } = require('@slack/interactive-messages');
const interactions = createMessageAdapter(SLACK_SIGNING_SECRET);

const express = require("express");
const app = express();

const bodyParser = require("body-parser");

const handler = require("./handler");

app.use("/events", events.expressMiddleware());
app.use("/interactions", interactions.expressMiddleware());

/*app.use("/events", bodyParser.json());
app.use("/interactions", bodyParser.urlencoded({extended:false}));*/

events.on("message", event=>{
    console.log("DEBUG : Received message : ",event.text," from user : ",event.user);
    console.log("DEBUG : ", event);
    if (event.user)
        handler.on.message(event);
});

/*interactions.action({type:"button"}, interaction=>{
    console.log("DEBUG : Received action : ",interaction.actions," from user : ",interaction.user.id);
    console.log("DEBUG : ", interaction);
});*/

interactions.action({}, (interaction, response)=>{
    console.log("DEBUG : Received action : ",interaction.actions," from user : ",interaction.user.id);
    console.log("DEBUG : ", interaction);
    switch (interaction.type) {
        case "block_actions":
            handler.on.block_interaction(interaction, response);
            break;
        case "interactive_message":
            handler.on.attachment_interaction(interaction, response);
            break;
        default:
            console.log("ERROR : Unrecognized interaction type received : ", interaction.type);
    }

});

const port = process.env.PORT || 3000;
require("http").createServer(app).listen(port, ()=>{
    console.log("INFO : Server started at port "+port);
});