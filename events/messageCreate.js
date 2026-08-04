const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        // Abaikan pesan dari bot lain atau pesan bot itu sendiri
        if (message.author.bot) return;

        const content = message.content.toLowerCase();

        // Daftar kata kunci untuk Tutorial Lands
        const landsKeywords = ['land', 'lands', 'claim'];

        // Cek jika pesan mengandung salah satu kata kunci di atas
        if (landsKeywords.some(keyword => content.includes(keyword))) {
            const landsEmbed = new EmbedBuilder()
                .setTitle("🔰 Tutorial Lands (Proteksi Tanah)")
                .setDescription("Sepertinya Anda bertanya tentang cara melindungi area. Berikut adalah panduan singkat plugin Lands:")
                .addFields(
                    { name: "📍 Cara Membuat Land", value: "Ketik `/lands create <nama>` untuk membuat area land baru.", inline: false },
                    { name: "🚩 Cara Claim Area", value: "Berdiri di area yang ingin di-claim, lalu ketik `/lands claim`.", inline: false },
                    { name: "👥 Menambahkan Teman (Trust)", value: "Ketik `/lands trust <nama_pemain>` agar teman bisa membangun di land Anda.", inline: false },
                    { name: "⚙️ Menu Utama", value: "Ketik `/lands menu` untuk membuka pengaturan land melalui GUI.", inline: false },
                    { name: "💰 Tips", value: "Pastikan Anda memiliki cukup uang (in-game money) untuk melakukan claim.", inline: false }
                )
                .setColor("#f1c40f")
                .setThumbnail("https://cdn-icons-png.flaticon.com/512/609/609803.png")
                .setFooter({ text: "Ketik pertanyaan lain jika butuh bantuan! • NarwHall MC" })
                .setTimestamp();

            return message.reply({ embeds: [landsEmbed] });
        }
    },
};
