import os from 'os'
/*******
 * @description: 获取MAC地址
 * @author: 琴时
 * @return {String}
 */
export const device = () => {
  let mac = ''
  const networkInterfaces = os.networkInterfaces()
  for (let i in networkInterfaces) {
    for (let j in networkInterfaces[i]) {
      if (
        networkInterfaces[i][j]['family'] === 'IPv4' &&
        networkInterfaces[i][j]['mac'] !== '00:00:00:00:00:00' &&
        networkInterfaces[i][j]['address'] !== '127.0.0.1'
      ) {
        mac = networkInterfaces[i][j]['mac']
      }
    }
  }
  return mac
}
