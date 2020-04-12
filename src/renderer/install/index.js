import App from './app'
import React from 'react'
import ReactDOM from 'react-dom'

function render (Component) {
  ReactDOM.render(<Component />, document.getElementById('app'))
}

render(App)

if (module.hot) {
  module.hot.accept('./app.js', () => render(App))
}
