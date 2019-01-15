import Taro from '@tarojs/taro-weapp'

const CookieKey = 'WX-MINI_COOKIE'

export enum AppEnvironment {
  DEVELOP = 'develop',
  TRIAL = 'trial',
  RELEASE = 'release'
}

export class ApiConfig {
  static baseURL?(path: string): string
  static baseImageURL?(): string
}

export class AbortToken {

  constructor () {

  }

  abortTask: any

  abort () {
    this.abortTask && this.abortTask.abort && this.abortTask.abort()
  }
}

const getAbortToken = (): AbortToken => {
  return new AbortToken()
}

const doGet = (path: string, data: object = {}, abortToken?: AbortToken): Promise<any> => {
  return doRequest(path, data, 'GET', abortToken)
}

const doPost = (path: string, data: object = {}, abortToken?: AbortToken): Promise<any> => {
  return doRequest(path, data, 'POST', abortToken)
}

const doLogin = (path: string, data: object = {}, abortToken?: AbortToken): Promise<any> => {
  return doRequest(path, data, 'POST', abortToken, true)
}

const doDelete = (path: string, data: object = {}, abortToken?: AbortToken): Promise<any> => {
  return doRequest(path, data, 'DELETE', abortToken)
}

const doPut = (path: string, data: object = {}, abortToken?: AbortToken): Promise<any> => {
  return doRequest(path, data, 'PUT', abortToken)
}

const doRequest =
  (path: string, data: object = {}, method: RequestMethod = 'GET', abortToken?: AbortToken, isLogin: boolean = false): Promise<any> => {
  let baseURL = ''
  if (ApiConfig.baseURL) {
    baseURL = ApiConfig.baseURL(path)
  }
  if (baseURL.endsWith('/') && path.startsWith('/')) {
    baseURL = baseURL.substring(0, baseURL.length - 1)
  }
  let isNeedDividingLine = !baseURL.endsWith('/') && !path.startsWith('/')
  let requestURL = `${baseURL}${isNeedDividingLine ? '/' : ''}${path}`

  let header = {}
  if (!isLogin) {
    let cookie = Taro.getStorageSync(CookieKey)
    if (cookie) {
      header['Cookie'] = cookie
    }
  }

  return new Promise<any>((resolve, reject) => {
    let promiseResp = Taro.request({
      url: requestURL,
      header: header,
      data: data,
      method: method,
      success: function (res) {
        const respData = res.data === undefined ? {} : res.data
        const respHeader = res.header || {}
        if (res.statusCode == 200) {
          if (isLogin) {
            const cookie = respHeader['Set-Cookie'] || ''
            Taro.setStorageSync(CookieKey, cookie)
          }
          resolve(respData)
        } else {
          reject({
            code: respData.code || -1,
            message: respData.message || '服务器繁忙，请稍后重试'
          })
        }
      },
      fail: function (error) {
        let errMsg = (error.errMsg || '').toLowerCase()
        let code = -1
        let message = '服务器繁忙，请稍后重试'
        if (errMsg.indexOf('abort') >= 0) {
          code = 0;
          message = '取消网络请求'
        }
        reject({
          code: code,
          message: message
        })
      }
    })
    if (abortToken) {
      abortToken.abortTask = promiseResp
    }
  })
}

type RequestMethod = 'OPTIONS' | 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'TRACE' | 'CONNECT'

export default {
  getAbortToken,
  doGet,
  doPost,
  doLogin,
  doDelete,
  doPut,
  doRequest
}