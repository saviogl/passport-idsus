/* jshint camelcase: false */
var IdsusStrategy = require('..'),
  Chance = new require('chance')(),
  util = require('./lib/util'),
  nock = require('nock'),
  VError = require('verror'),
  fixtures = require('./fixtures');

var domain = Chance.domain();

// Fake data to be used as parameter to load IdsusStrategy
var IdsusStrategyParams = {
  authURL: Chance.url({ domain: domain, path: '' }),
  clientID: Chance.guid(),
  clientSecret: Chance.guid(),
  callbackURL: Chance.url({ domain: domain, path: 'auth/idsus/callback' })
};

describe('Strategy', function() {

  describe('constructed', function() {
    var strategy = new IdsusStrategy(IdsusStrategyParams, function() {});

    it('should be named idsus', function() {
      expect(strategy.name).to.equal('idsus');
    });
  });

  describe('constructed with undefined options', function() {
    it('should throw TypeError', function() {
      expect(function() {
        return new IdsusStrategy(undefined, function() {});
      }).to.throw(TypeError);
    });
  });

  describe('authorization request', function() {
    var strategy = new IdsusStrategy(IdsusStrategyParams, function() {});

    it('should be redirected', function(done) {
      chai.passport.use(strategy)
        .redirect(function(redirectUrl) {
          expect(redirectUrl).to.equal(util.redirectUrl(IdsusStrategyParams));
          done();
        })
        .authenticate();
    });
  });

  describe('retrieve access token and user data', function() {
    before(function() {
      // Setup Nock inteceptor for valid token
      nock(IdsusStrategyParams.authURL)
        .post('/oauth/token/')
        .reply(200, fixtures.accessToken);

      // Setup Nock inteceptor for user profile
      nock(IdsusStrategyParams.authURL)
        .get('/api/user/')
        .query(true)
        .reply(200, fixtures.userSchema);
    });

    it('should fetch user data', function(callback) {
      var strategy = new IdsusStrategy(IdsusStrategyParams, function(accessToken, tokenType, expiresIn, refreshToken, scope, user, done) {
        expect(accessToken).to.be.a('string');
        expect(accessToken).to.be.equal(fixtures.accessToken.access_token);
        expect(tokenType).to.be.a('string');
        expect(tokenType).to.be.equal(fixtures.accessToken.token_type);
        expect(expiresIn).to.be.a('date');
        expect(refreshToken).to.be.a('string');
        expect(refreshToken).to.be.equal(fixtures.accessToken.refresh_token);
        expect(scope).to.be.a('array');
        expect(scope.lenght).to.be.equal(fixtures.accessToken.scope.split(' ').lenght);
        expect(user).to.be.a('object');
        expect(user).to.have.all.keys(Object.keys(fixtures.userSchema));
        expect(done).to.be.a('function');
        done(null, user);
      });

      chai.passport.use(strategy)
        .req(function(req) {
          req.query = {};
          req.query.code = Chance.guid();
        })
        .success(function(user) {
          expect(user).to.be.a('object');
          callback();
        })
        .authenticate();
    });

    after(function() {
      nock.cleanAll();
    });
  });

  describe('invalid autorization code', function() {
    var strategy = new IdsusStrategy(IdsusStrategyParams, function() {});

    before(function() {
      // Setup Nock inteceptor
      nock(IdsusStrategyParams.authURL)
        .post('/oauth/token/')
        .reply(401, {
          error: 'invalid_grant'
        });
    });

    it('should fail with invalid authorization code', function(done) {
      chai.passport.use(strategy)
        .req(function(req) {
          req.query = {};
          req.query.code = Chance.guid();
        })
        .error(function(error) {
          expect(error).to.be.instanceof(VError);
          expect(error.message).to.be.equal('invalid_grant');
          done();
        })
        .authenticate();
    });

    after(function() {
      nock.cleanAll();
    });
  });
});
