const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');

const token = ''

let cacheID = {};
let qSC = '';
let qWB = '';
let qTT = '';
let afterlife = null;
let headqarter = null;
let randomMsg = ['YEET!', 'Nope!', 'Hahah, you thought!', 'Are you that bad that you need to use this command?']
let whitelist = ['lfp', 'add', 'remove', 'create', 'destroy', 'color',
				'color', 'rename', 'clear', 'clearall', 'status', 'join',
				'invite', 'kick', 'leave', 'quit', 'help', 'setinfo',
				'info', 'ready', 'rem', 'wiki', 'forget']
let factoids = {};
let facts = JSON.parse(fs.readFileSync('facts.json').toString());

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
	afterlife = client.guilds.get('');
	afterlife.channels.find('id', '468537558650060821').fetchMessages({limit: 20})
	client.user.setActivity('p!help for commands, made by Arta#8214'); 
});

function getArgs(argv, size) {
	let ret = '';
	argv.substring(size).split(' ').forEach((av) => {
		if (ret == '')
			ret += av;
		else
			ret += ' ' + av;
	});
	return ret;
}

function getInfo(msg, size) {
	let ret = '';
	msg.content.substring(size).split(';').forEach((av) => {
		if (ret == '') {
			ret += msg.author.username + ' last updated this at ' + msg.createdAt + '\n\n';
			ret += 'Channel ID: ' + av + '\n';
		}
		else { ret += 'Password ID: ' + av + '\n\n'; }
	});
	ret += 'If info is outdated please DM me p!setinfo with new info.';
	return ret;
}

function getMulti(argv, size) {
	let ret = ['', ''];
	argv.substring(size).split(' ').forEach((av) => {
		if (ret[0] == '') { ret[0] = av; }
		else if (ret[1] == '') { ret[1] += av; }
		else { ret[1] += ' ' + av; }
	});
	return ret;	 
}

function getDelim(argv, size) {
	let ret = ['', '']
	argv.substring(size).split(';').forEach((av) => {
		if (ret[0] == '') { ret[0] = av; }
		else { ret[1] += av; }
	});
	return ret;	
}

function removeRole(msg) {
	let roleArr = fs.readFileSync('roles.txt').toString().split(';');
	roleArr.forEach((role) => {
		let roleObj = msg.guild.roles.find('name', role);
		if (roleObj) { msg.guild.members.get(msg.author.id).removeRole(roleObj); }
	});
}

function kickUser(msg, users) {
	let ret = 0;
	let roleArr = fs.readFileSync('roles.txt').toString().split(';');
	roleArr.forEach((role) => {
		let roleObj = msg.guild.roles.find('name', role);
		if (roleObj) { 
			try {
				let idTrim = users.replace(/[<@!&> ]/g, '');
				msg.guild.members.get(idTrim).removeRole(roleObj); 
				ret = 1;
			}
			catch(err) { 
				try {
					let userID = msg.guild.members.find('displayName', users).id;
					msg.guild.members.get(userID).removeRole(roleObj); 
					ret = 2;
				}
				catch(err) { console.error }
			}
		}
	});
	return ret;
}

function removeRoleWithName(msg, userID) {
	let roleArr = fs.readFileSync('roles.txt').toString().split(';');
	roleArr.forEach((role) => {
		let roleObj = msg.guild.roles.find('name', role);
		if (roleObj) { msg.guild.members.get(userID).removeRole(roleObj); }
	});
}

function inviteUser(msg, users, role) {
	let ret = 0;
	let rolelist = fs.readFileSync('roles.txt').toString();
	if (rolelist.search(role) != -1) {
		let roleObj = msg.guild.roles.find('name', role);
		if (roleObj) { 
			try {
				let idTrim = users.replace(/[<@!&> ]/g, '');
				removeRoleWithName(msg, idTrim);
				msg.guild.members.get(idTrim).addRole(roleObj); 
				ret = 1;
			}
			catch(err) {
				try {
					let userID = msg.guild.members.find('displayName', users).id;
					removeRoleWithName(msg, userID);
					msg.guild.members.get(userID).addRole(roleObj); 
					ret = 2;
				}
				catch(err) { console.error }
			}
		}
	};
	return ret;
}

function removeUsers(roleObj, msg, args) {
	let rolelist = fs.readFileSync('roles.txt').toString();
	if (rolelist.search(roleObj.name) != -1) {
		roleObj.members.forEach((user) => {
			msg.guild.members.get(user.id).removeRole(roleObj);
		});
		if (args) { msg.channel.send(`Removed all users from ${args}`); }
	}
}

function addRole(msg, args) {
	let roleObj = msg.guild.roles.find('name', args);
	if (roleObj) {
		let rolelist = fs.readFileSync('roles.txt').toString();
		let roleArr = fs.readFileSync('roles.txt').toString().split(';');
		if (roleArr.indexOf(roleObj.name) == -1) {
			rolelist += roleObj.name + ';';
			fs.writeFile('roles.txt', rolelist, (err) => { if (err) throw err; });
			msg.channel.send(`Added ${roleObj.name} to party role list`);
		}
		else { msg.channel.send(`${roleObj.name} already is on the party role list`); }
	}
	else { msg.channel.send(`${args} role does not exist`); }
}

function removeRoles(msg, args) {
	let roleObj = msg.guild.roles.find('name', args);
	try {
		if (roleObj) {
			let rolelist = fs.readFileSync('roles.txt').toString();
			if (rolelist.search(roleObj.name) != -1) {
				removeUsers(roleObj, msg, '');
				rolelist = rolelist.replace(roleObj.name + ';', '');
				fs.writeFile('roles.txt', rolelist, (err) => { if (err) throw err; });
				msg.channel.send(`Removed ${roleObj.name} from the party role list`);
				return 1;
			}
			else { 
				msg.channel.send(`${roleObj.name} is not on the party role list`); 
				return 0;
			}
		}
		else { 
			msg.channel.send(`${args} role does not exist`); 
			return 0;
		}
	}
	catch (e) {
		console.log(e);
	}
}

function leaveQ(id) {
	qSC = qSC.replace(id + ';', '');
	qWB = qWB.replace(id + ';', '');
	qTT = qTT.replace(id + ';', '');
}

client.on('messageReactionAdd', (reaction, user) => {
    if(reaction.emoji.name === '🍆' && reaction.message.id == '468617915214725120') {
        let roleObj = afterlife.roles.find('id', '466384866133409794');
		afterlife.members.get(user.id).addRole(roleObj);
		user.send('You have added yourself to the NSFW role. If you want to remove the role please remove your reaction.');
    }
        if(reaction.emoji.name === '👌' && reaction.message.id == '468620867656613909') {
        let roleObj = afterlife.roles.find('id', '468462882154086411');
		afterlife.members.get(user.id).addRole(roleObj);
		user.send('You have added yourself to the RP role. If you want to remove the role please remove your reaction.');
  
    }
});

client.on('messageReactionRemove', (reaction, user) => {
    if(reaction.emoji.name === '🍆' && reaction.message.id == '468617915214725120') {
        let roleObj = afterlife.roles.find('id', '466384866133409794');
		afterlife.members.get(user.id).removeRole(roleObj);
		user.send('You have removed yourself from the NSFW role. If you want to add the role please react again.');
  
    }
        if(reaction.emoji.name === '👌' && reaction.message.id == '468620867656613909') {
        let roleObj = afterlife.roles.find('id', '468462882154086411');
		afterlife.members.get(user.id).removeRole(roleObj);
		user.send('You have removed yourself from the RP role. If you want to add the role please react again.');
    }
});

client.on('message', msg => {
	if(msg.guild) {
		if (msg.author.id == client.user.id)
			return;

		// if (msg.content.toLowerCase().startsWith('p!arta')) {
		// 	msg.members.get('154755811015524352').send('Testing');
		// }
		// if (msg.content.toLowerCase().search('nala') != -1) {
		// 	msg.channel.send('Nala: Loudest yawns in the world');
		// }

		// if (msg.content.toLowerCase().search('cooper') != -1) {
		// 	msg.channel.send('Cooper: The one and only super ass penetrator');
		// }

		// Lobby script looking for party
		if (msg.content.toLowerCase().startsWith('p!lfp ')) {
			let args = getArgs(msg.content, 6);
			if (args.toLowerCase() == 'cm' || args.toLowerCase() == 'coal mines') {
				if (qSC.search(msg.author.id) != -1) {
					msg.channel.send(`You are already looking for party for CM <@${msg.author.id}>` );
				}
				else {
					qSC += msg.author.id + ';';
					msg.channel.send(`You are now looking for a CM party <@${msg.author.id}>` );
					afterlife.channels.get('458287756645236770').send(`@here <@${msg.author.id}> is looking for Coal Mine party!`);
				}
			}
			else if (args.toLowerCase() == 'wb' || args.toLowerCase() == 'world boss') {
				if (qWB.search(msg.author.id) != -1) {
					msg.channel.send(`You are already looking for party for WB <@${msg.author.id}>` );
				}
				else {
					qWB += msg.author.id + ';';
					msg.channel.send(`You are now looking for a WB party <@${msg.author.id}>` );
					afterlife.channels.get('458287756645236770').send(`@here <@${msg.author.id}> is looking for World Boss party!`);
				}
			}
			else if (args.toLowerCase() == 'tt' || args.toLowerCase() == 'tower') {
				if (qTT.search(msg.author.id) != -1) {
					msg.channel.send(`You are already looking for party for TT <@${msg.author.id}>` );
				}
				else {
					qTT += msg.author.id + ';';
					msg.channel.send(`You are now looking for a TT party <@${msg.author.id}>` );
					afterlife.channels.get('458287756645236770').send(`@here <@${msg.author.id}> is looking for Tower party!`);
				}
			}
		}

		// Add already made roles to the role party list
		if (msg.content.toLowerCase().startsWith('p!add ')) {
			if (msg.guild.members.get(msg.author.id).hasPermission(['ADMINISTRATOR'])) {
				let args = getArgs(msg.content, 6);
				addRole(msg, args);
			}
			else { msg.channel.send('Only admins can use this command.' ); };
		}

		// Create and add a role
		if (msg.content.toLowerCase().startsWith('p!create ')) {
			if (msg.guild.members.get(msg.author.id).hasPermission(['ADMINISTRATOR'])) {
				let args = getArgs(msg.content, 9);
				msg.guild.createRole({ name: args })
					.then(role => {
						msg.channel.send(`Created new role ${role.name}`)
						addRole(msg, args);
					})
					.catch(console.error);
			}
			else { msg.channel.send('Only admins can use this command.' )};
		}

		// Remove roles in the role party list
		if (msg.content.toLowerCase().startsWith('p!remove ')) {
			if (msg.guild.members.get(msg.author.id).hasPermission(['ADMINISTRATOR'])) {
				let args = getArgs(msg.content, 9);
				removeRoles(msg, args);
			}
			else { msg.channel.send('Only admins can use this command.' )};
		}

		// Remove roles in the role party list
		if (msg.content.toLowerCase().startsWith('p!destroy ')) {
			if (msg.guild.members.get(msg.author.id).hasPermission(['ADMINISTRATOR'])) {
				let args = getArgs(msg.content, 10);
				if (removeRoles(msg, args) == 1) {
					let roleObj = msg.guild.roles.find('name', args);
					roleObj.delete('Removing role')
		  				.then(deleted => msg.channel.send(`Destroyed role ${deleted.name}`))
		  				.catch(console.error);
		  		}
		  	}
			else { msg.channel.send('Only admins can use this command.' )};
		}

		// Sets color for role
		if (msg.content.toLowerCase().startsWith('p!color ')) {
			if (msg.guild.members.get(msg.author.id).hasPermission(['ADMINISTRATOR'])) {
				let args = getMulti(msg.content, 8);
				let roleObj = msg.guild.roles.find('name', args[1]);
				if (roleObj) {
					let rolelist = fs.readFileSync('roles.txt').toString();
					if (rolelist.search(roleObj.name) != -1) {
						roleObj.setColor(args[0].toUpperCase())
							.then(updated => msg.channel.send(`Set color of role ${args[1]} to ${args[0]}`))
							.catch(console.error);
					}
					else { msg.channel.send(`${args[1]} is not a valid party role.`); }
				}
				else { msg.channel.send(`${args[1]} is not a valid party role.`); }
		  	}
			else { msg.channel.send('Only admins can use this command.' )};
		}

		// Sets new name for role
		if (msg.content.toLowerCase().startsWith('p!rename ')) {
			if (msg.guild.members.get(msg.author.id).hasPermission(['ADMINISTRATOR'])) {
				let args = getDelim(msg.content, 9);
				let roleObj = msg.guild.roles.find('name', args[0]);
				if (roleObj) {
					let rolelist = fs.readFileSync('roles.txt').toString();
					if (rolelist.search(roleObj.name) != -1) {
						removeRoles(msg, args[0]);
						roleObj.setName(args[1])
							.then(updated => {
								addRole(msg, args[1]);
								msg.channel.send(`Edited role name from ${args[0]} to ${args[1]}`)
							})
							.catch(console.error);
					}
					else { msg.channel.send(`${args[0]} is not a valid party role.`); }
				}
				else { msg.channel.send(`${args[0]} is not a valid party role.`); }
		  	}
			else { msg.channel.send('Only admins can use this command.' )};
		}

		// Clears all user from the party
		if (msg.content.toLowerCase().startsWith('p!clear ')) {
			if (msg.guild.members.get(msg.author.id).hasPermission(['MANAGE_ROLES'])) {
				let args = getArgs(msg.content, 8);
				let roleObj = msg.guild.roles.find('name', args);
				if (roleObj) { removeUsers(roleObj, msg, args); }
				else { msg.channel.send(`${args} is not a valid party role`); }
			}
			else { msg.channel.send('You cannot use this command.' )};
		}

		// Clear every single party
		if (msg.content.toLowerCase().startsWith('p!clearall')) {
			if (msg.guild.members.get(msg.author.id).hasPermission(['MANAGE_ROLES'])) {
				let roleArr = fs.readFileSync('roles.txt').toString().split(';');
				roleArr.forEach((role) => {
					let roleObj = msg.guild.roles.find('name', role);
					if (roleObj) { removeUsers(roleObj, msg, '') };
				});
				msg.channel.send('Cleared all users from every party');
			}
			else { msg.channel.send('You cannot use this command.' )};
		}



		// Gets status and quantity of users in party
		if (msg.content.toLowerCase().startsWith('p!status')) {
			let roleArr = fs.readFileSync('roles.txt').toString().split(';');
			if (roleArr.length != 1) {
				let ret = '';
				roleArr.forEach((role) => {
					let roleObj = msg.guild.roles.find('name', role);
					if (roleObj) {
						let userlist = '';
						let count = 0;
						roleObj.members.forEach((user) => {
							if (count == 0) { userlist += '✠ ' + user.displayName + '\n'; }
							else { userlist += '✠ ' + user.displayName + '\n'; }
							count += 1;
						});
						if (count > 0) { ret += `\`${role} (${count}/7):\`\n` + userlist + '\n'; }
						else { ret += `\`${role} (${count}/7):\`\n✠ none\n\n`; }
					}
				});
				count = 0;
				userlist = '';
				qSC.split(';').forEach((id) => {
					if (id) {
						userlist += '✠ ' + msg.guild.members.get(id).displayName + '\n';
						count += 1;
					}
				});
				if (count > 0) {
					ret += `✠ ✠ ✠ ✠ ✠ ✠ ✠ ✠ ✠ ✠ ✠ ✠ ✠ ✠ ✠ ✠ ✠ ✠\n\n\`Coal Mines Waiting List (${count} lfp):\`\n ${userlist}\n`;
				}
				else {
					ret += `✠ ✠ ✠ ✠ ✠ ✠ ✠ ✠ ✠ ✠ ✠ ✠ ✠ ✠ ✠ ✠ ✠ ✠\n\n\`Coal Mines Waiting List (${count} lfp):\`\n✠ none\n\n`;
				}
				count = 0;
				userlist = '';
				qWB.split(';').forEach((id) => {
					if (id) {
						userlist += '✠ ' + msg.guild.members.get(id).displayName + '\n';
						count += 1;
					}
				});
				if (count > 0) { ret += `\`World Boss Waiting List (${count} lfp):\`\n ${userlist}\n`; }
				else { ret += `\`World Boss Waiting List (${count} lfp):\`\n✠ none\n\n`; }
				count = 0;
				userlist = '';
				qTT.split(';').forEach((id) => {
					if (id) {
						userlist += '✠ ' + msg.guild.members.get(id).displayName + '\n';
						count += 1;
					}
				});
				if (count > 0) {
					ret += `\`Tower Waiting List (${count} lfp):\`\n ${userlist}\n`;
				}
				else {
					ret += `\`Tower Waiting List (${count} lfp):\`\n✠ none\n\n`;
				}
				msg.channel.send(ret);
			}
			else { msg.channel.send('There is no parties available' )};
		}

		// Adds yourself to role
		if (msg.content.toLowerCase().startsWith('p!join ')) {
			let args = getArgs(msg.content, 7);
			let rolelist = fs.readFileSync('roles.txt').toString();
			if (rolelist.search(args) != -1) {
				let roleObj = msg.guild.roles.find('name', args);
				if (roleObj) {
					if (roleObj.members.get(msg.author.id)) {
						msg.channel.send(`<@${msg.author.id}> has already joined ${args}`);
					}
					else if (roleObj && roleObj.members.size < 7) {
						removeRole(msg);
						msg.guild.members.get(msg.author.id).addRole(roleObj);
						msg.channel.send(`<@${msg.author.id}> has joined ${args} party!`);
						if (roleObj.members.size == 0) {
							afterlife.channels.get('458287756645236770').send(`@here <@${msg.author.id}> has started ${args} party! (${roleObj.members.size + 1}/7)`);
						}
						else {
							afterlife.channels.get('458287756645236770').send(` <@${msg.author.id}> has joined ${args} party! (${roleObj.members.size + 1}/7)`);
						}
						leaveQ(msg.author.id);
					}
					else { msg.channel.send(`${args} is full and cannot be joined. Sorry!`); };
				}
				else { msg.channel.send(`${args} is not a valid party role`)}
			}
			else { msg.channel.send(`${args} is not a valid party role`)}
		}

		// Invite someone into party
		if (msg.content.toLowerCase().startsWith('p!invite ')) {
			let args = getDelim(msg.content, 9);
			let ret = inviteUser(msg, args[0], args[1]);
			if (ret == 1) { msg.channel.send(`You have invited ${args[0]} into ${args[1]}`); }
			else if (ret == 2) { msg.channel.send(`You have invited <@${msg.guild.members.find('displayName', args[0]).id}> into ${args[1]}`); }
			else { msg.channel.send(`Could not find ${args[0]} to invite into.`); };
		}

		// Kick someone from party
		if (msg.content.toLowerCase().startsWith('p!kick ')) {
			let args = getArgs(msg.content, 7);
			let ret = kickUser(msg, args);
			if (ret == 1) { msg.channel.send(`You have kicked ${args}`); }
			else if (ret == 2) { msg.channel.send(`You have kicked <@${msg.guild.members.find('displayName', args).id}>`); }
			else { msg.channel.send(`Could not find ${args} in a party to be kicked from.`); };
		}

		// Remove yourself from role
		if (msg.content.toLowerCase().startsWith('p!leave')) {
			removeRole(msg);
			msg.channel.send(`You have left your party <@${msg.author.id}>`);
			afterlife.channels.get('458287756645236770').send(`<@${msg.author.id}> has left their party, check p!status to replace them`);
		}

		// Remove yourself from Q
		if (msg.content.toLowerCase().startsWith('p!quit')) {
			leaveQ(msg.author.id);
			msg.channel.send(`You have quit from all waiting lobbies <@${msg.author.id}>`);
		}

		// Clear a factoid
		if (msg.content.toLowerCase().startsWith('p!forget ') &&
			msg.guild.channels.find('name', msg.channel.name).id == '468908415004180511') {
			let args = getArgs(msg.content, 9);
			console.log(`Forget called to forget ${args}`);
			if (args != 'Arta') {
				delete facts[args];
				fs.writeFile('facts.json', JSON.stringify(facts), (err) => { if (err) throw err; });
				if (msg.guild) { msg.channel.send(`Deleted command \`${args}\``); }
				else { msg.author.send(`Deleted command \`${args}\``);  }	
			}
			else {
				if (msg.guild) { msg.channel.send('How dare you try to delete me >:('); }
				else { msg.author.send('How dare you try to delete me >:(');  }		
			}
		}
		// console.log(msg.channel.name);
		// Factoids
		if (msg.content.toLowerCase().startsWith('p!rem ') &&
			msg.guild.channels.find('name', msg.channel.name).id == '468908415004180511') {
			let args = getDelim(msg.content, 6);
			if (whitelist.indexOf(args[0]) === -1 && args[1] && !msg.attachments.first()) {
				console.log(`Factoid being set for ${args[0]} by ${msg.author.username}`);
				facts[args[0]] = { content: args[1] };
				fs.writeFile('facts.json', JSON.stringify(facts), (err) => { if (err) throw err; });
				if (msg.guild) { msg.channel.send(`Custom command \`${args[0]}\` updated with new info`); }
				else { msg.author.send(`Custom command \`${args[0]}\` updated with new info`);  }	
			}
			else if (whitelist.indexOf(args[0]) === -1 && msg.attachments.first()) {
				console.log(`Factoid being set for ${args[0]} by ${msg.author.username}`);
				facts[args[0]] = { content: args[1], image: msg.attachments.first().url };
				fs.writeFile('facts.json', JSON.stringify(facts), (err) => { if (err) throw err; });
				if (msg.guild) { msg.channel.send(`Custom command \`${args[0]}\` updated with new info`); }
				else { msg.author.send(`Custom command \`${args[0]}\` updated with new info`);  }			
			}
			else {
				console.log(`FAILURE: Blacklisted command for ${args[0]} by ${msg.author.username}`);
				if (msg.guild) { msg.channel.send('Please use a valid command;content for p!rem'); }
				else { msg.author.send('Please use a valid command;content for p!rem');  }	
			}
		}

	}

	// Help menu
	if (msg.content.toLowerCase().startsWith('p!help')) {
		console.log(`p!help called by ${msg.author.username}`);
		if (afterlife.members.get(msg.author.id).hasPermission(['ADMINISTRATOR'])) {
			msg.author.send('\`\`\`Hello I\'m the Party-Bot for After Life, my creator Arta made me to help ease partying!\nJoin the waiting lobby if you are waiting for people to create a party together, and join a party and use the party commands to instantly join in on the fun!\nHere are the commands you can use\n\nNote: Only p!help, p!setinfo, p!info and p!ready can be used in server and in private message. The rest must be used in the server\n\np!add [role]                   - Adds an existing role to the party list\np!remove [role]                - Removes a role from the party list\np!create [role]                - Creates a new role and adds it to party list\np!destroy [role]               - Destroys a role in the party list by removing it and permanently deleting it\np!invite [user;party]          - Moves a user into a specific party, must use ; to separate\np!kick [user]	              - Removes a user from their party\n\np!rename [role;new name]       - Change name of role to another name, this will clear all members\np!color [color] [role]         - Sets color for a role\n\np!clear [role]                 - Clears all members from a specific party\np!clearall                     - Clears every party\n\np!status                       - Shows all party with member count and members\np!join [partyname]             - Joins a party\np!leave                        - Leaves your party\np!lfp [value]                  - Joins the waiting lobby for SC, WB or TT (those are values to use)\np!quit                         - Quits all waiting lobby you are in\n\nParty Commands (You must join a party first for these to work):\np!setinfo [channel;password]   - Sets the channel ID and password, use ; to separate the two\np!info                         - Lets you see your current party\'s channel and password\np!ready                        - Will message everyone in party the private channel info (can be used dm or server)\n\np!wiki                         - Check all available commands for info/guide for internal wiki\n\`\`\`');
		}
		else if (afterlife.members.get(msg.author.id).hasPermission(['MANAGE_ROLES'])) {
			msg.author.send('\`\`\`Hello I\'m the Party-Bot for After Life, my creator Arta made me to help ease partying!\nJoin the waiting lobby if you are waiting for people to create a party together, and join a party and use the party commands to instantly join in on the fun!\nHere are the commands you can use\n\nNote: Only p!help, p!setinfo, p!info and p!ready can be used in server and in private message. The rest must be used in the server\n\np!invite [user;party]          - Moves a user into a specific party, must use ; to separate\np!kick [user]	              - Removes a user from their party\np!clear [role]                 - Clears all members from a specific party\np!clearall                     - Clears every party\n\np!status                       - Shows all party with member count and members\np!join [partyname]             - Joins a party\np!leave                        - Leaves your party\np!lfp [value]                  - Joins the waiting lobby for SC, WB or TT (those are values to use)\np!quit                         - Quits all waiting lobby you are in\n\nParty Commands (You must join a party first for these to work):\np!setinfo [channel;password]   - Sets the channel ID and password, use ; to separate the two\np!info                         - Lets you see your current party\'s channel and password\np!ready                        - Will message everyone in party the private channel info (can be used dm or server)\n\np!wiki                         - Check all available commands for info/guide for internal wiki\n\`\`\`');
		}
		else {
			msg.author.send('\`\`\`Hello I\'m the Party-Bot for After Life, my creator Arta made me to help ease partying!\nJoin the waiting lobby if you are waiting for people to create a party together, and join a party and use the party commands to instantly join in on the fun!\nHere are the commands you can use\n\nNote: Only p!help, p!setinfo, p!info and p!ready can be used in server and in private message. The rest must be used in the server\n\np!status                       - Shows all party with member count and members\np!join [partyname]             - Joins a party\np!leave                        - Leaves your party\np!lfp [value]                  - Joins the waiting lobby for SC, WB or TT (those are values to use)\np!quit                         - Quits all waiting lobby you are in\n\nParty Commands (You must join a party first for these to work):\np!setinfo [channel;password]   - Sets the channel ID and password, use ; to separate the two\np!info                         - Lets you see your current party\'s channel and password\np!ready                        - Will message everyone in party the private channel info (can be used dm or server)\n\np!wiki                         - Check all available commands for info/guide for internal wiki\n\`\`\`');
		}
		if (msg.guild) { msg.channel.send('I messaged you the commands, please check your private messages!'); }
	}

	// Set channel ID and password for their current party
	if (msg.content.toLowerCase().startsWith('p!setinfo ')) {
		console.log(`p!info set by ${msg.author.username}`);
		if (msg.guild) {
			msg.author.send('You need to private message me this with info so other people dont see the channel ID and password' );
		}
		else {
			let args = getInfo(msg, 10);
			let count = 0;
			afterlife.members.get(msg.author.id).roles.forEach((role) => {
				let rolelist = fs.readFileSync('roles.txt').toString();
				if (rolelist.search(role.name) != -1) {
					cacheID[role.name] = args
					msg.author.send(`Information for ${role.name} has been updated.`);
					count += 1;
				}
			});
			if (count == 0) { msg.author.send('You are not in a party, you must join one'); }
		}
	}

	// Show channel info
	if (msg.content.toLowerCase().startsWith('p!info')) {
		console.log(`p!info called by ${msg.author.username}`);
		let count = 0;
		afterlife.members.get(msg.author.id).roles.forEach((role) => {
			let rolelist = fs.readFileSync('roles.txt').toString();
			if (rolelist.search(role.name) != -1) {
				if (cacheID[role.name]) { msg.author.send(`${cacheID[role.name]}`); count += 1; }
				else { msg.author.send('No info has been set yet for this party, use p!setinfo to set channel and password'); count = -1; }
			}
		});
		if (count == 0) { msg.author.send('You are not in a party, you must join one'); }
		if (msg.guild) { msg.channel.send('I messaged you the info, please check your private messages!'); }
	}

	// Msg everyone in party the info
	if (msg.content.toLowerCase().startsWith('p!ready')) {
		console.log(`p!ready called by ${msg.author.username}`);
		let rolelist = fs.readFileSync('roles.txt').toString();
		let count = 0;
		afterlife.members.get(msg.author.id).roles.forEach((role) => {
			if (rolelist.search(role.name) != -1) {
				count += 1;
				if (cacheID[role.name]) {
					let roleObj = afterlife.roles.find('name', role.name);
					if (roleObj) {
						roleObj.members.forEach((user) => { user.send(`${cacheID[role.name]}`); });
					}
				}
				else { msg.author.send('You need to use p!setinfo and set info first before using ready'); }
			}
		});
		if (count == 0) { msg.author.send('You need to be a party first to use this. Use p!help');  }
		if (msg.guild) { msg.channel.send('I have pinged your party, please check your private messages!'); }
	}

	// List all factoids
	if (msg.content.toLowerCase().startsWith('p!wiki')) {
		let args = getArgs(msg.content, 6);
		console.log(`Wiki called by ${msg.author.username}`);
		let wikilist = 'List of custom commands set by users:\n\n';
		for (var key in facts) {
			wikilist += `p!${key}\n`;
		}
		if (msg.guild) { msg.channel.send(`${wikilist}`); }
		else { msg.author.send(`${wikilist}`);  }		
	}

	if (msg.content.toLowerCase().startsWith('p!')) {
		let args = getArgs(msg.content, 2);
		console.log(`Factoid ${args} called by ${msg.author.username}`);
		try {
			if (facts[args].content && !facts[args].image) {
				if (msg.guild) { msg.channel.send(`${facts[args].content}`); }
				else { msg.author.send(`${facts[args].content}`);  }
			}
			else if (facts[args].image && !facts[args].content) {
				if (msg.guild) { msg.channel.send('', { file: facts[args].image }); }
				else { msg.channel.send('', { file: facts[args].image }); }
			}
			else if (facts[args].image && facts[args].content) {
				if (msg.guild) { msg.channel.send(facts[args].content, { file: facts[args].image }); }
				else { msg.channel.send(facts[args].content, { file: facts[args].image }); }
			}
		}
		catch (e) {
			console.log('Error for factoid');
		}
	}
})



client.login(token);

