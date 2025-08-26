import { Client, GatewayIntentBits, Events } from 'discord.js';
import dotenv from 'dotenv';
import express from 'express';
dotenv.config();

// Bot configuration
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Configuration
const TARGET_BOT_ID = '1247028500590891088'; // Bot to monitor
const NOTIFICATION_CHANNEL_ID = '1409924425591292044'; // Channel to send notifications

// Bot ready event
client.once(Events.ClientReady, async () => {
    console.log(`✅ Bot is ready! Logged in as ${client.user.tag}`);
    console.log(`🎯 Monitoring for messages from bot ID: ${TARGET_BOT_ID}`);
    console.log(`📢 Will send notifications to channel ID: ${NOTIFICATION_CHANNEL_ID}`);
});

// Message handler - monitor for messages from target bot
client.on(Events.MessageCreate, async (message) => {
    // Check if message is from the target bot
    if (message.author.id === TARGET_BOT_ID) {
        console.log(`🤖 Detected message from target bot: ${message.author.tag}`);
        console.log(`📝 Message content: ${message.content}`);
        
        try {
            // Get the notification channel
            const notificationChannel = await client.channels.fetch(NOTIFICATION_CHANNEL_ID);
            
            if (!notificationChannel) {
                console.error(`❌ Could not find notification channel with ID: ${NOTIFICATION_CHANNEL_ID}`);
                return;
            }
            
            // Send the notification message
            await notificationChannel.send('<@&1364944237069598792> new report');
            console.log(`✅ Sent notification to channel: ${notificationChannel.name}`);
            
        } catch (error) {
            console.error('❌ Error sending notification:', error);
        }
    }
});

// Enhanced error handling
client.on('error', (error) => {
    console.error('❌ Discord client error:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled promise rejection:', error);
});

process.on('uncaughtException', (error) => {
    console.error('❌ CRITICAL: Uncaught exception detected!');
    console.error('🔍 DEBUG: Exception details:', error);
    console.log('🔄 Attempting graceful shutdown...');
    process.exit(1);
});

process.on('SIGTERM', () => {
    console.log('🛑 Received SIGTERM, shutting down gracefully...');
    client.destroy();
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 Received SIGINT, shutting down gracefully...');
    client.destroy();
    process.exit(0);
});

// Login with bot token
const token = process.env.DISCORD_BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE';

if (token === 'YOUR_BOT_TOKEN_HERE') {
    console.error('❌ Please set your Discord bot token in the DISCORD_BOT_TOKEN environment variable or replace YOUR_BOT_TOKEN_HERE in the code');
    process.exit(1);
}

client.login(token);

const app = express();
app.get('/', (req, res) => res.send('Bot is alive.'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Keep-alive server running on port ${PORT}`);
});
