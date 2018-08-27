class Point{
    constructor(x,y){
        this.x = x;
        this.y = y;
    }
}
class PointGeo{
    constructor(lng,lat){
        this.lng = lng;
        this.lat = lat;
    }
}
class PointF{
    constructor(x,y){
        this.x = x;
        this.y = y;
    }
}
let Wm = [75,60,45,30,15,0];
let bv = [
    [-0.0015702102444, 111320.7020616939, 1704480524535203, -10338987376042340, 26112667856603880, -35149669176653700, 26595700718403920, -10725012454188240, 1800819912950474, 82.5],
    [8.277824516172526E-4, 111320.7020463578, 6.477955746671607E8, -4.082003173641316E9, 1.077490566351142E10, -1.517187553151559E10, 1.205306533862167E10, -5.124939663577472E9, 9.133119359512032E8, 67.5],
    [0.00337398766765, 111320.7020202162, 4481351.045890365, -2.339375119931662E7, 7.968221547186455E7, -1.159649932797253E8, 9.723671115602145E7, -4.366194633752821E7, 8477230.501135234, 52.5],
    [0.00220636496208, 111320.7020209128, 51751.86112841131, 3796837.749470245, 992013.7397791013, -1221952.21711287, 1340652.697009075, -620943.6990984312, 144416.9293806241, 37.5],
    [-3.441963504368392E-4, 111320.7020576856, 278.2353980772752, 2485758.690035394, 6070.750963243378, 54821.18345352118, 9540.606633304236, -2710.55326746645, 1405.483844121726, 22.5],
    [-3.218135878613132E-4, 111320.7020701615, 0.00369383431289, 823725.6402795718, 0.46104986909093, 2351.343141331292, 1.58060784298199, 8.77738589078284, 0.37238884252424, 7.45]
];
let Sx = (a,b)=>{
    let c = b[0] + b[1] * Math.abs(a.lng);
    let d = Math.abs(a.lat) / b[9];
    let e = b[2] + b[3] * d + b[4] * d * d + b[5] * d * d * d + b[6] * d * d * d * d + b[7] * d * d * d * d * d + b[8] * d * d * d * d * d * d;
    let f = c * (0 > a.lng ? -1 : 1);
    let g = e * (0 > a.lat ? -1 : 1);
    return new PointF(f,g);
};
//如果经度大于180或者小于-180，将经度调整到-180到180之间
let ft = (a,b,c)=>{
    for (; a > c; ) a -= c - b;
    for (; a < b; ) a += c - b;
    return a;
};
//将纬度调整到-74~74之间
let lt = (a,b,c)=>{
    a = Math.max(a,b);
    a = Math.min(a,c);
    return a;
};

let pointToPixel = (pt,zoom)=>{
    let pt3 = new Point(Math.floor(pt.x * Math.pow(2,zoom - 18)),Math.floor(pt.y * Math.pow(2,zoom - 18)));
    return pt3;
};
let pixelToTile = (pt)=>{
    let pt4 = new Point(Math.floor(pt.x * 1.0 /256),Math.floor(pt.y * 1.0 / 256));
    return pt4;
};
let lngLatToTile = (lng,lat,zoom)=>{
    return pixelToTile(pointToPixel(lngLatToPoint(lng, lat), zoom));
};
let lngLatToPoint = (lng,lat)=>{
    let pt = new PointGeo(ft(lng,-180,180),lt(lat,-74,74));
    let c = null;
    //北纬
    for(let i = 0;i < Wm.length;i++){
        if(pt.lat >= Wm[i]){
            c = bv[i];
            break;
        }
    }
    //南纬
    if(!c || c.length <= 0){
        for(let d = Wm.length; 0<=d;d--){
            if(pt.lat <= -Wm[d]){
                c = bv[d];
                break;
            }
        }
    }
    let fpt = Sx(pt,c);
    return new PointF((new Number(fpt.x)).toFixed(2),(new Number(fpt.y)).toFixed(2));
};


module.exports = lngLatToTile;
