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
                return console.log(`Channel welcome dengan ID ${welcomeChannelId} tidak ditemukan.`);
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
        const avatarSize = 230;
        const avatarX = canvas.width / 2;
        const avatarY = 165;
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
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.arc(avatarX, avatarY, avatarRadius + 5, 0, Math.PI * 2, true);
        ctx.stroke();

        // Gaya Teks (Mirip Font Discord/Koya)
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        
        // Helper function untuk teks yang tidak overload
        const applyText = (canvas, text, fontSize) => {
            const ctx = canvas.getContext("2d");
            let size = fontSize;
            do {
                ctx.font = `bold ${size -= 5}px sans-serif`;
            } while (ctx.measureText(text).width > canvas.width - 100);
            return ctx.font;
        };

        // 1. Teks WELCOME
        ctx.font = "bold 85px sans-serif";
        ctx.fillText("WELCOME", canvas.width / 2, 365);

        // 2. Nama Member (Auto-scale jika kepanjangan)
        const username = member.user.username.toUpperCase();
        ctx.font = applyText(canvas, username, 65);
        ctx.fillText(username, canvas.width / 2, 425);

        // 3. Teks Bawah
        const subText = `SELAMAT DATANG DI ${member.guild.name.toUpperCase()} 🦞🐬`;
        ctx.font = applyText(canvas, subText, 35);
        ctx.fillText(subText, canvas.width / 2, 475);

        const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: "welcome-image.png" });

        const welcomeMessage = `🦞 Hai <@${member.id}>! Selamat datang di **${member.guild.name}** 🐬, Semoga kamu betah ya!\n` +
                               `Patuhi Semua Rules, Di server ini kami benar benar menjaga kenyamanan!\n` +
                               `Jangan lupa say hi dengan semua orang, Enjoy 🤗`;

        channel.send({ content: welcomeMessage, files: [attachment] });
    },
};
