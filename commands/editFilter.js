const { SlashCommandBuilder } = require('@discordjs/builders');
const {VoiceChat} = require('../main/classes/commands/voice-chat.js');

const {data} = require('../main/data.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('edit_filter')
		.setDescription('Edit your filter for a voice chat')
        .addSubcommand(subcommand =>
            subcommand.setName("users")
            .setDescription("Add or remove a user from the filter list")
            .addChannelOption(option =>
                option.setName("channel")
                .setDescription("Which channel's filter to modify")
                .setRequired(true))
            .addIntegerOption(option =>
                option.setName("add_or_remove")
                .setDescription("Choose to add or remove users")
                .addChoices([
                    ["add", 1],
                    ["remove", 0]
                ])
                .setRequired(true))
            .addUserOption(option =>
                option.setName("user")
                .setDescription("Person that will be added or removed from the filter")
                .setRequired(true)))
        .addSubcommand(subcommand => 
            subcommand.setName("type")
            .setDescription("Change the filter type. WARNING: RESETS LIST")
            .addChannelOption(option =>
                option.setName("channel")
                .setDescription("Which channel's filter to modify")
                .setRequired(true))
            .addStringOption(option =>
                option.setName("filter_type")
                .setDescription("Choose the new filter type. If the filter is already that type, nothing changes")
                .addChoices([
                    ["whitelist", "whitelist"],
                    ["blacklist", "blacklist"]
                ])
                .setRequired(true))),
	async execute(interaction) {
        // modifying users list
        if (interaction.options.getSubcommand() === "users") {
            const currentUser = interaction.user; // user who started the command
            const channel = interaction.options.getChannel("channel");
            const addOrRemove = interaction.options.getInteger("add_or_remove"); // 1 for add 0 for remove
            const user = interaction.options.getUser("user");
            if (!channel.isVoice) {
                interaction.reply({
                    content: `Filters are only available on voice channels`,
                    ephemeral: true
                });
                return; // stop the rest of function
            }

            const discordUser = data.users.get(currentUser.id);
            // if user doesn't exist or hasn't signed up for that voice channel
            if (!discordUser || !discordUser.hasVoiceChannel(channel.id)) 
                interaction.reply({
                    content: `You have not yet signed up for ${channel}`,
                    ephemeral: true
                });
            else {
                const filter = discordUser.getFilter(channel.id);
                if (addOrRemove === 1) {
                    filter.addUser(user.id);
                    interaction.reply({
                        content: `Added ${user} to your ${filter.getType()} for ${channel}`,
                        ephemeral: true
                    });
                }
                else {
                    if (filter.hasUser(user.id)) {
                        filter.removeUser(user.id);
                        interaction.reply({
                            content: `Removed ${user} from your ${filter.getType()} for ${channel}`,
                            ephemeral: true
                        });
                    }
                    else
                        interaction.reply({
                            content: `${user} was not in your ${filter.getType()} for ${channel}`,
                            ephemeral: true
                        })
                }
            }
        }
        else if (interaction.options.getSubcommand() === "type") {
            const currentUser = interaction.user; // user who started the command
            const channel = interaction.options.getChannel("channel");
            const type = interaction.options.getString("filter_type"); // string of either "whitelist" or "blacklist"
            if (!channel.isVoice) {
                interaction.reply({
                    content: `Filters are only available on voice channels`,
                    ephemeral: true
                });
                return; // stop the rest of function
            }

            const discordUser = data.users.get(currentUser.id);
            // if user doesn't exist or hasn't signed up for that voice channel
            if (!discordUser || !discordUser.hasVoiceChannel(channel.id)) 
                interaction.reply({
                    content: `You have not yet signed up for ${channel}`,
                    ephemeral: true
                });
            else {
                const filter = discordUser.getFilter(channel.id);
                if (filter.getType() === type)
                    interaction.reply({
                        content: `Your filter for ${channel} is already a ${type}`,
                        ephemeral: true
                    });
                else {
                    filter.setType(type);
                    interaction.reply({
                        content: `Your filter for ${channel} was reset and changed to a ${type}`,
                        ephemeral: true
                    });
                }

            }
        }

	},
};