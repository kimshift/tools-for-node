import schedule from 'node-schedule'
/*******
 * @description: 开启定时器
 * @author: 琴时
 * @param {String} name       [定时器名称]
 * @param {String} cron       [表达式] '* * * * * *'分别代表:秒、 分、 时、 天、 月、年 *代表每一次
 * @param {Function} callback [回调函数]
 */
export const openTimer = (name, cron, callback) => {
  try {
    schedule.scheduleJob(name, cron, () => {
      callback && callback()
    })
    if (!schedule.scheduledJobs[name]) return
    let nextInvocation = schedule.scheduledJobs[name].nextInvocation() //下一次执行时间
    if (!nextInvocation && schedule.scheduledJobs[name]) {
      schedule.scheduledJobs[name].cancel()
    }
  } catch (error) {
    console.log('开启定时器异常:', error.message)
  }
}
/*******
 * @description: 关闭定时器
 * @author: 琴时
 * @param {*} name
 */
export const closeTimer = (name) => {
  try {
    if (schedule.scheduledJobs[name]) {
      schedule.scheduledJobs[name].cancel()
    }
  } catch (error) {
    console.log('关闭定时器异常:', error.message)
  }
}
