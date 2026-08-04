const { Events, AttachmentBuilder } = require("discord.js");
const { createCanvas, loadImage } = require("canvas");
const path = require("path");

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        if (member.user.bot) return; // Abaikan bot

        const welcomeChannelId = process.env.WELCOME_CHANNEL_ID;
        if (!welcomeChannelId) return console.log("WELCOME_CHANNEL_ID tidak diatur di .env");

        const channel = member.guild.channels.cache.get(welcomeChannelId);
        if (!channel) return console.log(`Channel welcome dengan ID ${welcomeChannelId} tidak ditemukan.`);

        const canvas = createCanvas(1280, 720); // Ukuran gambar
        const ctx = canvas.getContext("2d");

        // Load background image
        const background = await loadImage(path.join(__dirname, "..", "welcome-bg.png"));
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        // Gaya teks
        ctx.fillStyle = "#ffffff";
        ctx.font = "60px sans-serif";
        ctx.textAlign = "center";

        // Teks Selamat Datang
        ctx.fillText("SELAMAT DATANG", canvas.width / 2, canvas.height / 2 - 100);

        // Nama Member
        ctx.font = "80px sans-serif";
        ctx.fillText(member.user.username.toUpperCase(), canvas.width / 2, canvas.height / 2);

        // Jumlah Member
        ctx.font = "40px sans-serif";
        ctx.fillText(`Anda adalah member ke-${member.guild.memberCount}`, canvas.width / 2, canvas.height / 2 + 70);

        // Avatar
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2 + 200, 100, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();

        const avatar = await loadImage(member.user.displayAvatarURL({ extension: "png", size: 256 }));
        ctx.drawImage(avatar, canvas.width / 2 - 100, canvas.height / 2 + 100, 200, 200);

        const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: "welcome-image.png" });

        channel.send({ content: `Halo <@${member.id}>, selamat datang di **${member.guild.name}**!`, files: [attachment] });
    },
};
