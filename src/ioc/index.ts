const env = process.env.NODE_ENV || 'dev'

// Register ioc
require(`./inversify.${env}.config`).default()
