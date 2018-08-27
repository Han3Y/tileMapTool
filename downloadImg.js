const lngLatToTile = require('./mapTool')
const fs =require('fs');
const path = require('path');
const request = require('request');
const mapData = require('./mapData');

const dir = mapData.dir;
const downloadInfo = mapData.downloadInfo;
const level = [];
let resolveInfo = (info)=>{
    let mLeftBottomTile = '';
    let mRightTopTile = '';
    for (let i = 0;i < info.zoomList.length;i ++){
         mLeftBottomTile = lngLatToTile(info.minLng,info.minLat,info.zoomList[i].z);
         mRightTopTile = lngLatToTile(info.maxLng,info.maxLat,info.zoomList[i].z);
         level.push({
             z:info.zoomList[i].z,
             xmin:mLeftBottomTile.x,
             ymin:mLeftBottomTile.y,
             xmax:mRightTopTile.x,
             ymax:mRightTopTile.y,
             url:info.zoomList[i].url,
         })
    }
};
resolveInfo(downloadInfo);
let count = 0;
let total = 0;
let finished = 0;
let getTotal = ()=>{
    for(let i = 0;i<level.length;i++){
        total += ((level[i].xmax - level[i].xmin)+1) * ((level[i].ymax - level[i].ymin) + 1);
    }
};
getTotal();
let download = (url, z,x,y)=>{
    request.head(url, function(err, res, body){
        if(err){
            console.log('error1:'+ err);
        }
        let rootPath = path.resolve(`${dir}`);
        let filePath = path.resolve(`${dir}/${z}`);
        let filePath1 = path.resolve(`${dir}/${z}/${x}`);
        if(!fs.existsSync(rootPath)){
            fs.mkdirSync(rootPath);
        }
        if(!fs.existsSync(filePath)){
            fs.mkdirSync(filePath);
        }
        if(!fs.existsSync(filePath1)){
            fs.mkdirSync(filePath1);
        }
        // request(url).on('response',function (response) {
        //     console.log(`缩放等级：${z},x：${x}，y：${y}`);
        // }).on('error',function (err) {
        //     console.log('error2:'+ err);
        // }).pipe(fs.createWriteStream(filePath1+ "/"+ `${y}.jpg`));
        request({uri:url,encoding: 'binary'},function (err,res,body) {
            if (!err && res.statusCode == 200) {
                fs.writeFile(filePath1+ "/"+ `${y}.jpg`, body, 'binary',function (err) {
                    finished ++;
                    console.log(`下载：${finished}/${total}`);
                    if (err) {console.log(err);}
                });
            }
        });
    });
};
let sleep = time=>{
    return new Promise((resolve,reject)=>{
        setTimeout(()=>{
            resolve();
        },time)
    });
};
(async ()=>{
    for(let i = 0;i<level.length;i++){
        for(let x = level[i].xmin;x<= level[i].xmax;x++){
            for(let y = level[i].ymin;y<=level[i].ymax;y++){
                count ++;
                let url = '';
                let z= level[i].z;
                if(level[i].url){
                    url = level[i].url.replace(/xval/g,x);
                    url = url.replace(/yval/g,y);
                    url = url.replace(/zval/g,z);
                }else{
                    url = 'http://online3.map.bdimg.com/tile/?qt=tile&x=xval&y=yval&z=zval&styles=pl&scaler=1&udt=20180810'.replace(/xval/g,x);
                    url = url.replace(/yval/g,y);
                    url = url.replace(/zval/g,z);
                }
                if(count % 100 == 0){
                    await sleep(1000);
                }
                download(url,z,x,y);
            }
        }
    }
})();

