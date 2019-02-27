import Taro from '@tarojs/taro-weapp'

let isFinishJump: boolean = true

/**
 * 界面跳转
 * @param pagePath  目标界面地址
 * @param params     跳转携带参数（只能是简单object类型）
 * @param isPush    是否是push 默认 true
 */
const jumpTo = (pagePath: string, params: object = {}, isPush: boolean = true): Promise<any> => {
  if (pagePath.length == 0) { return }
  if (!isFinishJump) { return }

  isFinishJump = false

  const currentPageList: [] = Taro.getCurrentPages() || []

  params = params || {}

  let pagePathArray = pagePath.split('?').filter(item => item.length > 0)
  let targetURL: string = pagePathArray[0]
  let urlQuery: string = ''

  if (pagePathArray.length > 1) {
    urlQuery = pagePathArray[1]
  }

  if (urlQuery.length > 0 && !urlQuery.endsWith('&')) {
    urlQuery = `${urlQuery}&`
  }

  for (let e in params) {
    urlQuery += `${e}=${params[e]}&`
  }
  if (urlQuery.endsWith('&')) {
    urlQuery = urlQuery.substring(0, urlQuery.length - 1)
  }
  let noNeedSplitFlag = targetURL.endsWith('?') || urlQuery.startsWith('?')
  targetURL = noNeedSplitFlag ? `${targetURL}${urlQuery}` : `${targetURL}?${urlQuery}`

  let fn = Taro.navigateTo
  if (!isPush || currentPageList.length >= 10) {
    fn = Taro.redirectTo
  }

  return new Promise<any>((resolve, reject) => {
    fn({
      url: targetURL
    }).then(() => {
      isFinishJump = true
      resolve()
    }).catch(error => {
      // console.error(error.errMsg || `跳转失败, 目标地址: ${targetURL}`)
      isFinishJump = true
      reject(error)
    })
  })
}

export default {
  jumpTo
}