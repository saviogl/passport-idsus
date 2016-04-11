var util = require('util'),
  IdentSus = require('id-sus-sdk-nodejs'),
  Strategy = require('passport-strategy').Strategy,
  _values = require('lodash.values'),
  VError = require('verror');

function IdsusStrategy(options, verify) {
  if (typeof options == 'function') {
    verify = options;
    options = undefined;
  }
  options = options || {};

  if (!verify) {
    throw new TypeError('IdsusStrategy requires a verify callback');
  }
  if (!options.authURL) {
    throw new TypeError('IdsusStrategy requires a authURL option');
  }
  if (!options.clientID) {
    throw new TypeError('IdsusStrategy requires a clientID option');
  }
  if (!options.clientSecret) {
    throw new TypeError('IdsusStrategy requires a clientID option');
  }
  if (!options.callbackURL) {
    throw new TypeError('IdsusStrategy requires a callbackURL option');
  }

  Strategy.call(this);

  this.options = options;

  // Strip last forward bar if there is one
  this.options.authURL = this.options.authURL.charAt(this.options.authURL.length - 1) === '/' ? this.options.authURL.substr(0, this.options.authURL.length - 1) : this.options.authURL;

  this._verify = verify;

  this.name = 'idsus';

  this.idsus = IdentSus({
    client_id: this.options.clientID,
    client_secret: this.options.clientSecret,
    redirect_uri: this.options.callbackURL,
    auth_host: this.options.authURL
  });
}

util.inherits(IdsusStrategy, Strategy);

IdsusStrategy.prototype.authenticate = function(req) {
  var _self = this;
  var IdSUS = _self.idsus;

  function verified(err, user, info) {
    if (err) {
      return _self.error(err);
    }
    if (!user) {
      return _self.fail(info);
    }

    info = info || {};
    _self.success(user, info);
  }

  if (req.query && req.query.code) {

    IdSUS.getAccessToken(req.query.code, function(err, access) {
      if (err) {
        return _self.error(new VError(err));
      }

      IdSUS.getScopes(access.access_token, access.scope, function(err, data) {
        if (err) {
          return _self.error(new VError(err));
        }

        var args = _values(access).concat(data);
        args.push(verified);

        _self._verify.apply(null, args);

      });

    });

  } else {
    _self.redirect(IdSUS.getUrlCode());
  }

};

module.exports = IdsusStrategy;
