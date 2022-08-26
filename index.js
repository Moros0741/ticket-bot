const { 
	Client, 
	Collection, 
	EmbedBuilder, 
	GatewayIntentBits 
} = require('discord.js');
const fs = require('fs');
const suid = require('short-uuid');

require('./deployCommands')()
	.then(() => {
		console.log("Commans deployed successfully!");
	})
	.catch((err) => {
		console.log("Deploy Commands Error: ", "\n", err);
	});
	
const client = new Client({
	intents: [
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.Guilds,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMessages
	]
});

const config = require('./data/config.json');

client.commands = new Collection();
client.emotes = requier('./data/emotes.json');
client.guildSettings = require('./data/serverData.json');
client.generateId = new suid({length: 6});

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
};

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	};
};

try {
	client.login(config.token);
} catch (err) {
	console.error("Error Logging into Discord. Most likely invalid token.", err);
};