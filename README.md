# passport-okta

- Based on passport-stormpath. Written as part of the migration from Stormpath to OKta.

*A passport strategy for Okta*

## Installation

To get started, you need to install this package via [npm]
(https://www.npmjs.org/package/passport-okta):

```console
$ npm install passport-okta
```

## Usage

Once you've set the environment variables above, you can then initialize the `passport-okta` strategy like so:

```javascript
var passport = require('passport');
var OktaStrategy = require('passport-okta');
var strategy = new OktaStrategy({
  oktaUrl: 'Your subdomain name from okta',
  oktaToken: 'Your okta token',
  oktaPreview: true/false
});

passport.use(strategy);
```