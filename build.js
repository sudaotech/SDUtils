const fs = require('fs')
const path = require('path')
const UglifyJS = require('uglify-js')

const rootPath = path.resolve('./.temp')

function fileDisplay(filePath){
  //根据文件路径读取文件，返回文件列表
  fs.readdir(filePath,function(err,files){
    if(err){
      console.warn(err)
    }else{
      //遍历读取到的文件列表
      files.forEach(function(filename){
        //获取当前文件的绝对路径
        var filedir = path.join(filePath, filename);
        //根据文件路径获取文件信息，返回一个fs.Stats对象
        fs.stat(filedir,function(eror, stats){
          if(eror){
            console.warn('获取文件stats失败');
          }else{
            var isFile = stats.isFile();//是文件
            var isDir = stats.isDirectory();//是文件夹
            if(isFile){
              let newFileName = new String(filedir).replace('/.temp/', '/dist/')

              let fileName = path.basename(newFileName)

              let newDir = newFileName.replace(fileName, '')
              if (mkdirsSync(newDir)) {
                var content = fs.readFileSync(filedir, 'utf-8');
                if (filedir.endsWith('.d.ts')) {
                  fs.writeFile(newFileName, content, function (error) {
                    if (error) {
                      return console.log(error)
                    }
                    console.log(`写入成功  ${newFileName}`)
                  })
                } else {
                  content = UglifyJS.minify(content)
                  // 写文件
                  fs.writeFile(newFileName, content.code, function (error) {
                    if (error) {
                      return console.log(error)
                    }
                    console.log(`写入成功  ${newFileName}`)
                  })
                }

              }

            }
            if(isDir){
              fileDisplay(filedir);//递归，如果是文件夹，就继续遍历该文件夹下面的文件
            }
          }
        })
      });
    }
  });
}

function mkdirsSync(dirname) {
  if (fs.existsSync(dirname)) {
    return true;
  } else {
    if (mkdirsSync(path.dirname(dirname))) {
      fs.mkdirSync(dirname);
      return true;
    }
  }
}

fileDisplay(rootPath)