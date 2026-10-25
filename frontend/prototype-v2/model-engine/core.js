import {layoutModel} from './layout.js';
export function createEngine(module,data){
 const {Manifold,Mesh,CrossSection}=module,cache=new Map();
 function glyph(char){
  if(!cache.has(char)){
   const g=data.glyphs[char];
   cache.set(char,new Manifold(new Mesh({numProp:3,vertProperties:new Float32Array(g.vertices),triVerts:new Uint32Array(g.triangles)})));
  }
  return cache.get(char);
 }
 return function generate(input,onProgress=()=>{}){
  const started=performance.now(),plan=layoutModel(input,data),owned=[];
  const keep=o=>(owned.push(o),o);
  try{
   const pieces=[];let emptyPairs=0;
   for(let i=0;i<plan.pairs.length;i++){
    const pair=plan.pairs[i].map(item=>{
     let solid=keep(glyph(item.char).scale(item.scale));
     solid=keep(solid.translate(item.translation));solid=keep(solid.rotate(item.rotation));
     if(item.cut){const box=keep(Manifold.cube(item.cut.size));const cutter=keep(box.translate(item.cut.at));solid=keep(solid.subtract(cutter));}
     return solid;
    });
    const piece=keep(pair[0].intersect(pair[1]));if(piece.isEmpty())emptyPairs++;
    // Give rounded glyph bottoms a real connection to the platform, not a tangent contact.
    pieces.push(keep(piece.translate([0,0,-0.2/plan.factor])));
    onProgress({stage:'letters',current:i+1,total:plan.pairs.length});
   }
   // Preserve the original Python generator's complete rectangular platform.
   const section=keep(new CrossSection([plan.base]));
   const baseArea=section.area()*plan.factor**2;
   const base=keep(section.extrude(plan.thickness));pieces.push(keep(base.translate([0,0,-plan.thickness])));
   const merged=keep(Manifold.union(pieces)),scaled=keep(merged.scale(plan.factor)),result=keep(scaled.translate([0,0,plan.spec.base]));
   if(result.status()!=='NoError'||result.isEmpty())throw Error('这组文字计算失败 请换一组文字重试');
   const parts=result.decompose();parts.forEach(keep);const mesh=result.getMesh(),bounds=result.boundingBox();
   const warnings=[];if(parts.length>1)warnings.push('部分笔画可能分离 制作前需要检查连接');if(emptyPairs)warnings.push('部分字符交集为空 请换一组文字');
   return {buffer:binarySTL(mesh),baseArea,spec:plan.spec,dimensions:bounds.max.map((v,i)=>v-bounds.min[i]),triangles:mesh.triVerts.length/3,volume:result.volume(),components:parts.length,watertight:true,warnings,seconds:(performance.now()-started)/1000};
  }finally{for(let i=owned.length-1;i>=0;i--)owned[i].delete();}
 };
}
export function binarySTL(mesh){
 const n=mesh.triVerts.length/3,buffer=new ArrayBuffer(84+n*50),view=new DataView(buffer);
 const label=new TextEncoder().encode('zibian - original glyphs / Manifold');new Uint8Array(buffer,0,label.length).set(label);view.setUint32(80,n,true);
 const p=mesh.vertProperties,stride=mesh.numProp,t=mesh.triVerts;
 for(let i=0;i<n;i++){
  const a=t[i*3]*stride,b=t[i*3+1]*stride,c=t[i*3+2]*stride,ux=p[b]-p[a],uy=p[b+1]-p[a+1],uz=p[b+2]-p[a+2],vx=p[c]-p[a],vy=p[c+1]-p[a+1],vz=p[c+2]-p[a+2];
  let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;const length=Math.hypot(nx,ny,nz)||1;
  const at=84+i*50;view.setFloat32(at,nx/length,true);view.setFloat32(at+4,ny/length,true);view.setFloat32(at+8,nz/length,true);
  for(let j=0;j<3;j++)for(let k=0;k<3;k++)view.setFloat32(at+12+j*12+k*4,p[t[i*3+j]*stride+k],true);
 }
 return buffer;
}
