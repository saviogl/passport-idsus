var Chance = new require('chance')();
var domain = Chance.domain();

module.exports = {
	loginURL: Chance.url({ domain: domain, path: '' }),
	apiURL: Chance.url({ domain: domain, path: '' }),
  clientID: Chance.guid(),
  clientSecret: Chance.guid(),
  callbackURL: Chance.url({ domain: domain, path: 'auth/idsus/callback' })
};