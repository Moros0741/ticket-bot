const {
	SlashCommandBuilder,
	EmbedBuilder,
	ActionRowBuilder,
	SelectMenuBuilder,
	ChannelType,
	PermissionsBitField,
	ButtonBuilder,
	ButtonStyle
} = require('discord.js');
const {
	stripIndents
} = require('common-tags');

const flags = PermissionsBitField.Flags;

function getOptions(client) {
	const options = [];
	let squadrons = client.guildSettings.squadrons;

	for (const squadron of squadrons) {
		const option = {
			label: squadron.name,
			description: squadron.description,
			value: squadron.name.toLowerCase()
		};
		if (!squadron.emote === null) {
			option.emoji = squadron.emote;
		};
	};
	return options;
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName("config-tickets")
		.setDescription("Configure the ticket system")
		.addChannelOption((option) =>
			option
				.setChannelType(ChannelType.Text)
				.setName("ticket-channel")
				.setDescription("Channel to post ticket message to.")
				.setRequired(true)
		),
	async execute(interaction, client) {
		let channel = interaction.options.getChannel("ticket-channel");
		const embed = new EmbedBuilder()
			.setTitle("Create a Ticket")
			.setDescription("Choose a Squadron Below to Create a Ticket and talk to its leadership")
			.setColor("Blue");

		const SelectMenu = new ActionRowBuilder().addComponents(
			new SelectMenuBuilder()
				.setPlaceholder("Select a Squadron")
				.setCustomId("tickets-squadron")
				.setOptions(getOptions(client))
		);

		try {
			channel.send({ embeds: [embed], components: [SelectMenu] })
				.then(() => {
					return interaction.reply({
						content: `Ticket Message sent in ${channel.toString()}`,
						ephemeral: true,
					});
				})
				.catch((err) => {
					return interaction.reply({
						content: `Error sending ticket message in ${channel.toString()}`,
						ephemeral: true,
					});
				});
		} catch (err) {
			console.log(err);
			return interaction.reply({
				content: `Error sending ticket message in ${channel.toString()}`,
				ephemeral: true,
			});
		};
	},
	async executeResult(interaction, client) {
		let squadronData = client.guildSettings.squadrons[`${interaction.values[0]}`];
		let parentId = client.guildSettings.ticketCategory;
		const ticketId = client.generateId();
		let channeName = ticketId + "-" + interaction.user.username + "-" + interaction.user.discriminator;

		interaction.guild.channels.create(channeName, {
			type: "text",
			parent: parentId,
			topic: `Ticket for ${squadronData.name} & ${interaction.member.displayName}`,
			permissionOverwrites: [
				{
					id: interaction.user.id,
					allow: [flags.ViewChannel, flags.SendMessages, flags.ReadMessageHistory, flags.AttachFiles, flags.EmbedLinks],
				},
				{
					id: squadronData.role,
					allow: [flags.ViewChannel, flags.SendMessages, flags.ReadMessageHistory, flags.AttachFiles, flags.EmbedLinks],
				}
			]
		})
			.then((channel) => {
				interaction.reply({
					content: `Ticket created in ${channel.toString()}`,
					ephemeral: true,
				});

				const embed = new EmbedBuilder()
					.setTitle("Ticket Created `" + ticketId + "`")
					.setDescription(stripIndents`
					Ticket Created for ${squadronData.name} & ${interaction.member.displayName}
				
					To close this ticket press the button below.
				`)
					.setColor("Blue");

				const row = new ActionRowBuilder().addComponents(
					new ButtonBuilder()
						.setLabel("Close Ticket")
						.setStyle(ButtonStyle.Danger)
						.setCustomId(`closeTicket-${channel.id}`)
				);

				return channel.send({
					content: `<@&${squadronData.role}> ${interaction.user.toString()}`,
					embeds: [embed],
					components: [row]
				});
			})
			.catch((err) => {
				console.log(err);
				return interaction.reply({
					content: `Error creating ticket channel`,
					ephemeral: true,
				});
			});
	},
};