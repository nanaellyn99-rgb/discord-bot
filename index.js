const { Client, GatewayIntentBits, Collection, Events } = require('discord.js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

client.commands = new Collection();

// Memuat Commands
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        }
    }
}

// Memuat Events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

// Logging Debug saat Bot Ready
client.once(Events.ClientReady, c => {
    console.log('==========================================');
    console.log(`STATUS: Bot Berhasil Login sebagai ${c.user.tag}`);
    console.log(`CLIENT ID: ${c.user.id}`);
    console.log(`JUMLAH SERVER: ${client.guilds.cache.size}`);
    
    console.log('DAFTAR SERVER YANG DIMASUKI:');
    client.guilds.cache.forEach(guild => {
        console.log(`- ${guild.name} (ID: ${guild.id})`);
    });
    
    if (process.env.CLIENT_ID !== c.user.id) {
        console.warn('PERINGATAN: CLIENT_ID di .env TIDAK COCOK dengan ID Bot yang sedang login!');
        console.warn(`Di .env: ${process.env.CLIENT_ID}`);
        console.warn(`Asli Bot: ${c.user.id}`);
    }
    
    console.log('==========================================');
});

// Fallback: Respon pesan biasa (untuk tes jika slash command gagal)
client.on(Events.MessageCreate, message => {
    if (message.content === '!testbot') {
        message.reply('Bot aktif dan bisa membaca pesan! Jika slash command (/) tidak muncul, berarti masalah ada pada pendaftaran atau izin applications.commands.');
    }
});

client.login(process.env.DISCORD_TOKEN);
