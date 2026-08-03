const { REST, Routes } = require("discord.js");
const dotenv = require("dotenv");

dotenv.config();

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        if (!process.env.CLIENT_ID) {
            console.error("ERROR: CLIENT_ID tidak ditemukan di environment variables!");
            return;
        }

        console.log("Menghapus semua perintah (/) global...");

        // Untuk perintah global, gunakan Routes.applicationCommands(CLIENT_ID)
        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: [] });

        console.log("BERHASIL: Semua perintah (/) global telah dihapus.");
    } catch (error) {
        console.error("GAGAL menghapus perintah:");
        console.error(error);
    }
})();
