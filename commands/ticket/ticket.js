const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ChannelType, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ticket")
        .setDescription("Mengatur sistem tiket.")
        .addSubcommand(subcommand =>
            subcommand
                .setName("setup")
                .setDescription("Mengirim panel pembuatan tiket.")
                .addChannelOption(option =>
                    option.setName("channel")
                        .setDescription("Channel tempat panel tiket akan dikirim.")
                        .setRequired(true)
                        .addChannelTypes(ChannelType.GuildText))),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "setup") {
            const channel = interaction.options.getChannel("channel");

            const embed = new EmbedBuilder()
                .setTitle("Pusat Bantuan NarwHall MC")
                .setDescription("Silakan pilih kategori di bawah ini untuk membuka tiket bantuan. Staff kami akan segera merespon.\n\n" +
                                "⚠️ **Gunakan hanya dalam keadaan tertentu seperti:**\n" +
                                "> ( Pembelian, Melaporkan Pemain, Melaporkan Bug, Dan kesalahan sistem )\n\n" +
                                "✅ **Tunggu sampai staff merespon (Jangan Spamming)**\n" +
                                "✅ **Deskripsikan keluhan anda dengan jelas**")
                .setColor("Blue")
                .setFooter({ text: "Sistem Tiket Otomatis • NarwHall MC" })
                .setTimestamp();

            const select = new StringSelectMenuBuilder()
                .setCustomId('ticket_category_select')
                .setPlaceholder('Pilih kategori masalah Anda di sini...')
                .addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Laporan Player Abuse')
                        .setDescription('Laporkan pemain nakal atau melanggar aturan.')
                        .setEmoji('🚫')
                        .setValue('player_abuse'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Laporan Bug')
                        .setDescription('Laporkan masalah teknis atau bug di server.')
                        .setEmoji('🐛')
                        .setValue('bug_report'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Masalah General')
                        .setDescription('Pertanyaan umum atau bantuan lainnya.')
                        .setEmoji('❓')
                        .setValue('general_issue'),
                );

            const row = new ActionRowBuilder().addComponents(select);

            await channel.send({ embeds: [embed], components: [row] });

            await interaction.reply({ content: `Panel tiket berhasil dikirim di ${channel}.`, ephemeral: true });
        }
    },
};
