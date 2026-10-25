import {chromium} from '../frontend/node_modules/playwright-core/index.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {stlBlob,stlFilename} from '../frontend/prototype-v2/stl-export.js';
const url=process.argv[2]||'http://127.0.0.1:8877/';
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const output='data/stl-export-checks';fs.mkdirSync(output,{recursive:true});fs.mkdirSync('docs',{recursive:true});
assert.equal(stlFilename({front:'A&/B',side:'2026'}),'zi-bian_AANDSLASHB_2026.stl');
for(const invalid of [null,new ArrayBuffer(80),new ArrayBuffer(134)])assert.throws(()=>stlBlob(invalid));
const bad=new ArrayBuffer(134),badView=new DataView(bad);badView.setUint32(80,1,true);badView.setFloat32(96,NaN,true);assert.throws(()=>stlBlob(bad));
function geometry(bytes){
 const count=bytes.readUInt32LE(80);assert.equal(bytes.length,84+count*50);assert(count>0);
 const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
 for(let i=0;i<count;i++)for(let j=0;j<9;j++){const v=bytes.readFloatLE(96+i*50+j*4);assert(Number.isFinite(v));min[j%3]=Math.min(min[j%3],v);max[j%3]=Math.max(max[j%3],v);}
 return {triangles:count,dimensions:max.map((v,i)=>v-min[i]),bottom:min[2],sha256:hash(bytes)};
}
const browser=await chromium.launch({executablePath:process.env.BROWSER_PATH||(fs.existsSync('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe')?'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe':undefined),headless:true,args:['--enable-unsafe-swiftshader']});const results=[],errors=[];
try{
 for(const width of [1440,393,320]){
  const p=await browser.newPage({viewport:{width,height:900},isMobile:width<600,hasTouch:true,acceptDownloads:true});p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(()=>{const Original=window.Worker;window.Worker=class extends Original{constructor(...args){super(...args);this.addEventListener('message',e=>{if(e.data.type==='result')window.generatedSTL=Array.from(new Uint8Array(e.data.buffer));});}};});
  await p.goto(url+'?inspectDebug=1',{waitUntil:'networkidle'});await p.waitForFunction(()=>document.querySelector('canvas')?.getInspectionState?.());
  const action=p.getByRole('button',{name:'导出 STL',exact:true});await action.scrollIntoViewIfNeeded();await p.waitForTimeout(600);
  const actionBounds=await action.boundingBox(),price=await p.locator('.purchase-info').boundingBox();assert(actionBounds.y+actionBounds.height<=price.y);assert.equal(await p.locator('.checkout').count(),0);
  async function download(stem){const pending=p.waitForEvent('download',{timeout:30000});await action.click();const d=await pending;assert.equal(await d.failure(),null);await d.saveAs(`${output}/${width}-${stem}.stl`);return {bytes:fs.readFileSync(`${output}/${width}-${stem}.stl`),name:d.suggestedFilename()};}
  const original=await download('original');assert.equal(original.name,'zi-bian_LOVE_HOME.stl');const sample=Buffer.from(await (await p.request.get(url+'demo.stl')).body());assert.equal(hash(original.bytes),hash(sample));
  await p.getByRole('button',{name:'看另一面',exact:true}).click();await p.waitForTimeout(500);
  const rotated=await download('rotated');assert.equal(hash(rotated.bytes),hash(original.bytes),'Display rotation must not affect STL');
  await p.getByLabel('第一面文字',{exact:true}).fill('MARS');const changed=await download('changed');assert.equal(changed.name,'zi-bian_MARS_HOME.stl');assert.notEqual(hash(changed.bytes),hash(original.bytes));assert.equal(hash(changed.bytes),hash(Buffer.from(await p.evaluate(()=>window.generatedSTL))),'Must download exactly the newly generated preview buffer');
  await p.getByRole('button',{name:'预览摆件',exact:true}).click();await p.getByRole('dialog',{name:'预览摆件'}).getByText('MARS / HOME',{exact:true}).waitFor();await p.getByRole('button',{name:'关闭预览'}).click();await p.locator('dialog').waitFor({state:'detached'});
  let unexpected=0;const countDownload=()=>unexpected++;p.on('download',countDownload);
  await p.getByLabel('第一面文字',{exact:true}).fill('中文');await action.click();await p.getByRole('alert').waitFor();await p.waitForTimeout(500);assert.equal(unexpected,0,'Invalid input must not export a stale model');p.off('download',countDownload);
  await p.getByLabel('第一面文字',{exact:true}).fill('A&/B');await p.getByLabel('第二面文字',{exact:true}).fill('2026');const special=await download('special');assert.equal(special.name,'zi-bian_AANDSLASHB_2026.stl');assert.equal(hash(special.bytes),hash(Buffer.from(await p.evaluate(()=>window.generatedSTL))));
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await p.screenshot({path:`docs/stl-export-${width}.png`,fullPage:true});
  results.push({width,original:geometry(original.bytes),changed:geometry(changed.bytes),special:geometry(special.bytes),abovePrice:true,exactPreviewBytes:true,rotationUnchanged:true,invalidInputBlocked:true});await p.close();
 }
 const p=await browser.newPage({acceptDownloads:true});let downloads=0;p.on('download',()=>downloads++);await p.route('**/*.wasm',r=>r.abort());await p.goto(url);await p.waitForSelector('canvas');await p.getByLabel('第一面文字',{exact:true}).fill('MARS');await p.getByRole('button',{name:'导出 STL',exact:true}).click();await p.getByRole('alert').waitFor();await p.waitForTimeout(500);assert.equal(downloads,0,'Failed generation must not export old words');await p.close();
 assert.deepEqual(errors,[]);const report={url,status:'passed',results,failedGenerationBlocked:true,malformedBinaryBlocked:true,errors};fs.writeFileSync('docs/stl-export-checks.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{await browser.close();}
