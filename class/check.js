/**
 * 用于检测项目是否存在
 * created by lqz
 * @returns {boolean}
 */
let projectDate = process.argv[2].slice(2)
let project = process.argv[3]
let path = require('path')
let fs = require('fs')

function check () {
    //接收所打包的参数
    if (project == undefined) {
        console.log('argv project missed ( ¯▽¯；)')
        return false
    }

    if (projectDate == undefined) {
        console.log('argv date missed ( ¯▽¯；)')
        return false
    }

//判断文件夹是否存在
    let subPath = path.resolve(__dirname, '../web/' + projectDate + '/'+ project)
    try {
        fs.accessSync(subPath, fs.F_OK);
    } catch (e) {
        console.log('no project found ( ¯▽¯；)')
        return false
    }
    console.log('project checked success \\(^o^)/ ')
    return true
}


module.exports = {
    check: check,
    project: projectDate + '/'+ project
}
