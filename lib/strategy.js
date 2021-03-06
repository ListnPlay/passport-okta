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
        this.oktaAPI = new OktaAuth(opts.oktaToken, null, null, opts.oktaUrl, opts.oktaPreview);
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

            self.oktaAPI.users.get(result.resp._embedded.user.id, (data) => {
                if (!data.success) {
                    return self.fail({message: "Invalid username or password, please contact support"}, 401);
                } else {
                    let user = data.resp
                    return self.success({
                        username: user.profile.login,
                        email: user.profile.login,
                        externalId: user.profile.uuid,
                        givenName: user.profile.firstName,
                        middleName: '',
                        surname: user.profile.lastName,
                        fullName: user.profile.firstName + ' ' + user.profile.lastName,
                        createdAt: user.created,
                        providerData: {userId: user.id, providerType: user.credentials && user.credentials.provider && user.credentials.provider.type == "OKTA" ? 'REGULAR' : 'SOCIAL'}
                    })
                }

            })
        } else {
            return self.fail({message: "Invalid username or password"}, 401);
        }
    })
};

module.exports = Strategy;
