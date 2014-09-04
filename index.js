
/**
 * Module dependencies
 */

var Strategy = require('sauth/strategy')
  , agent = require('superagent')
  , qs = require('querystring')
  , url = require('url')
  , http = require('http')
  , exec = require('child_process').exec

/**
 * Instagram OAuth API endpoint
 */

var OAUTH_API_ENDPOINT = 'https://api.instagram.com/oauth';

/**
 * Initializes the instagram strategy
 *
 * @api public
 * @param {Object} opts
 * @param {Function} done
 */

module.exports = function (opts, done) {
  return InstagramStrategy(opts).run(done);
};

/**
 * `InstagramStrategy' constructor
 *
 * @api public
 * @param {Object} opts
 */

module.exports.Strategy = InstagramStrategy;
function InstagramStrategy (opts) {
  if (!(this instanceof InstagramStrategy)) {
    return new InstagramStrategy(opts);
  }
  Strategy.call(this, 'instagram');
  this.id = opts['client-id'] || opts.clientId || opts.client_id;
  this.secret = opts['client-secret'] || opts.clientSecret || opts.client_secret;
  this.redirectUri = opts['redirect-uri'] || opts.redirectUri|| opts.redirect_uri;
  this.port = opts.port || opts.p;
  this.server = null;
  this.data = null;

  if (null == this.id) {
    throw new TypeError("expecting client id");
  } else if (null == this.secret) {
    throw new TypeError("expecting client secret");
  } else if (null == this.redirectUri) {
    throw new TypeError("expecting redirect uri");
  } else if (null == this.port) {
    throw new TypeError("expecting server port");
  }
}

// inherit `InstagramStrategy'
InstagramStrategy.prototype = Object.create(Strategy.prototype, {
  constructor: {value: InstagramStrategy}
});

// implements `_setup'
InstagramStrategy.prototype._setup = function (done) {
  done();
};

// implements `_auth'
InstagramStrategy.prototype._auth = function (done) {
  var self = this;
  var server = http.createServer(onrequest);
  var sockets = [];
  var authUrl = (
    OAUTH_API_ENDPOINT +'/authorize/'+
    '?client_id='+ this.id +
    '&redirect_uri='+ this.redirectUri +
    '&response_type=code'
  );

  exec('open http://localhost:'+ this.port, function (err) {
    if (err) { return done(err); }
    server.listen(9999);
  });

  server.on('connection', function (socket) {
    sockets.push(socket);
    socket.setTimeout(1000);
  });

  function onrequest (req, res) {
    if (self.code) { return res.end(); }
    switch (req.url) {
      case '/':
        res.statusCode = 302;
      res.setHeader('Location', authUrl);
      res.end();
      break;

      default:
        self.code = qs.parse(url.parse(req.url).query).code;
      res.setHeader('Connection', 'close');
      res.write('<script> window.close(); </script>');
      res.end();
      server.close(done);
      sockets.forEach(function (socket) {
        socket.destroy();
      });
    }
  }
};

// implements `_access'
InstagramStrategy.prototype._access = function (done) {
  var self = this;
  agent
  .post(OAUTH_API_ENDPOINT +'/access_token')
  .type('form')
  .send({
    client_id: this.id,
    client_secret: this.secret,
    grant_type: 'authorization_code',
    redirect_uri: this.redirectUri,
    code: this.code
  })
  .end(function (err, res) {
    if (err) { return done(err); }
    else if (res.body.code >= 400) {
      err = new Error(res.body.error_message);
      err.name = res.body.error_type;
      err.code = res.body.code;
      return done(err);
    } else {
      self.set(res.body);
      done();
    }
  });
};

// implements `_end'
InstagramStrategy.prototype._end = function (done) {
  console.log(this.data);
  done();
};
