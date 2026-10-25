// Geometry placement adapted from the user's POV nametag Python script.
// Original author: Mc_Fly, version 1.0 (June 2022).
// https://www.printables.com/model/222438-pov-nametag
export function normalizeSpec(input){
 const spec={front:input.front?.trim().toUpperCase(),side:input.side?.trim().toUpperCase(),height:input.height??30,base:input.base??3,spacing:input.spacing??3};
 for(const word of [spec.front,spec.side])if(typeof word!=='string'||!/^[A-Z0-9&/]{1,12}$/.test(word))throw Error('请输入 1–12 位英文字母或数字 也支持 & 和 /');
 for(const [key,min,max] of [['height',15,80],['base',1,10],['spacing',0,10]])if(!Number.isFinite(spec[key])||spec[key]<min||spec[key]>max)throw Error('摆件尺寸超出支持范围');
 return spec;
}
export function layoutModel(input,data){
 const spec=normalizeSpec(input),factor=spec.height/100,space=spec.spacing/factor,thickness=spec.base/factor;
 const a=[...spec.front].map(char=>({char,split:0})),b=[...spec.side].map(char=>({char,split:0}));
 const glyph=c=>data.glyphs[c];
 function expand(short,long){
  while(short.length<long.length){
   let width=0,index=-1;
   short.forEach((item,i)=>{const w=glyph(item.char).width;if(w>width&&!item.split&&!data.doNotSplit.includes(item.char)){width=w;index=i;}});
   if(index<0)throw Error('两个词的长度差过大 短词无法继续拆分 请调整文字');
   const char=short[index].char;short.splice(index,1,{char,split:1},{char,split:2});
  }
 }
 expand(b,a);expand(a,b);
 const pairs=[];let x1=0,z1=0,x2=0,z2=0;
 for(let i=0;i<a.length;i++){
  const ga=glyph(a[i].char),gb=glyph(b[i].char),wa=ga.width,wb=gb.width;
  const first={...a[i],scale:[ga.scale,ga.scale,wb],translation:[x1+ga.bearing,ga.lift,z1-wb],rotation:[90,0,0]};
  const second={...b[i],scale:[gb.scale,gb.scale,wa],translation:[x2+gb.bearing,gb.lift,z2],rotation:[90,0,90]};
  if(a[i].split)first.cut={at:[a[i].split===1?x1+wa/2:x1-1,-(z1+1),0],size:[1+wa/2,wb+2,110]};
  if(b[i].split)second.cut={at:[z2-1,b[i].split===1?x2+wb/2:x2-1,0],size:[wa+2,1+wb/2,110]};
  pairs.push([first,second]);
  if(a[i].split!==1){z2+=wa+space;x1+=wa+space;}
  if(b[i].split!==1){z1-=wb+space;x2+=wb+space;}
 }
 // Original least-squares platform fitting, including split-letter offsets.
 let bx=0,by=0,sx=0,sy=0,sxy=0,sx2=0,lastx=0,lasty=0;const down=[],upper=[];
 for(let i=0;i<a.length;i++){
  const wa=glyph(a[i].char).width,wb=glyph(b[i].char).width;
  const ex=bx+wa-(a[i].split?wa/2:0),ey=by+wb-(b[i].split?wb/2:0),mx=(ex-bx)/2,my=(ey-by)/2;
  lastx=ex;lasty=ey;down.push([ex,ey-wb]);upper.push([bx,ey]);
  sx+=bx+mx;sy+=by+my;sxy+=(bx+mx)*(by+my);sx2+=(bx+mx)**2;
  if(a[i].split!==1)bx+=wa+space;if(b[i].split!==1)by+=wb+space;
  if(b[i].split===1)by+=wb/2;if(b[i].split===2)by-=wb/2;
  if(a[i].split===1)bx+=wa/2;if(a[i].split===2)bx-=wa/2;
 }
 const n=a.length,m=n===1?1:(sxy-sx*sy/n)/(sx2-sx*sx/n),tan=Math.tan(Math.atan(m));
 let low=down[0],high=upper[0],pmax=0,pmin=999999999999;
 for(const p of down){const d=p[0]-p[1]/tan;if(d>pmax){pmax=d;low=p;}}
 for(const p of upper){const d=p[0]-p[1]/tan;if(d<pmin){pmin=d;high=p;}}
 const plow=low[1]-m*low[0],phigh=high[1]-m*high[0],m2=-1/m,pright=lasty-m2*lastx;
 const intersect=(p,q)=>{const x=(p-q)/(m2-m);return [x,m*x+p];};
 const base=[intersect(plow,0),intersect(plow,pright),intersect(phigh,pright),intersect(phigh,0)];
 if(!base.flat().every(Number.isFinite))throw Error('这组文字无法形成稳定底座 请调整文字');
 return {spec,pairs,base,thickness,factor};
}
