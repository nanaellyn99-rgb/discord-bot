const { Events, ChannelType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require("discord.js");
const { createTranscript } = require("discord-html-transcripts");

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                }
            }
        } else if (interaction.isButton()) {
            if (interaction.customId === 'open_ticket_panel') {
                await interaction.deferReply({ ephemeral: true });
                const select = new StringSelectMenuBuilder()
                    .setCustomId('ticket_category_select')
                    .setPlaceholder('Pilih kategori tiket Anda...')
                    .addOptions(
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Laporan Player Abuse / Nakal')
                            .setDescription('Laporkan pemain yang melanggar aturan atau berperilaku tidak pantas.')
                            .setValue('player_abuse'),
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Ada Bug')
                            .setDescription('Laporkan bug atau masalah teknis yang Anda temukan.')
                            .setValue('bug_report'),
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Ada Masalah General')
                            .setDescription('Pertanyaan umum atau masalah lain yang tidak termasuk kategori di atas.')
                            .setValue('general_issue'),
                    );

                const row = new ActionRowBuilder()
                    .addComponents(select);

                await interaction.editReply({ content: 'Silakan pilih kategori tiket Anda:', ephemeral: true, components: [row] });

            } else if (interaction.customId === 'close_ticket') {
                const channel = interaction.channel;
                const guild = interaction.guild;
                const member = interaction.member;

                // Hanya staff atau pembuat tiket yang bisa menutup tiket
                if (!member.roles.cache.has(process.env.STAFF_ROLE_ID) && channel.topic !== member.id) {
                    return interaction.reply({ content: "Anda tidak memiliki izin untuk menutup tiket ini.", ephemeral: true });
                }

                await interaction.deferReply({ ephemeral: true });

                const transcriptChannel = guild.channels.cache.get(process.env.TRANSCRIPT_CHANNEL_ID); // Channel untuk log transkrip
                if (!transcriptChannel) {
                    return interaction.followUp({ content: "Channel transkrip tidak ditemukan. Mohon hubungi administrator bot.", ephemeral: true });
                }

                const transcript = await createTranscript(channel, { 
                    limit: -1, // Ambil semua pesan
                    returnBuffer: false, // Mengembalikan path file
                    fileName: `ticket-${channel.name}.html`,
                });

                const transcriptMessage = await transcriptChannel.send({
                    files: [transcript],
                    embeds: [new EmbedBuilder()
                        .setTitle("Transkrip Tiket")
                        .setDescription(`Tiket ${channel.name} ditutup oleh ${member.user.tag}`)
                        .addFields(
                            { name: "Pengguna", value: `<@${channel.topic}>`, inline: true },
                            { name: "Ditutup Oleh", value: `<@${member.id}>`, inline: true },
                            { name: "Waktu Ditutup", value: new Date().toLocaleString(), inline: true }
                        )
                        .setColor("Red")]
                });

                await interaction.followUp({ content: `Tiket berhasil ditutup. Transkrip tersedia di ${transcriptChannel}.`, ephemeral: true });
                
                // Hapus channel setelah beberapa saat
                setTimeout(() => {
                    channel.delete().catch(console.error);
                }, 5000); // Hapus setelah 5 detik

            } else if (interaction.customId === 'claim_ticket') {
                const channel = interaction.channel;
                const member = interaction.member;

                if (!member.roles.cache.has(process.env.STAFF_ROLE_ID)) {
                    return interaction.reply({ content: "Anda tidak memiliki izin untuk mengambil tiket ini.", ephemeral: true });
                }

                // Cek apakah tiket sudah diklaim
                if (channel.name.includes("claimed")) {
                    return interaction.reply({ content: "Tiket ini sudah diklaim.", ephemeral: true });
                }

                await channel.setName(`${channel.name}-claimed-${member.user.username.toLowerCase().replace(/[^a-z0-9-]/g, '')}`);
                await channel.send({ content: `<@${member.id}> telah mengambil tiket ini.` });
                await interaction.reply({ content: "Anda telah mengambil tiket ini.", ephemeral: true });
            }
        } else if (interaction.isStringSelectMenu()) {
            if (interaction.customId === 'ticket_category_select') {
                const category = interaction.values[0];
                const guild = interaction.guild;
                const member = interaction.member;

                // Check if user already has an open ticket
                const existingTicket = guild.channels.cache.find(c => c.name.startsWith(`ticket-${member.user.username.toLowerCase().replace(/[^a-z0-9-]/g, '')}`) && c.topic === member.id);
                if (existingTicket) {
                    return interaction.followUp({ content: `Anda sudah memiliki tiket yang terbuka: ${existingTicket}.`, ephemeral: true });
                }

                // Map category values to more readable names for channel
                let categoryName = "";
                switch (category) {
                    case "player_abuse":
                        categoryName = "player-abuse";
                        break;
                    case "bug_report":
                        categoryName = "bug-report";
                        break;
                    case "general_issue":
                        categoryName = "general";
                        break;
                    default:
                        categoryName = "unknown";
                }

                // Create ticket channel
                const ticketChannel = await guild.channels.create({
                    name: `ticket-${categoryName}-${member.user.username.toLowerCase().replace(/[^a-z0-9-]/g, '')}`,
                    type: ChannelType.GuildText,
                    parent: process.env.TICKET_CATEGORY_ID, // ID kategori tiket dari .env
                    topic: member.id, // Menyimpan ID pengguna sebagai topik channel untuk identifikasi
                    permissionOverwrites: [
                        {
                            id: guild.id,
                            deny: [PermissionFlagsBits.ViewChannel],
                        },
                        {
                            id: member.id,
                            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
                        },
                        {
                            id: process.env.STAFF_ROLE_ID, // ID peran Customer Service/Admin dari .env
                            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
                        },
                    ],
                });

                const ticketEmbed = new EmbedBuilder()
                    .setTitle("Tiket Baru")
                    .setDescription(`Halo ${member},
Terima kasih telah membuat tiket dengan kategori: **${category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}**.
Customer Service atau Admin akan segera membantu Anda.
Mohon jelaskan masalah Anda secara detail.`) // Menambahkan instruksi untuk pengguna
                    .setColor("Green")
                    .addFields(
                        { name: "Pengguna", value: `<@${member.id}>`, inline: true },
                        { name: "Kategori", value: category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), inline: true },
                        { name: "Waktu Dibuat", value: new Date().toLocaleString(), inline: true }
                    );

                const closeButton = new ButtonBuilder()
                    .setCustomId("close_ticket")
                    .setLabel("Tutup Tiket")
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji("🔒");

                const claimButton = new ButtonBuilder()
                    .setCustomId("claim_ticket")
                    .setLabel("Ambil Tiket")
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji("🙋");

                const row = new ActionRowBuilder()
                    .addComponents(claimButton, closeButton);

                await ticketChannel.send({ content: `<@${member.id}> <@&${process.env.STAFF_ROLE_ID}>`, embeds: [ticketEmbed], components: [row] });

                await interaction.followUp({ content: `Tiket Anda telah dibuat di ${ticketChannel}.`, ephemeral: true });
            }
        }
    },
};
