import express from "express";
import {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
  MessageComponentTypes,
  ButtonStyleTypes,
} from "discord-interactions";
import {
  VerifyDiscordRequest,
  getRandomEmoji,
  DiscordRequest,
} from "./utils.js";
import {
  PAT_COMMAND,
  EMOTIONAL_SUPPORT_COMMAND,
  TRACK_COMMAND,
  HasGuildCommands,
} from "./commands.js";
import fs from 'fs';

//create require
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const {
  Client,
  Events,
  GatewayIntentBits,
  IntentsBitField,
  EmbedBuilder,
  SlashCommandBuilder,
} = require("discord.js");
const { token } = require("./config.json");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions
  ],
});

var tracking;
const karutaUID = 646937666251915264; //karuta bot id

client.once("ready", () => {
  console.log(`Ready! Logged in as ${client.user.tag}`);
  tracking = JSON.parse(fs.readFileSync('./track.json'));
});

// console.log(tracking.tracking.channel);
// const channel = client.channels.cache.find(tracking.tracking.channel);
// console.log(channel);

client.on("messageCreate", (message) => {
  if(message.author.id === '646937666251915264' && (message.channelId === tracking.tracking.channel) && (tracking.tracking.event === 'vday')){
    const channel = message.client.channels.cache.find(channel => channel.id === tracking.tracking.channel);
    
    const reactor = message.author.id;
    //channel.send('hi <@&1073409722335633490>'); // blossom
    //channel.send('hi <@&1073409614625914940>'); // rose
    //channel.send('hi <@&1073409651850350622>'); // sunflower
    //channel.send('hi <@&1073409677376880742>'); // tulip
    
    const filter = (reaction, user) => {
        console.log(user)
          return ['🌼','🌹','💐','🌻','🌷'].includes(reaction.emoji.name) && user.id === karutaUID;
    };

    message.awaitReactions({ filter, max: 5, time: 10000, errors: ['time'] })
        .then(collected => console.log('Collecting things...'))
        .catch(collected => {
          console.log('reactions claimed');
          if(collected.first()){
            switch(collected.first().emoji.name) {
              case '🌼':
                channel.send('A <@&1073409722335633490> has dropped!')
                //channel.send('Blossom has dropped!')
                break;
              case '🌹':
                channel.send('A <@&1073409614625914940> has dropped!')
                //channel.send('Rose has dropped!')
                break;
              case '🌻':
                channel.send('A <@&1073409651850350622> has dropped!')
                //channel.send('Sunflower has dropped!')
                break;
              case '🌷':
                channel.send('A <@&1073409677376880742> has dropped!')
                //channel.send('Tulip has dropped!')
                break;
              default:
                channel.send('A bouquet of <@&1073409677376880742>s, <@&1073409722335633490>s, <@&1073409614625914940>s,and <@&1073409651850350622>s has dropped!')
              }
          }
        });
   }
});

// Login to Discord with your client's token
client.login(token);

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 */
app.post("/interactions", async function (req, res) {
  // Interaction type and data
  const { type, id, data } = req.body;

  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    console.log(req.body);

    // "emotionalsupport" guild command
    if (name === "emotionalsupport") {
      // Send a message into the channel where command was triggered from
      let nickname = req.body.member.nick
        ? req.body.member.nick
        : req.body.member.user.username;

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "There there " + nickname + ", everything will be okay.",
        },
      });
    }

    // "pat" guild command
    if (name === "pat") {
      // Send a message into the channel where command was triggered from

      let nickname = req.body.member.nick
        ? req.body.member.nick
        : req.body.member.user.username;
      const description =
        "There there " + nickname + ", everything will be okay.";

      const esEmbed = new EmbedBuilder()
        .setColor(0xc55000)
        .setTitle(description)
        .setImage("https://i.imgur.com/RYg23Nz.gif");

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          embeds: [esEmbed],
        },
      });
    }

    if (name === "track") {
      let channel = req.body.channel_id;
      let event = req.body.data.options[0].value;
            
      if (tracking.tracking.event === event && channel === tracking.tracking.channel){
        return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: "This channel is already being tracked for the "+event+" event.",
          },
        });
      } 
      
      tracking.tracking.channel = channel;
      tracking.tracking.event = event;

      const jsonString = JSON.stringify(tracking, null, 2);
      fs.writeFile('./track.json', jsonString, err => {
        if (err) return console.log(err);
      });
      
      if (event === "none"){
        return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: "Tracking disabled",
          },
        });
      }

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "This channel is now being tracked for the "+ event + " event.",
        },
      });
    }

    // "custom report" command
    //     if (name === 'report') {
    //       let ftUserId = req.body.data.options[0].value;
    //       ftUserId = client.users.fetch(ftUserId);
    //       console.log(req.body.guild_id)
    //       const crewMember = client.fetchGuildPreview(req.body.guild_id);
    //       console.log(crewMember);

    //       ftUserId.then(value => {

    //         console.log(value);

    //         return res.send({
    //         type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    //         data: {
    //           content: 'Are you sure you want to report ' + value.username + '?',
    //         }
    //       });

    //       });
    //     }
    else {
      
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "Gude doesn't know what you want. Sorry!",
        },
      });
    }
  }
});

app.listen(PORT, () => {
  console.log("Listening on port", PORT);
  // Check if guild commands from commands.json are installed (if not, install them)
  HasGuildCommands(process.env.APP_ID, process.env.GUILD_ID, [
    EMOTIONAL_SUPPORT_COMMAND,
    PAT_COMMAND,
    TRACK_COMMAND,
  ]);
});