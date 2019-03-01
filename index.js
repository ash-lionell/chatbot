const { createEventAdapter } = require('@slack/events-api');
const SLACK_SIGNING_SECRET = "0fad7c52aff0ef890834d32040064ab6";
const events = createEventAdapter(SLACK_SIGNING_SECRET);

const { WebClient } = require('@slack/client');
const SLACK_TOKEN = "xoxp-148733971857-449242100449-557187283716-abd3ad6ba82dc50c48cdd80d91a0edc3";
const BOT_TOKEN = "xoxb-148733971857-556658577345-QbH4JyuiQJrkONWEMiQC4Bhp";
const client = new WebClient(BOT_TOKEN);

const port = process.env.PORT || 3000;