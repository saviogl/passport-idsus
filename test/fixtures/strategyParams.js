var Chance = new require('chance')();
var domain = Chance.domain();

module.exports = {
  authURL: Chance.url({ domain: domain, path: '' }),
  clientID: Chance.guid(),
  clientSecret: Chance.guid(),
  callbackURL: Chance.url({ domain: domain, path: 'auth/idsus/callback' })
};