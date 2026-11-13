const fs = require('node:fs');
const { Client, Events, GatewayIntentBits, Partials, ChannelType, PermissionFlagsBits: P, SlashCommandBuilder, MessageFlags } = require('discord.js');
const cron = require('node-cron');
const { embed, zone } = require('./counter');
const client = new Client({ intents:[GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages], partials:[Partials.Message] });
const types = [ChannelType.GuildText, ChannelType.GuildAnnouncement];
const command = new SlashCommandBuilder().setName('setcounter').setDescription('Set up a release countdown').setDMPermission(false).setDefaultMemberPermissions(P.ManageGuild)
  .addSubcommand(s => s.setName('gta6').setDescription('Set up the GTA VI countdown').addChannelOption(o => o.setName('channel').setDescription('Countdown channel').addChannelTypes(...types)));
const roleId = process.env.DISCORD_ROLE_ID;
const mentions = { content: roleId ? '<@&' + roleId + '>' : '', allowedMentions: { parse: [], roles: roleId ? [roleId] : [] } };
const file = 'counters.json';
const state = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file,'utf8')) : {};
function save() {
  fs.writeFileSync(file+'.tmp',JSON.stringify(state,null,2));
  fs.renameSync(file+'.tmp',file);
}
const queues = new Map();
function queue(id, action) {
  const job = (queues.get(id) || Promise.resolve()).then(action);
  const tail = job.catch(e => console.error('Server',id,e.message)).finally(() => { if (queues.get(id) === tail) queues.delete(id); });
  queues.set(id,tail);
  return job;
}
async function refresh(id, target) {
  const entry = state[id];
  if (!entry && !target) return;
  const channel = await client.channels.fetch(target || entry.channel);
  if (!channel || channel.guildId !== id || !types.includes(channel.type)) throw Error('Choose a text or announcement channel.');
  if (!channel.permissionsFor(client.user)?.has([P.ViewChannel,P.ReadMessageHistory,P.SendMessages,P.EmbedLinks])) throw Error('The bot needs View Channel, Read Message History, Send Messages and Embed Links permissions.');
  const payload = {embeds:[embed()]};
  if (entry?.message) {
    try {
      if (entry.channel === channel.id) {
        await channel.messages.edit(entry.message,{...payload, ...mentions});
        return;
      }
      const old = await client.channels.fetch(entry.channel);
      await old.messages.delete(entry.message);
    } catch (e) { if (![10003,10008].includes(e.code)) throw e; }
  }
  state[id] = {channel:channel.id,message:null};
  save();
  const msg = await channel.send({...payload, ...mentions});
  state[id].message = msg.id;
  save();
}
function refreshAll() { for (const id of Object.keys(state)) queue(id, () => refresh(id)); }
client.once(Events.ClientReady, async () => {
  if (process.argv.includes('--once')) {
    try {
      const ids = Object.keys(state);
      if (!ids.length) throw Error('No counter configured. Run /setcounter gta6 in normal mode first.');
      const results = await Promise.allSettled(ids.map(id => refresh(id)));
      for (const result of results) if (result.status === 'rejected') throw result.reason;
      console.log('Counter updated.');
    } catch (error) {
      console.error(error.message);
      process.exitCode = 1;
    } finally {
      await client.destroy();
    }
    return;
  }
  refreshAll();
  cron.schedule('0 0 * * *',refreshAll,{timezone:zone});
  try { await client.application.commands.create(command.toJSON()); console.log('Counter ready.'); }
  catch (e) { console.error('Command registration:',e.message); }
});
function deleted(msg) {
  const id = msg.guildId;
  if (state[id]?.message === msg.id) queue(id, () => state[id]?.message === msg.id && refresh(id));
}
client.on(Events.MessageDelete,deleted);
client.on(Events.MessageBulkDelete,messages => messages.forEach(deleted));
client.on(Events.InteractionCreate, async i => {
  if (!i.isChatInputCommand() || i.commandName !== 'setcounter') return;
  try {
    await i.deferReply({flags:MessageFlags.Ephemeral});
    if (!i.inGuild() || !i.memberPermissions?.has(P.ManageGuild)) return await i.editReply('Manage Server permission is required.');
    const channel = i.options.getChannel('channel') || i.channel;
    await queue(i.guildId, () => refresh(i.guildId,channel.id));
    await i.editReply('Counter configured in <#'+channel.id+'>.');
  } catch (e) { if (i.deferred) await i.editReply('Could not configure the counter. '+e.message).catch(console.error); }
});
client.login(process.env.DISCORD_TOKEN).catch(e => {console.error(e.message); process.exitCode=1;});
