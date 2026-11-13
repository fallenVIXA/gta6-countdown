const { release, preload, source } = require('./config.json');
const zone = 'Europe/Warsaw';
const calendar = new Intl.DateTimeFormat('sv-SE', { timeZone: zone });
function embed(now = new Date()) {
  const days = (Date.parse(release) - Date.parse(calendar.format(now))) / 86400000;
  const label = days < 0 ? 'GTA VI has been released!' : days === 0 ? 'Today is the day!' : days + (days === 1 ? ' day' : ' days');
  const preloadDays = (Date.parse(preload) - Date.parse(calendar.format(now))) / 86400000;
  const preloadLabel = preloadDays <= 0
    ? 'GTA VI is now available to preload!'
    : preloadDays + (preloadDays === 1 ? ' day' : ' days');
  const formatDate = value => new Date(value).toLocaleDateString('en-GB', {
    dateStyle: 'long', timeZone: 'UTC'
  });
  return {
    title: 'GTA VI Countdown',
    url: source,
    color: 0xe66798,
    description: '**' + label + '**',
    fields: [
      { name: 'Release date', value: formatDate(release) },
      { name: 'Preload — ' + formatDate(preload), value: '**' + preloadLabel + '**' },
      { name: 'Last updated', value: now.toLocaleString('en-GB', {
        timeZone: zone, dateStyle: 'long', timeStyle: 'medium'
      }) + ' (Europe/Warsaw)' }
    ],
    footer: { text: 'PlayStation 5 · Xbox Series X|S' }
  };
}
module.exports = { embed, zone };
