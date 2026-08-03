const { Events, ChannelType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { createTranscript } = require("discord-html-transcripts");

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        // 1. Penanganan Slash Commands
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) return;

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'Terjadi kesalahan saat menjalankan perintah ini!', ephemeral: true }).catch(() => {});
            }
        } 
        
        // 2. Penanganan Tombol (Tutup & Klaim)
        else if (interaction.isButton()) {
            const { customId, channel, guild, member } = interaction;

            if (customId === 'close_ticket') {
                if (!member.roles.cache.has(process.env.STAFF_ROLE_ID) && channel.topic !== member.id) {
                    return interaction.reply({ content: "Hanya Staff atau pemilik tiket yang bisa menutup ini.", ephemeral: true });
                }

                await interaction.reply({ content: "Sedang menutup tiket dan menyimpan transkrip...", ephemeral: true });

                try {
                    const transcriptChannel = guild.channels.cache.get(process.env.TRANSCRIPT_CHANNEL_ID);
                    const transcript = await createTranscript(channel, { 
                        limit: -1, 
                        fileName: `transcript-${channel.name}.html`,
                    });

                    if (transcriptChannel) {
                        await transcriptChannel.send({
                            embeds: [new EmbedBuilder()
                                .setTitle("Tiket Ditutup")
                                .addFields(
                                    { name: "Channel", value: channel.name, inline: true },
                                    { name: "Pemilik", value: `<@${channel.topic}>`, inline: true },
                                    { name: "Ditutup Oleh", value: `<@${member.id}>`, inline: true }
                                )
                                .setColor("Red")
                                .setTimestamp()],
                            files: [transcript]
                        });
                    }
                    
                    setTimeout(() => channel.delete().catch(() => {}), 5000);
                } catch (err) {
                    console.error(err);
                }
            } 
            
            else if (customId === 'claim_ticket') {
                if (!member.roles.cache.has(process.env.STAFF_ROLE_ID)) {
                    return interaction.reply({ content: "Hanya Staff yang bisa mengklaim tiket.", ephemeral: true });
                }
                if (channel.name.includes("claimed")) {
                    return interaction.reply({ content: "Tiket ini sudah diklaim.", ephemeral: true });
                }

                await channel.setName(`claimed-${channel.name}`);
                await interaction.reply({ content: `Tiket ini telah diklaim oleh <@${member.id}>.` });
            }
        } 
        
        // 3. Penanganan Select Menu (Langsung Buat Tiket)
        else if (interaction.isStringSelectMenu()) {
            if (interaction.customId === 'ticket_category_select') {
                const category = interaction.values[0];
                const { guild, member } = interaction;

                // Cek apakah user sudah punya tiket
                const existing = guild.channels.cache.find(c => c.topic === member.id && c.name.includes("ticket"));
                if (existing) {
                    return interaction.reply({ content: `Anda sudah memiliki tiket terbuka di ${existing}.`, ephemeral: true });
                }

                // Respon awal agar tidak timeout
                await interaction.reply({ content: "Sedang membuatkan tiket untuk Anda...", ephemeral: true });

                let catLabel = category === 'player_abuse' ? 'Abuse' : category === 'bug_report' ? 'Bug' : 'General';

                try {
                    const ticketChannel = await guild.channels.create({
                        name: `ticket-${catLabel.toLowerCase()}-${member.user.username}`,
                        type: ChannelType.GuildText,
                        parent: process.env.TICKET_CATEGORY_ID,
                        topic: member.id,
                        permissionOverwrites: [
                            { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                            { id: member.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
                            { id: process.env.STAFF_ROLE_ID, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
                        ],
                    });

                    const embed = new EmbedBuilder()
                        .setTitle(`Tiket: ${catLabel}`)
                        .setDescription(`Halo <@${member.id}>, silakan jelaskan masalah Anda.\n\n**Kategori:** ${catLabel}\n**Staff:** <@&${process.env.STAFF_ROLE_ID}>`)
                        .setColor("Green")
                        .setTimestamp();

                    const row = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId("claim_ticket").setLabel("Klaim").setStyle(ButtonStyle.Success).setEmoji("🙋"),
                        new ButtonBuilder().setCustomId("close_ticket").setLabel("Tutup").setStyle(ButtonStyle.Danger).setEmoji("🔒")
                    );

                    await ticketChannel.send({ content: `<@${member.id}> | <@&${process.env.STAFF_ROLE_ID}>`, embeds: [embed], components: [row] });
                    await interaction.editReply({ content: `Tiket berhasil dibuat: ${ticketChannel}` });
                } catch (err) {
                    console.error(err);
                    await interaction.editReply({ content: "Gagal membuat channel tiket. Pastikan ID Kategori di .env sudah benar." });
                }
            }
        }
    },
};
