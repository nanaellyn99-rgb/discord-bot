const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits, StringSelectMenuBuilder } = require("discord.js");

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
                        .addChannelTypes(ChannelType.GuildText)))
        .addSubcommand(subcommand =>
            subcommand
                .setName("close")
                .setDescription("Menutup tiket yang sedang aktif.")),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "setup") {
            const channel = interaction.options.getChannel("channel");

            const embed = new EmbedBuilder()
                .setTitle("Sistem Tiket")
                .setDescription("Klik tombol di bawah untuk membuat tiket baru dan pilih kategori masalah Anda.")
                .setColor("Blue");

            const button = new ButtonBuilder()
                .setCustomId("open_ticket_panel") // Custom ID diubah untuk memicu select menu
                .setLabel("Buat Tiket")
                .setStyle(ButtonStyle.Primary)
                .setEmoji("🎫");

            const row = new ActionRowBuilder()
                .addComponents(button);

            await channel.send({ embeds: [embed], components: [row] });

            await interaction.reply({ content: `Panel tiket berhasil dikirim di ${channel}.`, ephemeral: true });
        } else if (subcommand === "close") {
            // Logika untuk menutup tiket sudah ada di interactionCreate.js
            await interaction.reply({ content: 'Gunakan tombol "Tutup Tiket" di channel tiket untuk menutupnya.', ephemeral: true });
        }
    },
};
