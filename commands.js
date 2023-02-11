import { capitalize, DiscordRequest } from './utils.js';
import { SlashCommandBuilder } from '@discordjs/builders';

export async function HasGuildCommands(appId, guildId, commands) {
  if (guildId === '' || appId === '') return;

  commands.forEach((c) => HasGuildCommand(appId, guildId, c));
}

// Checks for a command
async function HasGuildCommand(appId, guildId, command) {
  // API endpoint to get and post guild commands
  const endpoint = `applications/${appId}/guilds/${guildId}/commands`;

  try {
    const res = await DiscordRequest(endpoint, { method: 'GET' });
    const data = await res.json();

    if (data) {
      const installedNames = data.map((c) => c['name']);
      // This is just matching on the name, so it's not good for updates
      if (!installedNames.includes(command['name'])) {
        console.log(`Installing "${command['name']}"`);
        InstallGuildCommand(appId, guildId, command);
      }  else {
        InstallGuildCommand(appId, guildId, command);
        console.log(`"${command['name']}" command already installed but update anyways`);
      }
    }
  } catch (err) {
    console.error(err);
  }
}

// Installs a command
export async function InstallGuildCommand(appId, guildId, command) {
  // API endpoint to get and post guild commands
  const endpoint = `applications/${appId}/guilds/${guildId}/commands`;
  // install command
  try {
    await DiscordRequest(endpoint, { method: 'POST', body: command });
  } catch (err) {
    console.error(err);
  }
}

// Simple test command
export const EMOTIONAL_SUPPORT_COMMAND = {
  name: 'emotionalsupport',
  description: 'Emotional support command',
  type: 1,
};

export const PAT_COMMAND = {
  name: 'pat',
  description: 'pat command',
  type: 1,
};

export const TRACK_COMMAND = {
  name: 'track',
  description: 'track command',
  "default_member_permissions": "0",
  options: [
    {
      "type": 3,
      "name": "event",
      "description": "Event to track",
      "required": true,
      "choices": [
        {
          "name": "vday",
          "value": "vday"
        },
        {
          "name": "none",
          "value": "none"
        }
      ]
    }
  ]
};
