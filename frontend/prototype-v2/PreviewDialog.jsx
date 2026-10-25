import {useEffect,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {motion} from 'motion/react';
import {X,RefreshCw} from 'lucide-react';
import Viewer from './Viewer';

export default function PreviewDialog({buffer,words,onClose}){
 const dialog=useRef(),viewer=useRef();
 const [mode,setMode]=useState('iso'),[error,setError]=useState('');
 useEffect(()=>{
  const element=dialog.current,previous=document.activeElement,overflow=document.body.style.overflow;
  element.showModal();document.body.style.overflow='hidden';
  return()=>{element.close();document.body.style.overflow=overflow;previous?.focus({preventScroll:true});};
 },[]);
 return createPortal(<motion.dialog ref={dialog} className="preview-modal" aria-labelledby="preview-title" initial={{opacity:0,scale:.97,y:12}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:.97,y:12}} transition={{type:'spring',stiffness:360,damping:34}} onKeyDown={event=>{if(event.key!=='Tab')return;const items=[...dialog.current.querySelectorAll('button:not([disabled]),canvas[tabindex="0"]')],index=items.indexOf(document.activeElement);if(event.shiftKey&&index<=0){event.preventDefault();items.at(-1)?.focus()}else if(!event.shiftKey&&(index===items.length-1||index===-1)){event.preventDefault();items[0]?.focus()}}} onCancel={event=>{event.preventDefault();onClose()}} onClick={event=>{if(event.target!==event.currentTarget)return;const r=event.currentTarget.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)onClose()}}>
  <header className="preview-modal-header"><div><h2 id="preview-title">预览摆件</h2><p>{words.front} / {words.side}</p></div><button type="button" className="icon-button" aria-label="关闭预览" autoFocus onClick={onClose}><X size={21}/></button></header>
  <div className="product-stage expanded-stage"><div className="stage-disc"/><Viewer ref={viewer} buffer={buffer} color="#d6d5d2" grid={false} onError={setError} onViewChange={setMode}/><div className="view-actions"><button type="button" className="turn-button" onClick={()=>viewer.current?.view(mode==='front'?'side':'front')}><RefreshCw size={14}/>看另一面</button></div>{error&&<p className="preview-error" role="alert">{error}</p>}</div>
  <p className="preview-modal-hint">拖动细看 松手回正</p>
 </motion.dialog>,document.body);
}
