import Taro from '@tarojs/taro-weapp'

type ValidResult = {
  success: boolean,
  message: string
}

const showMsg = (error: object | string, duration: number = 1500): void => {
  let message = error
  if (typeof (error) === 'object') {
    // @ts-ignore
    message = error.message || ''
    // @ts-ignore
    let code = error.code === undefined ? -1 : error.code
    if (code == 0) {
      return
    }
  }
  Taro.showToast({
    title: message,
    duration: duration,
    icon: 'none'
  })
}

const formatDate = (date: number | Date, fmt: string = 'yyyy-MM-dd HH:mm:ss'): string => {
  let inputDate = new Date(date)
  let o = {
    "M+": inputDate.getMonth() + 1, //月份
    "d+": inputDate.getDate(), //日
    "h+": inputDate.getHours() % 12 == 0 ? 12 : inputDate.getHours() % 12, // 12小时制
    "H+": inputDate.getHours(), //小时
    "m+": inputDate.getMinutes(), //分
    "s+": inputDate.getSeconds(), //秒
    "q+": Math.floor((inputDate.getMonth() + 3) / 3), //季度
    "S": inputDate.getMilliseconds() //毫秒
  }
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (inputDate.getFullYear() + "").substr(4 - RegExp.$1.length))
  for (let k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)))
    }
  }
  return fmt
}

const parseDate = (dateStr: string, fmt: string = 'yyyy-MM-dd HH:mm:ss'): Date => {
  let obj = {y: 0, M: 1, d: 0, H: 0, h: 0, m: 0, s: 0, S: 0}
  fmt.replace(/([^yMdHmsS]*?)(([yMdHmsS])\3*)([^yMdHmsS]*?)/g, function (m, $1, $2, $3, $4, idx, old) {
    dateStr = dateStr.replace(new RegExp($1 + '(\\d{' + $2.length + '})' + $4), function (_m, _$1) {
      obj[$3] = parseInt(_$1)
      return ''
    })
    return ''
  })
  obj.M-- // 月份是从0开始的，所以要减去1
  let retVal = new Date(obj.y, obj.M, obj.d, obj.H, obj.m, obj.s)
  if (obj.S !== 0) {
    retVal.setMilliseconds(obj.S)
  }
  return retVal
}

const validIdCard = (idCard: string): ValidResult => {
  let vcity = {
    11: "北京",
    12: "天津",
    13: "河北",
    14: "山西",
    15: "内蒙古",
    21: "辽宁",
    22: "吉林",
    23: "黑龙江",
    31: "上海",
    32: "江苏",
    33: "浙江",
    34: "安徽",
    35: "福建",
    36: "江西",
    37: "山东",
    41: "河南",
    42: "湖北",
    43: "湖南",
    44: "广东",
    45: "广西",
    46: "海南",
    50: "重庆",
    51: "四川",
    52: "贵州",
    53: "云南",
    54: "西藏",
    61: "陕西",
    62: "甘肃",
    63: "青海",
    64: "宁夏",
    65: "新疆",
    71: "台湾",
    81: "香港",
    82: "澳门",
    91: "国外"
  }
  let pass = true
  let tip = ''

  function isCardNo(card) {
    //身份证号码为15位或者18位，15位时全为数字，18位前17位为数字，最后一位是校验位，可能为数字或字符X
    let reg = /(^\d{15}$)|(^\d{17}(\d|X|x)$)/;
    if (reg.test(card) === false) {
      return false
    }
    return true
  }

  function checkProvince(card, vcity) {
    let province = card.substr(0, 2)
    if (vcity[province] == undefined) {
      return false
    }
    return true
  }

  function checkBirthday(card) {
    let len = card.length;
    //身份证15位时，次序为省（3位）市（3位）年（2位）月（2位）日（2位）校验位（3位），皆为数字
    if (len == '15') {
      let re_fifteen = /^(\d{6})(\d{2})(\d{2})(\d{2})(\d{3})$/;
      let arr_data = card.match(re_fifteen);
      let year = arr_data[2];
      let month = arr_data[3];
      let day = arr_data[4];
      let birthday = new Date('19' + year + '/' + month + '/' + day);
      return verifyBirthday('19' + year, month, day, birthday);
    }
    //身份证18位时，次序为省（3位）市（3位）年（4位）月（2位）日（2位）校验位（4位），校验位末尾可能为X
    if (len == '18') {
      let re_eighteen = /^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X|x)$/;
      let arr_data = card.match(re_eighteen);
      let year = arr_data[2];
      let month = arr_data[3];
      let day = arr_data[4];
      let birthday = new Date(year + '/' + month + '/' + day);
      return verifyBirthday(year, month, day, birthday);
    }
    return false;
  }

  function verifyBirthday(year, month, day, birthday) {
    let now = new Date();
    let now_year = now.getFullYear();
    //年月日是否合理
    if (birthday.getFullYear() == year && (birthday.getMonth() + 1) == month && birthday.getDate() == day) {
      //判断年份的范围（0岁到100岁之间)
      let time = now_year - year;
      if (time >= 0 && time <= 100) {
        return true;
      }
      return false;
    }
    return false;
  }

  function checkParity(card) {
    //15位转18位
    card = changeFivteenToEighteen(card);
    let len = card.length;
    if (len == '18') {
      let arrInt = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2);
      let arrCh = new Array('1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2');
      let cardTemp = 0, i, valnum;
      for (i = 0; i < 17; i++) {
        cardTemp += card.substr(i, 1) * arrInt[i];
      }
      valnum = arrCh[cardTemp % 11];
      if (valnum == card.substr(17, 1).toLocaleUpperCase()) {
        return true;
      }
      return false;
    }
    return false;
  }

  function changeFivteenToEighteen(card) {
    if (card.length == '15') {
      let arrInt = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2);
      let arrCh = new Array('1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2');
      let cardTemp = 0, i;
      card = card.substr(0, 6) + '19' + card.substr(6, card.length - 6);
      for (i = 0; i < 17; i++) {
        cardTemp += card.substr(i, 1) * arrInt[i];
      }
      card += arrCh[cardTemp % 11];
      return card;
    }
    return card;
  }

  //是否为空
  if (idCard === '') {
    pass = false
    tip = '请输入身份证号'
  } else if (isCardNo(idCard) === false) {
    pass = false
    tip = '身份证号码格式错误'
  } else if (checkProvince(idCard, vcity) === false) {
    pass = false
    tip = '身份证号码格式错误'
  } else if (checkBirthday(idCard) === false) {
    pass = false
    tip = '身份证号码校验错误'
  } else if (checkParity(idCard) === false) {
    pass = false
    tip = '身份证号码校验错误'
  }

  let retVal: ValidResult = {
    success: pass,
    message: tip
  }

  return retVal

}

const validMobile = (mobile: string): boolean => {
  const regex =  /^1[34578]\d{9}$/
  return regex.test(mobile)
}

const validFixedPhone = (fixedPhone: string): boolean => {
  const regex = /^(\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,14}$/
  return regex.test(fixedPhone)
}

const trimStr = (input: string): string => {
  return input.replace(/\s*/ig, '')
}

const strIsEmpty = (input?: string): boolean => {
  input = input || ''
  return trimStr(input).length == 0
}

const deepClone = (obj: object): object => {
  return JSON.parse(JSON.stringify(obj))
}

export default {
  showMsg,
  formatDate,
  parseDate,
  validIdCard,
  validMobile,
  validFixedPhone,
  trimStr,
  strIsEmpty,
  deepClone
}