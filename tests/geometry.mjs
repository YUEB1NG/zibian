import assert from 'node:assert/strict';
import fs from 'node:fs';
import Module from '../frontend/node_modules/manifold-3d/manifold.js';
import {createEngine} from '../frontend/prototype-v2/model-engine/core.js';
import {stlBlob} from '../frontend/prototype-v2/stl-export.js';
const data=JSON.parse(fs.readFileSync(new URL('../frontend/prototype-v2/model-engine/glyphs.json',import.meta.url),'utf8'));
assert.equal(data.license,'OFL-1.1');assert.equal(Object.keys(data.glyphs).length,38);
for(const [char,g] of Object.entries(data.glyphs)){
 let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
 for(let i=0;i<g.vertices.length;i+=3){const x=g.vertices[i]*g.scale+g.bearing,y=g.vertices[i+1]*g.scale+g.lift;minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);}
 assert(Math.abs(minX)<1e-5&&Math.abs(minY)<1e-5&&Math.abs(maxX-g.width)<1e-5&&Math.abs(maxY-100)<1e-5,`Complete glyph bounds: ${char}`);
}
const mod=await Module();mod.setup();const generate=createEngine(mod,data);const reports=[];
for(const [front,side] of [['LOVE','HOME'],['MARS','HOME'],['HELLO','WORLD'],['ALICE','BOB'],['QI','SKY'],['A&/B','2026'],['A','B'],['LONGERNAME12','MYNAME123456']]){
 const r=generate({front,side});assert(r.watertight&&r.volume>0&&r.triangles>0);if(front==='LOVE'||front==='MARS')assert.equal(r.components,1,'Default preview and standard fixture must connect to the base');assert(r.dimensions.every(v=>Number.isFinite(v)&&v>0));assert(r.components===1||r.warnings.length>0);assert.equal(stlBlob(r.buffer).size,r.buffer.byteLength);const {buffer,...report}=r;reports.push(report);
}
fs.mkdirSync('docs',{recursive:true});fs.writeFileSync('docs/geometry-checks.json',JSON.stringify({font:'Arimo',glyphsChecked:38,models:reports},null,2));console.log('PASS: 38 complete glyph bounds and 8 generated STL models');
