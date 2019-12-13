import { GlobalWithFetchMock } from 'jest-fetch-mock'
import 'web-audio-test-api'

const customGlobal: GlobalWithFetchMock = global as GlobalWithFetchMock
customGlobal.fetch = require('jest-fetch-mock')
customGlobal.fetchMock = customGlobal.fetch
