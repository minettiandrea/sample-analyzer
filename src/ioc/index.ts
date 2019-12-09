const env = process.env.NODE_ENV || 'development'

// Register ioc
require(`./inversify.${env}.config`).default()
