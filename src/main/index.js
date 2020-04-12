import App from './app'

if (process.env.NODE_ENV !== 'production') {
  require('./dev')
}

// eslint-disable-next-line no-new
new App()
