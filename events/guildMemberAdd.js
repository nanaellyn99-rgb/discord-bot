const { Events, AttachmentBuilder } = require("discord.js");
const { createCanvas, loadImage, registerFont } = require("canvas");
const path = require("path");

// Daftarkan font kustom
registerFont(path.join(__dirname, "..", "fonts", "AsteroidBlaster.ttf"), { family: "AsteroidBlaster" });

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        if (member.user.bot) return;

        const welcomeChannelId = process.env.WELCOME_CHANNEL_ID;
        if (!welcomeChannelId) return console.log("WELCOME_CHANNEL_ID tidak diatur di .env");

        let channel = member.guild.channels.cache.get(welcomeChannelId);
        if (!channel) {
            try {
                channel = await member.guild.channels.fetch(welcomeChannelId);
            } catch (err) {
                return console.log(`Channel welcome tidak ditemukan.`);
            }
        }
        if (!channel) return;

        const canvas = createCanvas(1024, 500);
        const ctx = canvas.getContext("2d");

        // Load background
        try {
            const background = await loadImage(path.join(__dirname, "..", "welcome-bg.png"));
            ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
        } catch (err) {
            ctx.fillStyle = "#2c2f33";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Avatar
        const avatarSize = 240;
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
            console.error("Avatar error:", err);
        }
        ctx.restore();

        // Border Avatar
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(avatarX, avatarY, avatarRadius + 5, 0, Math.PI * 2, true);
        ctx.stroke();

        // --- STYLING TEKS DENGAN FONT KUSTOM ---
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        
        const drawStyledText = (text, x, y, font) => {
            ctx.font = font;
            ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
            ctx.shadowBlur = 8;
            ctx.shadowOffsetX = 3;
            ctx.shadowOffsetY = 3;
            ctx.fillText(text, x, y);
            ctx.shadowBlur = 0; // Reset shadow
        };

        // 1. Teks WELCOME (Besar)
        drawStyledText("WELCOME", canvas.width / 2, 365, "90px AsteroidBlaster");

        // 2. Nama Member (Lebih Kecil dari WELCOME)
        const username = member.user.username.toUpperCase();
        let nameFontSize = 55;
        ctx.font = `${nameFontSize}px AsteroidBlaster`;
        // Auto-scale jika kepanjangan
        while (ctx.measureText(username).width > canvas.width - 150 && nameFontSize > 20) {
            nameFontSize -= 5;
            ctx.font = `${nameFontSize}px AsteroidBlaster`;
        }
        drawStyledText(username, canvas.width / 2, 425, ctx.font);

        // 3. Teks Bawah (Paling Kecil)
        const serverName = member.guild.name.toUpperCase();
        const subText = `SELAMAT DATANG DI ${serverName} 🦞🐬`;
        let subFontSize = 28;
        ctx.font = `${subFontSize}px AsteroidBlaster`;
        while (ctx.measureText(subText).width > canvas.width - 100 && subFontSize > 15) {
            subFontSize -= 2;
            ctx.font = `${subFontSize}px AsteroidBlaster`;
        }
        drawStyledText(subText, canvas.width / 2, 475, ctx.font);

        const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: "welcome-image.png" });

        const welcomeMessage = `🦞 Hai <@${member.id}>! Selamat datang di **${member.guild.name}** 🐬, Semoga kamu betah ya!\n` +
                               `Patuhi Semua Rules, Di server ini kami benar benar menjaga kenyamanan!\n` +
                               `Jangan lupa say hi dengan semua orang, Enjoy 🤗`;

        channel.send({ content: welcomeMessage, files: [attachment] });
    },
};
