export const createDate = (date) => {
  const pattern = /^(?=.*T)(?=.*).*$/
  const patternNum = /^\d*$/
  if (!date) return new Date() // 不传参数
  if (patternNum.test(date)) {
    // 时间戳
    date = parseInt(date)
  } else if (typeof date === 'string' && !pattern.test(date)) {
    //兼容ios: 将时间字符串中的'-'替换成'/' 2021-05-20 00:00:00=>2021/05/20 00:00:00
    date = `${date}`.replace(/-/g, '/')
  }
  return new Date(date)
}

export const timeStamp = (date) => {
  return createDate(date).getTime()
}

/*******
 * @description: 生成时间格式化
 * @author: 琴时
 * @param {date} 需要格式化的时间串（''/null/undefined ==> 默认当前时间）
 * @param {fmt} 格式化样式标识（年-月-日：YYYY-MM-DD）(不传默认返回年-月-日 时:分:秒)
 * @return {*} 返回格式化后的时间字符串
 */
export const dateFormat = (date, fmt = 'YYYY-MM-DD HH:mm:ss') => {
  const dt = createDate(date) //创建时间对象
  // 构造正则匹配:(value)padStart:字符串不满2位数,开头补全'0'
  const o = {
    '[Yy]+': dt.getFullYear(), //年
    'M+': (dt.getMonth() + 1 + '').padStart(2, '0'), //月
    'D+': (dt.getDate() + '').padStart(2, '0'), // 日
    'H+': (dt.getHours() + '').padStart(2, '0'), // 时
    'm+': (dt.getMinutes() + '').padStart(2, '0'), // 分
    's+': (dt.getSeconds() + '').padStart(2, '0'), // 秒
    'w+': '星期' + '日一二三四五六'.charAt(dt.getDay()), // 星期
    'q+': Math.floor((dt.getMonth() + 3) / 3), // 季度
    S: dt.getMilliseconds(), // 毫秒
  }
  // 将正则匹配上的字符替换对应的时间值
  for (const k in o) {
    if (new RegExp(`(${k})`).test(fmt)) {
      fmt = fmt.replace(RegExp.$1, o[k])
    }
  }
  return fmt
}

