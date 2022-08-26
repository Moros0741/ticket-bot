
module.exports = {
	name: "interactionCreate",
	once: false,
	async execute(interaction) {
		const client = interaction.client;

		if (interaction.isChatInputCommand()) {

			const command = client.commands.get(interaction.commandName);

			if (!command) return;

			try {
				await command.execute(interaction, client);
			} catch (err) {
				console.error(err);
				return interaction.reply({
					content: "An error occurred while executing that command.",
					ephemeral: true,
				});
			};
		} else if (interaction.isSelectMenu()) {
			let idParts = interaction.customId.split("-");
			// ID makeup consists of the system => 'tickets' and the subsystem => 'ticket-type';
			// Example: 'tickets-squadron' or 'tickets-support'

			if (idParts[0] === "tickets") {
				switch (idParts[1]) {
					case "squadron":
						await require('../commands/configTicket').executeResult(interaction, client);
						break;
					// Add more cases here for other ticket options like support, reporting, etc. 
				};
			};
		} else if (interaction.isButton()) {
			let idParts = interaction.customId.split("-");
			if (idParts[0] === "closeTicket") {
				let channel = interaction.guild.channels.cache.get(idParts[1]);

				if (!channel) {
					return interaction.reply({
						content: "Cannot find a channel for this ticket.",
					});
				} else {
					await interaction.reply({
						content: "Ticket Closed. This channel will be deleted in 15 seconds.",
					})
					setTimeout(() => {
						try {
							channel.delete();
						} catch (err) {
							console.error(err);
						}
					}, 15000);
				};
			};
		};
	},
};