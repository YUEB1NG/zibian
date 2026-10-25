// Download the original millimetre-space mesh, never the transformed display mesh.
export function stlFilename(words){
 const safe=value=>String(value).replace(/&/g,'AND').replace(/\//g,'SLASH').replace(/[^A-Z0-9_-]/gi,'_').slice(0,60)||'WORD';
 return `zi-bian_${safe(words.front)}_${safe(words.side)}.stl`;
}
export function stlBlob(buffer){
 if(!(buffer instanceof ArrayBuffer)||buffer.byteLength<134)throw new Error('模型文件不完整 请重新生成');
 const view=new DataView(buffer),count=view.getUint32(80,true);
 if(!count||84+count*50!==buffer.byteLength)throw new Error('模型文件不完整 请重新生成');
 for(let i=0;i<count;i++)for(let j=0;j<12;j++)if(!Number.isFinite(view.getFloat32(84+i*50+j*4,true)))throw new Error('模型坐标异常 请重新生成');
 return new Blob([buffer],{type:'model/stl'});
}
export function downloadSTL(buffer,words){
 const blob=stlBlob(buffer),url=URL.createObjectURL(blob),link=document.createElement('a');
 link.href=url;link.download=stlFilename(words);link.hidden=true;
 document.body.append(link);
 try{link.click();}finally{link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
}
