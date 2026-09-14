const sharp=require('sharp');
const fs=require('fs');
const plans=[
 {n:8859,base:[1200,1600],folder:'pumpkin-hair-clip',boxes:{orange:[225,885,235,245],peach:[705,625,220,255],cream:[380,615,245,230],mint:[510,885,215,250],blush:[585,385,210,250],lilac:[815,335,220,300]}},
 {n:8858,base:[1200,1600],folder:'pumpkin-claw-clip',boxes:{cream:[110,750,805,595],taupe:[310,215,645,525]}},
 {n:9051,base:[1400,1050],folder:'pumpkin-brooch',boxes:{autumn:[175,260,370,330],blue:[595,175,305,305],purple:[905,225,350,300],pink:[425,625,340,325],peach:[755,610,345,350]}}
];
(async()=>{for(const plan of plans){const source=`/tmp/cat-ear-rose-full/IMG_${plan.n}.jpeg`;const rotated=await sharp(source).rotate().toBuffer();const m=await sharp(rotated).metadata();const sx=m.width/plan.base[0],sy=m.height/plan.base[1];fs.mkdirSync(`public/products/${plan.folder}`,{recursive:true});for(const [name,b]of Object.entries(plan.boxes)){const rect={left:Math.round(b[0]*sx),top:Math.round(b[1]*sy),width:Math.round(b[2]*sx),height:Math.round(b[3]*sy)};await sharp(rotated).extract(rect).webp({quality:94,effort:6}).toFile(`public/products/${plan.folder}/${name}-crop.webp`);console.log(plan.folder,name,rect.width,rect.height);}}})();
