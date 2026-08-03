const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const dotenv = require('dotenv');

dotenv.config();

const commands = [];
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        }
    }
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        if (!process.env.CLIENT_ID) {
            console.error("ERROR: CLIENT_ID tidak ditemukan di environment variables!");
            return;
        }

        console.log(`Sedang mendaftarkan ${commands.length} perintah (/) secara GLOBAL...`);

        // Mendaftarkan perintah secara GLOBAL (bukan per-guild) agar lebih pasti muncul
        const data = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );

        console.log(`BERHASIL: ${data.length} perintah (/) telah terdaftar secara GLOBAL.`);
        console.log("Catatan: Perintah global mungkin butuh waktu beberapa menit untuk muncul di semua server.");
    } catch (error) {
        console.error("GAGAL mendaftarkan perintah:");
        console.error(error);
    }
})();
