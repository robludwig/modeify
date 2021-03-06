var tap = require('tap')

module.exports = function (reactive) {
  reactive.bind('on-tap', function (el, method) {
    var view = this.reactive.view
    tap(el, function (e) {
      e.preventDefault()
      e.stopPropagation()

      var fn = view[method]
      if (fn) view[method](e)
    })
  })
}
