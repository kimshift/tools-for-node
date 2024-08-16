import fs from 'fs'
import path from 'path'
import xlsx from 'node-xlsx'
import { exec } from 'child_process'
import { dateFormat } from './time'

/*******
 * @description: 创建目录
 * @author: 琴时
 * @param {*} absPath [目录路径]
 * @param {*} callback  [回调函数]
 */
export const mkdirPath = (absPath) => {
  try {
    const stats = fs.statSync(absPath)
    if (stats.isDirectory()) {
      // const list = absPath.split('\\')
      // console.log(list[list.length - 1] + '---目录已存在')
      return true
    }
    if (stats.isFile()) {
      console.log('该目录下存在同名文件，无法创建')
      return false
    }
  } catch (error) {
    // 目录不存在---创建目录
    fs.mkdirSync(absPath)
    console.log(absPath + ' 目录创建成功')
    return true
  }
}

/*******
 * @description: 删除路径文件或目录
 * @author: 琴时
 * @param {String} filePath [文件路径]
 */
export const deleteFile = (filePath) => {
  try {
    const stats = fs.statSync(filePath)
    if (stats.isFile()) {
      // 删除文件
      fs.unlinkSync(filePath)
      console.log(`文件：${filePath} 删除成功！`)
      return true
    }
    // 删除目录
    fs.rmdirSync(filePath)
    console.log(`目录：${filePath} 删除成功！`)
    return true
  } catch (err) {
    console.log('文件或目录不存在:', err.message)
    return false
  }
}
/*******
 * @description: 重命名或移动文件\目录[路径不一致时则是移动文件]
 * @author: 琴时
 * @param {*} oldPath   [旧路径]
 * @param {*} newPath   [新路径] [存在则替换]
 * @return {*}
 */
export const renameFile = (oldPath, newPath) => {
  try {
    fs.renameSync(oldPath, newPath)
    console.log('文件重命名成功')
    return true
  } catch (err) {
    console.log('无法重命名文件:', err.message)
    return false
  }
  // fs.rename(oldPath, newPath, error => {
  //   if (error) {
  //     console.log('rename-error：', error)
  //     callback && callback(false, '文件或目录不存在')
  //     return
  //   }
  //   callback && callback(true, 'SUCCESS')
  // })
}

/*******
 * @description: 复制文件
 * @author: 琴时
 * @param {*} oldPath   [源文件路径]
 * @param {*} newPath   [粘贴文件路径] [存在则替换]
 * @return {*}
 */
export const copyFile = (oldPath, newPath) => {
  try {
    const data = fs.readFileSync(oldPath)
    fs.writeFileSync(newPath, data)
    console.log('文件复制成功')
    return true
  } catch (err) {
    console.log('无法复制文件:', err.message)
    return false
  }
  // fs.copyFile(oldPath, newPath, error => {
  //   if (error) {
  //     console.log('rename-error：', error)
  //     callback && callback(false, '复制失败')
  //     return
  //   }
  //   console.log(`${oldPath}文件复制成功`)
  //   callback && callback(true, 'SUCCESS')
  // })
}

/*******
 * @description: 新版node-xlsx
 * @description: json转Excel-流<构造所需数据流>
 * @author: 琴时
 * @param {*} config      [表头数据]
 * @param {*} dataSource  [json数据]
 * @param {*} name        [单表名]
 * @return {*}
 */
export const exportExcel = (config, dataSource, name = 'sheet1') => {
  /**
   * 示例
   * worksheets 数组形式，数组每组数据代表一个sheet页面
   * 其中name：sheet页名称，data:表格数据，二维数组，第一组数据表示表头
   */
  /*  const worksheets = [
    {
      name: 'sheet1',
      data: [
        ['表头A', '表头B', '表头C', '表头D'],
        ['数据A', '数据B', '数据C', '数据D'],
      ],
    },
    {
      name: 'sheet2',
      data: [
        ['表头A', '表头B', '表头C', '表头D'],
        ['数据A', '数据B', '数据C', '数据D'],
      ],
    },
  ] */
  /**
   * 构造二维数组
   * 将json数据转换成Excel需要的二维数组
   */
  const rows = dataSource.map((item) => {
    return config.map((itemN) => {
      if (itemN.prop?.constructor === Array) {
        // 处理多层级Object数据
        let temp = item
        itemN.prop.forEach((index) => {
          temp = temp[index]
        })
        return temp
      }
      const key = itemN.key || itemN.value || itemN.dataIndex
      return item[key] //单层级数据
    })
  })

  /**
   * 配置表头
   */
  const options = []
  const cols = config.map((item) => {
    options.push({
      wch: item.width || 30, //列宽度
    })
    return item.label || item.title || item.caption
  })
  const sheets = {
    name: name, //单表名
    data: [cols, ...rows], //[cols:表头,rows:数据][二维数组]
  }
  const sheetOptions = { '!cols': options }
  const buffer = xlsx.build([sheets], { sheetOptions }) //将Excel格式数据转换成buffer流
  // 写入文件
  // fs.writeFileSync(
  //   `${__dirname}/common/dist/test-sheet.xlsx`,
  //   Buffer.from(buffer)
  // )
  return buffer
}
/*******
 * @description: 旧版：excel-export
 * @description: json转Excel-流<构造所需数据流>
 * @author: 琴时
 * @param {*} config      [表头数据]
 * @param {*} dataSource  [json数据]
 * @param {*} name        [单表名]
 * @return {*}
 */
export const exportExcelOld = (config, dataSource, name = 'sheet1') => {
  /**
   * 构造二维数组
   * 将json数据转换成Excel需要的二维数组
   */
  const rows = dataSource.map((item) => {
    return config.map((itemN) => {
      if (itemN.prop?.constructor === Array) {
        // 处理多层级Object数据
        let temp = item
        itemN.prop.forEach((index) => {
          temp = temp[index]
        })
        return temp
      }
      const key = itemN.key || itemN.value || itemN.dataIndex
      return item[key] //单层级数据
    })
  })
  /**
   * 配置表头
   */
  const cols = config.map((item) => {
    return {
      caption: item.label || item.title || item.caption, //列名
      type: item.type || 'string', //列类型
      width: item.width || 30, //列宽度
    }
  })
  const conf = {
    name: name, //单表名
    cols: cols, //表头配置
    rows: rows, //Excel表数据-二维数组
  }
  return conf
  // const nodeExcel = require('excel-export')
  // const buffer = nodeExcel.execute(conf)
  // return buffer
}

/**
 * 1. 账号：手机号/邮箱都可以
 * 2. 第一行标题保留
 * 3. Excel 表格表头下面请只保留数据
 * 4. 数据量大可以进行分页处理(每一页的表头要保留)
 */
/*******
 * @description: 读取Excel文件并转换成JSON数据
 * @author: 琴时
 * @param {*} path         [Excel文件路径]
 * @param {*} sign         [处理方式]
 * @param {*} section      [读取区间]
 * @return {Array}
 */
export const parseExcel = (params) => {
  try {
    let { path, sign = 'SPORTS', section = [1, -1] } = params
    if (section.constructor === String) {
      section = JSON.parse(section)
    }
    if (!path) return []
    //解析excel, 获取到所有sheets
    const sheets = xlsx.parse(path)
    const data = []
    for (let index = 0; index < sheets.length; index++) {
      const element = sheets[index].data
      if (element.length > 1) {
        const headerCol = element[0] //收集表头
        let xlsxHead = ['ZFB账号', '运动账号', '运动密码', '备注']
        let indexObj = {
          antName: -1,
          username: -1,
          password: -1,
          remark: -1,
        }
        if (headerCol.some((item) => xlsxHead.includes(item))) {
          // 存在表头
          element.shift() //删除每页的表头
          indexObj.antName = headerCol.indexOf('ZFB账号')
          indexObj.username = headerCol.indexOf('运动账号')
          indexObj.password = headerCol.indexOf('运动密码')
          indexObj.remark = headerCol.indexOf('备注')
        }
        switch (sign) {
          case 'SPORTS': //运动账号
            if (indexObj.username === -1 || indexObj.password === -1) {
              /* 兼容用户不按要求格式导入 */
              indexObj.username = 0
              indexObj.password = 1
              indexObj.remark = 2
            }
            /* 构造批量数据体 */
            element.forEach((row) => {
              if (row.length === 0) return // 过滤掉空数据行
              data.push({
                username: row[indexObj.username],
                password: row[indexObj.password],
                remark: row[indexObj.remark] || '',
              })
            })
            break
          case 'ANTS': //ZFB账号
            if (indexObj.antName === -1 || indexObj.username === -1 || indexObj.password === -1) {
              /* 兼容用户不按要求格式导入 */
              indexObj.antName = 0
              indexObj.username = 1
              indexObj.password = 2
              indexObj.remark = 3
            }
            /* 构造批量数据体 */
            element.forEach((row) => {
              if (row.length === 0) return // 过滤掉空数据行
              data.push({
                antName: row[indexObj.antName],
                username: row[indexObj.username],
                password: row[indexObj.password],
                remark: row[indexObj.remark] || '',
              })
            })
            break
          case 'ALL': //保留所有列
            let rows = {}
            element.forEach((row) => {
              if (row.length === 0) return // 过滤掉空数据行
              headerCol.forEach((item, index) => {
                // 将表头作为object对象的key
                rows[item] = row[index]
              })
              data.push(rows)
            })
          default:
            break
        }
      }
    }
    section[0] -= 1
    if (section[1] === -1) section[1] = data.length
    const newData = data.slice(section[0], section[1])
    return newData
  } catch (error) {
    console.log('Excel解析异常:', error.message)
    return []
  }
}

/**
 * 将小米运动账号——ZFB账号转化成[['ZFB账号','小米运动账号']]
 */
export const transformList = (pwd) => {
  fs.readFile('temp.txt', 'utf-8', function (err, data) {
    if (err) {
      console.error(err)
    } else {
      let list = data.split(/[(\r\n)\r\n]+/) // 根据换行或者回车进行识别
      const arrayTemp = []
      list.forEach((item) => {
        if (item) {
          let newList = item.split('——')
          arrayTemp.push([newList[1], newList[0], pwd])
        }
      })
      if (arrayTemp.length === 0) {
        console.log('暂无可导出数据')
        return
      }
      arrayTemp.unshift(['ZFB账号', '小米运动账号', '小米运动密码'])
      exportExcel(arrayTemp)
    }
  })
}

// 将json转化成Excel
export const jsonToList = (jsonData, config) => {
  const rows = jsonData.map((item) => {
    return config.map((itemN) => item[itemN.key])
  })
  const titleRow = config.map((item) => item.label || item.title || item.key)
  rows.unshift(titleRow)
  return rows
}

// 将二维数组生成Excel文件
export const exportExcelFile = (data, fileName = 'cache') => {
  let buffer = xlsx.build([
    {
      name: 'sheet1',
      data: data,
    },
  ])
  const path = `./public/files/${fileName}.xlsx`
  try {
    fs.writeFileSync(path, buffer, { flag: 'w' })
  } catch (error) {
    console.log('二维数组转换异常:', error.message)
  }
  return path
}

export const readExcelFile = (path) => {
  const excelFilePath = path // excel文件路径径
  //解析excel, 获取到所有sheets
  const sheets = xlsx.parse(excelFilePath)
  const data = []
  for (let index = 0; index < sheets.length; index++) {
    const element = sheets[index].data
    if (element.length > 1) {
      element.shift() //删除每页的表头行
      /* 构造批量数据体 */
      element.forEach((row) => {
        const temp = {}
        row.forEach((item, index) => {
          temp[index] = item
        })
        data.push(temp)
      })
    }
  }
  return data
}

/*******
 * @description: 将json转化成txt[buffer]
 * @description: 生成指定格式txt文本【多个则换行】
 * @author: 琴时
 * @param {*} save        [缓存文件]
 * @param {*} config      [表头数据]
 * @param {*} dataSource  [json数据]
 * @return {*}
 */
export const exportTxt = (params) => {
  let {
    config = [{ key: 'username' }, { key: 'password' }],
    dataSource = [],
    reg = '----',
    save,
  } = params || {}
  let data = ''
  dataSource.forEach((item, index) => {
    let symbol = ''
    if (index < data.length - 1) symbol = '\n'
    let row = '' //单行数据
    config.forEach((itemN, indexN) => {
      let symbolReg = ''
      if (indexN < config.length - 1) symbolReg = reg
      if (itemN.prop?.constructor === Array) {
        // 处理多层级Object数据
        let temp = item
        itemN.prop.forEach((index) => {
          temp = temp[index]
        })
        row += temp + symbolReg
      } else {
        const key = itemN.key || itemN.value || itemN.dataIndex
        row += item[key] + symbolReg
      }
    })
    data += symbol + row
  })
  // const string =  Buffer.from(data).toString()
  save && saveBufferToFile(Buffer.from(data))
  return Buffer.from(data)
}

/**
 * string<==>buffer【string与buffer互相转换】
 */
export const strToBuffer = (str) => {
  var buffer = Buffer.from(str) //string==>buffer
  // const string = buffer.toString() //buffer==>string
  return buffer
}

/**
 * 创建txt文本：将json转txt并保存到本地
 * 生成指定格式txt文本【多个则换行】
 * 格式：账号----密码/ZFB----账号----密码
 */
export const writeAccountTxt = (params) => {
  let { data = [], reg = '----', path, sign = 'sport' } = params
  if (data.constructor !== Array) {
    console.log('数据类型格式不正确')
    return
  }
  const time = dateFormat(new Date(), 'YYYYMMDDhhmmss')
  path = path ? `${path + time}-data.txt` : `${time}-data.txt`
  let str = ''
  data.forEach((item, index) => {
    let symbol = ''
    if (index < data.length - 1) symbol = '\n'
    let row =
      sign === 'sport'
        ? `${item.username}${reg}${item.password}`
        : `${item.antName}${reg}${item.username}${reg}${item.password}`
    str += row + symbol
  })
  fs.writeFile(path, str, (err) => {
    if (err) {
      console.log('创建异常:', err)
      return
    }
    const msg = sign === 'sport' ? `账号${reg}密码` : `ZFB${reg}账号${reg}密码`
    console.log(`格式：${msg}的文本===>${path} 生成成功!.`)
  })
}

// 保存Buffer为文本文件到本本地
export const saveBufferToFile = (buffer, path) => {
  const time = dateFormat(new Date(), 'YYYYMMDDhhmmss')
  path = path ? `${path + time}-cache.txt` : `./public/cache/${time}-cache.txt`
  fs.writeFile(path, buffer, (err) => {
    if (err) {
      console.error('保存文件时出错:', err)
    } else {
      console.log('文件保存成功:', path)
    }
  })
}

// 执行shell脚本文件
export const doShell = (path, callback) => {
  const child = exec(`sh ${path}`)
  // 监听执行成功
  child.stdout.on('data', (data) => {
    console.log(`${dateFormat()}-脚本执行日志：`)
    console.log(data)
  })
  // 监听执行失败
  child.stderr.on('data', (err) => {
    console.log('监听执行失败：', err)
  })
  // 监听执行完毕--->关闭
  child.on('close', (code) => {
    console.log('执行shell进程结束：', code)
    /* code：1==>执行shell命令过程中存在错误 */
    callback && callback(code === 0)
  })
}

/*******
 * @description: 读取目录下的文件详情信息
 * @author: 琴时
 * @param {*} directoryPath [目录路径]
 * @param {*} str           [切割标识]
 * @return {Array}
 */
export const readAllFile = (directoryPath, str) => {
  try {
    const files = fs.readdirSync(directoryPath)
    return files
      .filter((file) => {
        const filePath = path.join(directoryPath, file)
        const stats = fs.statSync(filePath)
        return stats.isFile()
      })
      .map((file) => {
        let filePath = path.join(directoryPath, file)
        const stats = fs.statSync(filePath)
        if (str) filePath = filePath.split(str)[1]
        return {
          filePath,
          fileName: file,
          fileType: path.extname(file).split('.')[1],
          fileSize: (stats.size / 1024).toFixed(2) + 'KB',
          fileCtime: stats.ctime.toLocaleString(),
          fileMtime: stats.mtime,
        }
      })
  } catch (error) {
    console.log('无法读取目录内容:', error.message)
    return []
  }
}
// let publicPath = path.join(__dirname, '../public/cache')
// console.log('测试:', readAllFile(publicPath, 'public'))

/**
 * 读取json日志文件
 */
export const readJsonLogFile = (path) => {
  try {
    const data = fs.readFileSync(path)
    let jsonData = JSON.parse(data)
    if (jsonData.constructor !== Object) jsonData = {}
    return jsonData
  } catch (error) {
    console.log('readJsonLogFile-error:', error.message)
    return {}
  }
}
