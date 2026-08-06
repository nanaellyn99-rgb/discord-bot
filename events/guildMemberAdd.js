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

        // Ukuran canvas sesuai contoh (1024x500)
        const canvas = createCanvas(1024, 500);
        const ctx = canvas.getContext("2d");

        // Load background image
        try {
            const background = await loadImage(path.join(__dirname, "..", "welcome-bg.png"));
            ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
        } catch (err) {
            console.error("Gagal memuat background image:", err);
            // Fallback warna jika gambar gagal dimuat
            ctx.fillStyle = "#2c2f33";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Avatar (Lingkaran di Tengah Atas)
        const avatarSize = 220;
        const avatarX = canvas.width / 2;
        const avatarY = 175;
        const avatarRadius = avatarSize / 2;

        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        
        try {
            const avatarURL = member.user.displayAvatarURL({ extension: "png", size: 512 });
            const avatar = await loadImage(avatarURL);
            ctx.drawImage(avatar, avatarX - avatarRadius, avatarY - avatarRadius, avatarSize, avatarSize);
        } catch (err) {
            console.error("Gagal memuat avatar:", err);
        }
        ctx.restore();

        // Border Avatar Putih
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(avatarX, avatarY, avatarRadius + 4, 0, Math.PI * 2, true);
        ctx.stroke();

        // Gaya teks
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        // Teks WELCOME
        ctx.font = "bold 90px sans-serif";
        ctx.fillText("WELCOME", canvas.width / 2, 370);

        // Nama Member
        ctx.font = "bold 50px sans-serif";
        ctx.fillText(member.user.username.toUpperCase(), canvas.width / 2, 430);

        // Teks Bawah
        ctx.font = "bold 30px sans-serif";
        ctx.fillText(`SELAMAT DATANG DI ${member.guild.name.toUpperCase()}`, canvas.width / 2, 480);

        const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: "welcome-image.png" });

        const welcomeMessage = `🦞 Hai <@${member.id}>! Selamat datang di **${member.guild.name}** 🐬, Semoga kamu betah ya!\n` +
                               `Patuhi Semua Rules, Di server ini kami benar benar menjaga kenyamanan!\n` +
                               `Jangan lupa say hi dengan semua orang, Enjoy 🤗`;

        channel.send({ content: welcomeMessage, files: [attachment] });
    },
};
