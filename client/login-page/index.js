var alerts = require('alerts')
var page = require('page')
var request = require('./client/request')
var session = require('session')
var view = require('view')

var template = require('./template.html')

/**
 * Create `View`
 */

var View = view(template)

/**
 * On button click
 */

View.prototype.login = function (e) {
  e.preventDefault()
  var email = this.find('#email').value
  var password = this.find('#password').value

  request.post('/login', {
    email: email,
    password: password
  }, function (err, res) {
    if (err) {
      window.alert(res.text || 'Failed to login.') // eslint-disable-line no-alert
    } else {
      alerts.push({
        type: 'success',
        text: 'Welcome back!'
      })

      session.login(res.body)
      page('/manager/organizations')
    }
  })
}

/**
 * Expose `render`
 */

module.exports = function (ctx, next) {
  ctx.view = new View()
  next()
}
