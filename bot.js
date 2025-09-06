import { Client, GatewayIntentBits, Events } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

// Minimal bot configuration for the 1A timeout feature
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

// 1A Feature: when a user replies with exactly "1A", timeout the replied-to user for 1 minute

// Bot ready event
client.once(Events.ClientReady, async () => {
  console.log(`✅ Bot is ready! Logged in as ${client.user.tag}`);
});

// Message handler - 1A reply action
client.on(Events.MessageCreate, async (message) => {
  try {
    // Ignore bots
    if (message.author.bot) return;

    // Must be a reply and exactly "1A"
    if (!message.reference) return;
    if (message.content !== '1A') return;

    const { guild } = message;
    if (!guild) return;

    // Identify the replied-to user
    const repliedUserId = message.reference.messageId
      ? (await message.fetchReference()).author.id
      : message.mentions.repliedUser?.id;

    if (!repliedUserId) {
      return;
    }

    // Fetch the member to timeout
    const targetMember = await guild.members.fetch(repliedUserId).catch(() => null);
    if (!targetMember) {
      await message.reply('Could not find that guy');
      return;
    }

    // Attempt 1 minute timeout
    const durationMs = 60 * 1000;
    await targetMember.timeout(durationMs, `1A invoked by ${message.author.tag}`).catch(async (err) => {
      console.error('❌ Error applying timeout:', err);
      await message.reply('https://tenor.com/view/screaming-lex-luthor-superman-aaah-raging-gif-11297985997473498830');
      throw err; // stop further actions
    });

    // Send the GIF, then confirmation message
    const gifUrl = 'https://tenor.com/view/1a-lex-luthor-superman-nicholas-hoult-directive-gif-4999344869440911527';
    await message.channel.send(gifUrl);
    await message.channel.send(`<@${repliedUserId}> has been 1A'ed for 1 minute`);
  } catch (e) {
    // already handled/logged above where relevant
  }
});

// Enhanced error handling
client.on('error', (error) => {
  console.error('❌ Discord client error:', error);
});

// Login with bot token
const token = process.env.DISCORD_BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE';

if (token === 'YOUR_BOT_TOKEN_HERE') {
  console.error('❌ Please set your Discord bot token in the DISCORD_BOT_TOKEN environment variable or replace YOUR_BOT_TOKEN_HERE in the code');
  process.exit(1);
}

client.login(token);
