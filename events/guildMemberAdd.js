const { Events, AttachmentBuilder } = require("discord.js");
const { createCanvas, loadImage } = require("canvas");
const path = require("path");

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

        // Border Avatar (Lebih Halus)
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(avatarX, avatarY, avatarRadius + 5, 0, Math.PI * 2, true);
        ctx.stroke();

        // --- STYLING TEKS (ANTI-FLAT) ---
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        
        // Fungsi untuk memberikan efek glow/shadow agar tidak flat
        const drawTextWithStyle = (text, x, y, font) => {
            ctx.font = font;
            // Shadow Layer (Outer Glow)
            ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
            ctx.shadowBlur = 7;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            ctx.fillText(text, x, y);
            
            // Reset shadow untuk layer berikutnya (opsional, untuk ketajaman)
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
        };

        // Helper untuk font dinamis (Montserrat)
        const getFont = (text, baseSize, maxWidth) => {
            let size = baseSize;
            do {
                ctx.font = `bold ${size}px Montserrat, sans-serif`;
                if (ctx.measureText(text).width < maxWidth) break;
                size -= 2;
            } while (size > 20);
            return ctx.font;
        };

        // 1. Teks WELCOME (Montserrat Bold)
        drawTextWithStyle("WELCOME", canvas.width / 2, 365, "bold 95px Montserrat, sans-serif");

        // 2. Nama Member (Auto-scale)
        const username = member.user.username.toUpperCase();
        const nameFont = getFont(username, 60, canvas.width - 150);
        drawTextWithStyle(username, canvas.width / 2, 425, nameFont);

        // 3. Teks Bawah
        const serverName = member.guild.name.toUpperCase();
        const subText = `SELAMAT DATANG DI ${serverName} 🦞🐬`;
        const subFont = getFont(subText, 32, canvas.width - 100);
        drawTextWithStyle(subText, canvas.width / 2, 475, subFont);

        const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: "welcome-image.png" });

        const welcomeMessage = `🦞 Hai <@${member.id}>! Selamat datang di **${member.guild.name}** 🐬, Semoga kamu betah ya!\n` +
                               `Patuhi Semua Rules, Di server ini kami benar benar menjaga kenyamanan!\n` +
                               `Jangan lupa say hi dengan semua orang, Enjoy 🤗`;

        channel.send({ content: welcomeMessage, files: [attachment] });
    },
};
