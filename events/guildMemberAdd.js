const { Events, AttachmentBuilder } = require("discord.js");
const { createCanvas, loadImage } = require("canvas");
const path = require("path");

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        if (member.user.bot) return; // Abaikan bot

        const welcomeChannelId = process.env.WELCOME_CHANNEL_ID;
        if (!welcomeChannelId) return console.log("WELCOME_CHANNEL_ID tidak diatur di .env");

        let channel = member.guild.channels.cache.get(welcomeChannelId);
        if (!channel) {
            try {
                channel = await member.guild.channels.fetch(welcomeChannelId);
            } catch (err) {
                return console.log(`Channel welcome dengan ID ${welcomeChannelId} tidak ditemukan atau bot tidak punya akses.`);
            }
        }
        if (!channel) return console.log(`Channel welcome dengan ID ${welcomeChannelId} tidak ditemukan.`);

        const canvas = createCanvas(1280, 720); // Ukuran gambar
        const ctx = canvas.getContext("2d");

        // Load background image
        const background = await loadImage(path.join(__dirname, "..", "welcome-bg.png"));
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        // Avatar (Lingkaran di Tengah Atas)
        ctx.save();
        ctx.beginPath();
        ctx.arc(canvas.width / 2, 250, 150, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        const avatar = await loadImage(member.user.displayAvatarURL({ extension: "png", size: 512 }));
        ctx.drawImage(avatar, canvas.width / 2 - 150, 100, 300, 300);
        ctx.restore();

        // Overlay Lingkaran Putih (Border Avatar)
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, 250, 155, 0, Math.PI * 2, true);
        ctx.stroke();

        // Gaya teks
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";

        // Teks WELCOME (Besar)
        ctx.font = "bold 120px sans-serif";
        ctx.fillText("WELCOME", canvas.width / 2, 520);

        // Nama Member (Sedang)
        ctx.font = "60px sans-serif";
        ctx.fillText(member.user.username.toUpperCase(), canvas.width / 2, 600);

        // Teks Bawah (Kecil)
        ctx.font = "35px sans-serif";
        ctx.fillText(`SELAMAT DATANG DI ${member.guild.name.toUpperCase()} 🦞🐬`, canvas.width / 2, 670);

        const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: "welcome-image.png" });

        const welcomeMessage = `🦞 Hai <@${member.id}>! Selamat datang di **${member.guild.name}** 🐬, Semoga kamu betah ya!\n` +
                               `Patuhi Semua Rules, Di server ini kami benar benar menjaga kenyamanan!\n` +
                               `Jangan lupa say hi dengan semua orang, Enjoy 🤗`;

        channel.send({ content: welcomeMessage, files: [attachment] });
    },
};
