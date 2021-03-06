var analytics = require('analytics')
var config = require('config')
var introJs = require('intro.js').introJs
var log = require('./client/log')('welcome-flow')
var LocationsView = require('locations-view')
var message = require('./client/messages')('welcomewelcome-flow')
var showPlannerWalkthrough = require('planner-walkthrough')
var RouteModal = require('route-modal')
var routeResource = require('route-resource')

var Locations = require('./locations')
var Welcome = require('./welcome')

var FROM = config.geocode().start_address
var TO = config.geocode().end_address

/**
 * Show Modal
 */

module.exports = function (session) {
  var commuter = session.commuter()
  var plan = session.plan()
  var main = document.querySelector('#main')

  main.classList.add('Welcome')

  var welcome = new Welcome(commuter)

  welcome.on('next', function () {
    var locations = new Locations({
      'locations-view': new LocationsView(plan),
      plan: plan,
      commuter: commuter
    })
    locations.show()

    locations.on('next', function () {
      var route = plan.options()[0]

      routeResource.findByTags(route.tags(plan), function (err, resources) {
        if (err) log.error(err)

        var routeModal = new RouteModal(route, null, {
          context: 'welcome-flow',
          resources: resources,
          plan: plan
        })
        routeModal.show()
        main.classList.remove('Welcome')

        routeModal.on('next', function () {
          analytics.track('Completed Welcome Wizard')

          commuter.updateProfile('welcome_wizard_complete', true)
          commuter.save()

          routeModal.hide()
          highlightResults()
        })
      })

    })

    locations.on('skip', function () {
      commuter.updateProfile('welcome_wizard_complete', true)
      commuter.save()

      main.classList.remove('Welcome')
      locations.hide()
      showPlannerWalkthrough()

      plan.setAddresses(FROM, TO, function (err) {
        if (err) {
          log.error('%e', err)
        } else {
          plan.journey({
            places: plan.generatePlaces()
          })
          plan.updateRoutes()
        }
      })
    })
  })

  // Start!
  welcome.show()
}

/**
 * Intro JS
 */

function highlightResults () {
  var intro = introJs()

  intro.setOptions({
    disableInteraction: false,
    exitOnEsc: false,
    exitOnOverlayClick: false,
    overlayOpacity: 1,
    scrollToElement: false,
    showBullets: false,
    showProgress: false,
    showStepNumbers: false,
    skipLabel: 'Skip',
    doneLabel: 'Close',
    steps: [{
      element: document.querySelector('.Options'),
      intro: message('best-options'),
      position: 'top'
    }, {
      element: document.querySelector('nav .fa-question-circle'),
      intro: message('find-more'),
      position: 'left'
    }]
  })

  intro.start()
}
