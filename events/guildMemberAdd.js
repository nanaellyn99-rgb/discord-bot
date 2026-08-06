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
            ctx.fillStyle = "#2c2f33";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Avatar (Lingkaran di Tengah)
        const avatarSize = 250;
        const avatarX = canvas.width / 2;
        const avatarY = 160;
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

        // Border Avatar Putih (Lebih Tebal)
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.arc(avatarX, avatarY, avatarRadius + 5, 0, Math.PI * 2, true);
        ctx.stroke();

        // Gaya teks
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        
        // Shadow untuk teks agar mirip contoh
        ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;

        // Teks WELCOME (Font lebih tebal)
        ctx.font = "bold 110px Impact, sans-serif";
        ctx.fillText("WELCOME", canvas.width / 2, 360);

        // Nama Member
        ctx.font = "bold 60px Impact, sans-serif";
        ctx.fillText(member.user.username.toUpperCase(), canvas.width / 2, 425);

        // Teks Bawah + Emoji (Sesuai contoh gambar)
        ctx.font = "bold 35px Impact, sans-serif";
        const subText = `SELAMAT DATANG DI ${member.guild.name.toUpperCase()} 🦞🐬`;
        ctx.fillText(subText, canvas.width / 2, 480);

        const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: "welcome-image.png" });

        const welcomeMessage = `🦞 Hai <@${member.id}>! Selamat datang di **${member.guild.name}** 🐬, Semoga kamu betah ya!\n` +
                               `Patuhi Semua Rules, Di server ini kami benar benar menjaga kenyamanan!\n` +
                               `Jangan lupa say hi dengan semua orang, Enjoy 🤗`;

        channel.send({ content: welcomeMessage, files: [attachment] });
    },
};
