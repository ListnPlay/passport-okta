var OktaAuth = require('okta-node');
var version = require('../package.json').version;
var passportVersion = require('passport/package.json').version;

function lookup(obj, field) {
    if (!obj) { return null; }
    var chain = field.split(']').join('').split('[');
    for (var i = 0, len = chain.length; i < len; i++) {
        var prop = obj[chain[i]];
        if (typeof(prop) === 'undefined') { return null; }
        if (typeof(prop) !== 'object') { return prop; }
        obj = prop;
    }
    return null;
}

function Strategy(o){
    var opts = o || {};

    this._usernameField = opts.usernameField || 'username';
    this._passwordField = opts.passwordField || 'password';

    var self = this;


    if(opts.oktaAPI){
        this.oktaAPI = opts.oktaAPI;
    }else{
        this.oktaAPI = new OktaAuth(opts.oktaToken, opts.oktaUrl, opts.oktaPreview);
    }

    return this;
}

Strategy.prototype.name = "okta";

Strategy.prototype.authenticate = function(req, options) {
    options = options || {};
    var self = this;
    var username = lookup(req.body, this._usernameField) || lookup(req.query, this._usernameField);
    var password = lookup(req.body, this._passwordField) || lookup(req.query, this._passwordField);
    var data = {username:username,password:password};

    if (!username || !password) {
        return self.fail({ message: options.badRequestMessage || 'Missing credentials' }, 400);
    }

    self.oktaAPI.users.testAuthn(data, (result) => {
        if (result.success && result.resp.status === 'SUCCESS') {

            let user = result.resp._embedded.user

            return self.success({
                providerId: user.id,
                username: user.profile.login,
                email: user.profile.login,
                givenName: user.profile.firstName,
                middleName: '',
                surname: user.profile.lastName,
                fullName: user.profile.firstName + ' ' + user.profile.lastName,
                createdAt: '2017-06-01T11:01:52.484Z', //
                providerData: {providerId: 'stormpath'}
            })
        } else {
            return self.fail({message: result.resp.errorSummary}, 401);
        }
    })
};

module.exports = Strategy;
