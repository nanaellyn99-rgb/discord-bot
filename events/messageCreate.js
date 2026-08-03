const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        // Abaikan pesan dari bot lain atau pesan bot itu sendiri
        if (message.author.bot) return;

        const content = message.content.toLowerCase();

        // 1. Tutorial Claim Lands
        if (content.includes('claim') && content.includes('lands')) {
            const landsEmbed = new EmbedBuilder()
                .setTitle("🔰 Tutorial Claim Lands (Proteksi Tanah)")
                .setDescription("Berikut adalah cara untuk melindungi area Anda menggunakan plugin Lands di server kami:")
                .addFields(
                    { name: "📍 Cara Membuat Land", value: "Ketik `/lands create <nama>` untuk membuat area land baru.", inline: false },
                    { name: "🚩 Cara Claim Area", value: "Berdiri di area yang ingin di-claim, lalu ketik `/lands claim`.", inline: false },
                    { name: "👥 Menambahkan Teman (Trust)", value: "Ketik `/lands trust <nama_pemain>` agar teman bisa membangun di land Anda.", inline: false },
                    { name: "⚙️ Menu Utama", value: "Ketik `/lands menu` untuk membuka pengaturan land melalui GUI.", inline: false },
                    { name: "💰 Biaya", value: "Pastikan Anda memiliki cukup uang (in-game money) untuk melakukan claim.", inline: false }
                )
                .setColor("#f1c40f")
                .setThumbnail("https://cdn-icons-png.flaticon.com/512/609/609803.png") // Icon rumah/tanah
                .setFooter({ text: "Ketik pertanyaan lain jika butuh bantuan!" })
                .setTimestamp();

            return message.reply({ embeds: [landsEmbed] });
        }

        // Anda bisa menambahkan tutorial lain di sini dengan format yang sama:
        // if (content.includes('kata_kunci')) { ... }
    },
};
