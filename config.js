const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}
module.exports = {
SESSION_ID: process.env.SESSION_ID || "kyw3WCaT#Wjwm7u4VIscztkwk1kh20DYhHyN6UtLgM5LYlDG5zM0",
ALIVE_IMG: process.env.ALIVE_IMG || "https://github.com/aadil20072023/botdil/blob/main/images/welcome_dilbot.png?raw=true",
ALIVE_MSG: process.env.ALIVE_MSG || "*Hello👋DIL-BOT Is Alive Now😍*",
BOT_OWNER: '94725023747',  // Replace with the owner's phone number
AUTO_STATUS_SEEN: 'true',
AUTO_STATUS_REACT: 'true',



};
