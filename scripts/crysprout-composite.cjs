const sharp = require('sharp');
const fs = require('node:fs/promises');
const path = require('node:path');
const numbers = [5994,5995,5996,5997,5998,5999,6001,6002,6003,6004];
const dir = 'output/crysprout-backgrounds';
async function main() {
  const report = [];
  const tiles = [];
  for (const n of numbers) {
    const source = `public/products/crysprout/img_${n}.webp`;
    const {data: rgb, info} = await sharp(source).removeAlpha().raw().toBuffer({resolveWithObject:true});
    const {width:w,height:h}=info;
    const mask = await sharp(`${dir}/${n}-mask.png`).resize(w,h).greyscale().raw().toBuffer();
    const bg = await sharp(`${dir}/garden-background.png`).resize(w,h,{fit:'fill'}).removeAlpha().raw().toBuffer();
    const shadow = await sharp(mask,{raw:{width:w,height:h,channels:1}}).blur(3).raw().toBuffer();
    const result = Buffer.alloc(rgb.length);
    let retained=0;
    for(let p=0;p<w*h;p++){
      // Snap confident foreground opaque: keeps source RGB exactly unchanged.
      const a=mask[p]>=230?1:mask[p]<=20?0:(mask[p]-20)/210;
      if(a===1)retained++;
      const shadowIndex=p-w*3-2;
      const shade=shadowIndex>=0?1-0.22*shadow[shadowIndex]/255:1;
      for(let c=0;c<3;c++)result[p*3+c]=a===1?rgb[p*3+c]:Math.round(rgb[p*3+c]*a+bg[p*3+c]*shade*(1-a));
    }
    const output=`${dir}/img_${n}-garden.webp`;
    await sharp(result,{raw:{width:w,height:h,channels:3}}).webp({lossless:true}).toFile(output);
    const decoded=await sharp(output).removeAlpha().raw().toBuffer();
    let changed=0;
    for(let p=0;p<w*h;p++)if(mask[p]>=230)for(let c=0;c<3;c++)if(decoded[p*3+c]!==rgb[p*3+c])changed++;
    if(changed)throw Error(`Foreground pixels changed: ${n}`);
    report.push({source,output,width:w,height:h,opaqueForegroundPixels:retained,changedForegroundChannels:changed});
    for(const file of [source,output])tiles.push(await sharp(file).resize(240,320,{fit:'contain',background:'white'}).png().toBuffer());
  }
  await sharp({create:{width:960,height:1600,channels:3,background:'white'}}).composite(tiles.map((input,i)=>({input,left:(i%4)*240,top:Math.floor(i/4)*320}))).png().toFile(`${dir}/comparison.png`);
  await fs.writeFile(`${dir}/verification.json`,JSON.stringify(report,null,2));
  console.log(report);
}
main().catch(e=>{console.error(e);process.exit(1)});
