const { Events, AttachmentBuilder } = require("discord.js");
const { createCanvas, loadImage } = require("canvas");
const path = require("path");

module.exports = {
    name: Events.GuildMemberRemove,
    async execute(member) {
        if (member.user.bot) return; // Abaikan bot

        const goodbyeChannelId = process.env.GOODBYE_CHANNEL_ID;
        if (!goodbyeChannelId) return console.log("GOODBYE_CHANNEL_ID tidak diatur di .env");

        let channel = member.guild.channels.cache.get(goodbyeChannelId);
        if (!channel) {
            try {
                channel = await member.guild.channels.fetch(goodbyeChannelId);
            } catch (err) {
                return console.log(`Channel goodbye dengan ID ${goodbyeChannelId} tidak ditemukan atau bot tidak punya akses.`);
            }
        }
        if (!channel) return console.log(`Channel goodbye dengan ID ${goodbyeChannelId} tidak ditemukan.`);

        const canvas = createCanvas(1280, 720); // Ukuran gambar
        const ctx = canvas.getContext("2d");

        // Load background image
        const background = await loadImage(path.join(__dirname, "..", "goodbye-bg.png"));
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        // Gaya teks
        ctx.fillStyle = "#ffffff";
        ctx.font = "60px sans-serif";
        ctx.textAlign = "center";

        // Teks Selamat Tinggal
        ctx.fillText("SELAMAT JALAN", canvas.width / 2, canvas.height / 2 - 100);

        // Nama Member
        ctx.font = "80px sans-serif";
        ctx.fillText(member.user.username.toUpperCase(), canvas.width / 2, canvas.height / 2);

        // Jumlah Member
        ctx.font = "40px sans-serif";
        ctx.fillText(`Kami sekarang memiliki ${member.guild.memberCount} member`, canvas.width / 2, canvas.height / 2 + 70);

        // Avatar
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2 + 200, 100, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();

        const avatar = await loadImage(member.user.displayAvatarURL({ extension: "png", size: 256 }));
        ctx.drawImage(avatar, canvas.width / 2 - 100, canvas.height / 2 + 100, 200, 200);

        const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: "goodbye-image.png" });

        channel.send({ content: `Sampai jumpa lagi, **${member.user.username}**!`, files: [attachment] });
    },
};
