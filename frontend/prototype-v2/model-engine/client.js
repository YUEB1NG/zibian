// Each job owns a worker: heavy geometry never blocks gestures, and terminating
// the job releases the complete WASM heap on success, failure or timeout.
export function generateInBrowser(spec,{onProgress=()=>{},signal,timeoutMs=120000}={}){
 return new Promise((resolve,reject)=>{
  if(signal?.aborted){reject(new DOMException('生成已取消','AbortError'));return;}
  if(typeof Worker==='undefined'||typeof WebAssembly==='undefined'){reject(Error('当前浏览器暂不支持生成 请使用新版浏览器打开'));return;}
  const worker=new Worker(new URL('./worker.js',import.meta.url),{type:'module'});
  let finished=false;
  const cleanup=()=>{clearTimeout(timer);signal?.removeEventListener('abort',cancel);worker.terminate();};
  const finish=(fn,value)=>{if(finished)return;finished=true;cleanup();fn(value);};
  const cancel=()=>finish(reject,new DOMException('生成已取消','AbortError'));
  const timer=setTimeout(()=>finish(reject,Error('这次计算时间较长 请减少文字后重试')),timeoutMs);
  signal?.addEventListener('abort',cancel,{once:true});
  worker.onmessage=({data})=>{
   if(data.type==='progress')onProgress(data);
   else if(data.type==='result')finish(resolve,data);
   else if(data.type==='error')finish(reject,Error(data.message));
  };
  worker.onerror=()=>finish(reject,Error('生成引擎加载失败 请检查网络后重试'));
  worker.onmessageerror=()=>finish(reject,Error('生成结果读取失败 请重试'));
  worker.postMessage(spec);
 });
}
