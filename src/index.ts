import './promise-extension'
import request, { ApiConfig, AppEnvironment } from './request'
import router from './router'
import utils from './utils'

export default {
  ...request,
  ...router,
  ...utils,
  ApiConfig,
  AppEnvironment
}