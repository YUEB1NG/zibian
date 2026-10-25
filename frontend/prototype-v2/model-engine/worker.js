import Module from 'manifold-3d';
import wasmUrl from 'manifold-3d/manifold.wasm?url';
import data from './glyphs.json';
import {createEngine} from './core.js';
self.onmessage=async({data:input})=>{
 try{
  self.postMessage({type:'progress',stage:'loading'});
  const module=await Module({locateFile:file=>file.endsWith('.wasm')?wasmUrl:file});module.setup();
  const result=createEngine(module,data)(input,progress=>self.postMessage({type:'progress',...progress}));
  self.postMessage({type:'result',...result},[result.buffer]);
 }catch(error){self.postMessage({type:'error',message:error instanceof Error?error.message:'模型生成失败 请重试'});}
};
