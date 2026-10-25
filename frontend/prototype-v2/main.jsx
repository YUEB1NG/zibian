import React,{useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {motion,AnimatePresence,MotionConfig} from 'motion/react';
import {ArrowUpRight,ArrowRight,ArrowLeft,ChevronRight,ShoppingBag,Layers,MoveUpRight,RefreshCw,MapPin,Check,Package,Truck,X,LoaderCircle,ShieldCheck,Plus,CheckCheck,Pencil,Maximize2,Download} from 'lucide-react';
import Viewer from './Viewer';
import PreviewDialog from './PreviewDialog';
import {generateInBrowser} from './model-engine/client.js';
import {downloadSTL} from './stl-export.js';
import './style.css';
const spring={type:'spring',stiffness:330,damping:31};
const reveal={initial:{opacity:0,y:18},animate:{opacity:1,y:0},exit:{opacity:0,y:-14},transition:spring};
const requestedScreen=new URLSearchParams(location.search).get('screen');
const initial=['checkout','success'].includes(requestedScreen)?requestedScreen:'create';
function App(){
 const [screen,setScreen]=useState(initial),[words,setWords]=useState({front:'LOVE',side:'HOME'}),[modelWords,setModelWords]=useState({front:'LOVE',side:'HOME'}),[buffer,setBuffer]=useState(null),[loading,setLoading]=useState(false),[generationText,setGenerationText]=useState('正在生成你的摆件'),[modelWarning,setModelWarning]=useState(''),[message,setMessage]=useState(''),[sheet,setSheet]=useState(null),[address,setAddress]=useState(null),[draft,setDraft]=useState({name:'',phone:'',address:''}),[viewMode,setViewMode]=useState('iso'),[addressError,setAddressError]=useState(''),[previewOpen,setPreviewOpen]=useState(false),[exportStatus,setExportStatus]=useState('');
 const viewer=useRef(),generation=useRef(null);
 useEffect(()=>()=>generation.current?.abort(),[]);
 useEffect(()=>{const controller=new AbortController();fetch('./demo.stl',{signal:controller.signal}).then(r=>{if(!r.ok)throw Error();return r.arrayBuffer()}).then(bytes=>setBuffer(current=>current??bytes)).catch(e=>{if(e.name!=='AbortError')setMessage('示例模型加载失败')});return()=>controller.abort();},[]);
 useEffect(()=>{const listener=e=>{if(e.key==='Escape')setSheet(null)};window.addEventListener('keydown',listener);return()=>window.removeEventListener('keydown',listener)},[]);
 const dirty=!buffer||words.front!==modelWords.front||words.side!==modelWords.side;
 function editWord(key,value){setWords(current=>({...current,[key]:value.toUpperCase()}));setMessage('');setExportStatus('');}
 function go(next){if(next==='preview')next='create';setScreen(next);setViewMode('iso');setMessage('');window.scrollTo({top:0,behavior:'smooth'});history.replaceState(null,'','?screen='+next)}
 async function generate(){
  if(loading||generation.current)return;
  if(!/^[A-Z0-9&/]{1,12}$/.test(words.front)||!/^[A-Z0-9&/]{1,12}$/.test(words.side)){setMessage('请输入 1–12 位英文字母或数字 也支持 & 和 /');return;}
  if(buffer&&JSON.stringify(words)===JSON.stringify(modelWords)){return {buffer,words:{...modelWords}};}
  const requested={...words},controller=new AbortController();generation.current=controller;
  setLoading(true);setMessage('');setExportStatus('');setGenerationText('正在准备生成');
  try{
   const result=await generateInBrowser({...requested,height:30,base:3,spacing:3},{signal:controller.signal,onProgress:p=>setGenerationText(p.stage==='loading'?'正在准备生成':'正在生成你的摆件')});
   setBuffer(result.buffer);setModelWords(requested);setModelWarning(result.warnings.length?'这组文字有不相连的部分 请修改文字后再下单':'');
   setMessage('');return {buffer:result.buffer,words:requested};
  }catch(error){if(error.name!=='AbortError')setMessage(error.message);}
  finally{if(generation.current===controller){generation.current=null;setLoading(false);}}
 }
 async function openPreview(){if(loading||generation.current)return;if(dirty&&!(await generate()))return;setPreviewOpen(true)}
 async function exportSTL(){
  if(loading||generation.current)return;
  setExportStatus('');
  const model=await generate();
  if(!model)return;
  try{downloadSTL(model.buffer,model.words);setExportStatus('STL 已交给浏览器保存 · 单位毫米 · 打印前请检查切片');}
  catch(error){setMessage(error.message);}
 }
 function saveAddress(e){e.preventDefault();if(!draft.name.trim()||!/^1\d{10}$/.test(draft.phone)||draft.address.trim().length<6){setAddressError('请填写收件人、11 位手机号和详细收货地址');return}setAddress({...draft});setAddressError('');setSheet(null)}
 function pay(){if(!address){setSheet('address');return}setSheet('payment')}
 const renderStage=(size='large')=><motion.div layoutId="product-stage" className={'product-stage '+size} transition={spring} data-slot="product-model" data-content="原脚本生成的双面立体字 STL" data-ratio={size==='small'?'1:1':'4:3'} data-fit="contain" data-focal="50% 52%" data-safe="12%" data-text-overlap="false" data-replacement="生成新文字后替换 STL，保留舞台与灯光"><div className="stage-disc"/>{buffer&&<Viewer ref={size==='small'?undefined:viewer} buffer={buffer} color="#d6d5d2" autoRotate={false} grid={false} onError={setMessage} onViewChange={setViewMode}/>}<div className="stage-corner"><span className="little-cross"/><span>双面立体字</span></div>{size!=='small'&&<><span className="object-number">01 / ONE OF A KIND</span><div className="stage-label"><span>{modelWords.front}</span><span className="label-divider"/><span>{modelWords.side}</span></div><div className="view-actions"><button className="turn-button" onClick={()=>viewer.current?.view(viewMode==='front'?'side':'front')}><RefreshCw size={14}/>看另一面</button></div></>}</motion.div>;
 return <MotionConfig reducedMotion="user"><div className="site"><header className="header"><a className="brand" href="?screen=create" onClick={e=>{e.preventDefault();go('create')}}><span className="brand-icon"><Layers size={22} strokeWidth={1.6}/></span><b>字变</b><span className="brand-en">ZIBIAN</span></a><div className="desktop-nav"><span>把心意变成立体</span><i/></div><button className="icon-button order-link" onClick={()=>setSheet('orders')} aria-label="我的订单"><ShoppingBag size={20}/><span>我的订单</span></button></header>
 <main><AnimatePresence mode="wait" initial={false}>
 {screen==='create'&&<motion.section key="studio" className="preview studio screen" {...reveal}>
 <motion.div className="preview-copy" {...reveal}><div className="eyebrow">TWO WORDS · ONE LITTLE WORLD</div><h1>两个名字 一份心意</h1><p>拖动细看 松手回正</p></motion.div>
 <motion.div className="preview-hero" {...reveal} transition={{...spring,delay:.06}}>{renderStage('preview-size')}</motion.div>
 <motion.div className="preview-detail" {...reveal} transition={{...spring,delay:.12}}>
 <form onSubmit={e=>{e.preventDefault();if(dirty)generate()}}>
 <div className="model-names editable-names">{['front','side'].map((key,i)=><React.Fragment key={key}>{i===1&&<span className="ampersand">&</span>}<label><span>{i===0?'第一面':'第二面'}<Pencil size={12}/></span><input aria-label={i===0?'第一面文字':'第二面文字'} value={words[key]} disabled={loading} maxLength={12} spellCheck={false} autoComplete="off" onChange={e=>editWord(key,e.target.value)}/></label></React.Fragment>)}</div>
 <p className="field-help">点击文字即可修改 · 支持英文 数字 & /</p>
 <div className="model-actions"><motion.button type="button" className="preview-trigger" disabled={loading} onClick={openPreview} whileHover={{scale:1.01}} whileTap={{scale:.98}}><Maximize2 size={17}/><span>预览摆件</span><ArrowUpRight size={17}/></motion.button><motion.button type="button" className="preview-trigger export-trigger" disabled={loading} onClick={exportSTL} whileHover={{scale:1.01}} whileTap={{scale:.98}}><Download size={17}/><span>导出 STL</span></motion.button></div>
 <AnimatePresence>{exportStatus&&<motion.p key="export-status" className="export-status" role="status" {...reveal}>{exportStatus}</motion.p>}</AnimatePresence>
 <div className="purchase-info"><div><h2>你的专属双面字摆件</h2><span>按你的文字定制 · 实物寄送</span></div><div className="price"><small>¥</small>99<span>示例价</span></div></div>
 <AnimatePresence mode="wait">{message?<motion.p key="error" className="inline-message" role="alert" {...reveal}>{message}</motion.p>:!dirty&&modelWarning?<motion.p key="warning" className="inline-message" role="alert" {...reveal}>{modelWarning}</motion.p>:dirty?<motion.p key="changed" className="edit-status" {...reveal}>文字已修改 生成后查看新效果</motion.p>:null}</AnimatePresence>
 <motion.button layout className="primary" type="button" disabled={loading||(!dirty&&!!modelWarning)} onClick={()=>dirty?generate():go('checkout')}><span aria-live="polite">{loading?generationText:dirty?'生成我的专属摆件':'就要这个 去下单'}</span>{loading?<LoaderCircle className="spin" size={20}/>:<ArrowUpRight size={21}/>}</motion.button>
 <p className="quiet-note">先看效果 满意再下单</p></form>
 </motion.div></motion.section>}
 {screen==='checkout'&&<motion.section key="checkout" className="checkout screen" {...reveal}><div className="step-heading"><button className="back" onClick={()=>go('preview')}><ArrowLeft size={18}/><span>返回预览</span></button><span className="step-meta">02 / 确认订单</span></div><div className="checkout-title"><div className="eyebrow">A LITTLE SOMETHING, JUST FOR YOU</div><h1>把这份心意<br/>送到你身边</h1></div><div className="checkout-content"><div className="order-product">{renderStage('small')}<div><span className="product-type">专属定制 / 双面立体字</span><h2>{modelWords.front}<span> / </span>{modelWords.side}</h2><p>实物摆件 × 1</p></div></div><button className="address-card" onClick={()=>setSheet('address')}><span className="address-icon"><MapPin size={22}/></span><div><strong>{address?address.name+' '+address.phone:'送到哪里'}</strong><span>{address?address.address:'添加收货地址'}</span></div><ChevronRight size={18}/></button><div className="order-cost"><div><span>商品金额</span><b>¥99.00</b></div><div><span>配送费用</span><span>待确认</span></div><div className="total-row"><b>应付金额</b><div><small>¥</small><strong>99</strong><span>+ 运费</span></div></div><p className="price-note">价格为原型示例 最终价格与运费待商家确定</p></div><div className="checkout-action"><button className="primary" onClick={pay}><span>确认并支付</span><ArrowUpRight size={21}/></button><p className="quiet-note"><ShieldCheck size={13}/>当前为流程原型 不会真实扣款</p></div></div><div className="checkout-side"><span>ONE OBJECT<br/>TWO PERSPECTIVES</span><p>有些心意<br/>值得换个角度看</p></div></motion.section>}
 {screen==='success'&&<motion.section key="success" className="success screen" {...reveal}><span className="prototype-pill">支付成功页演示</span><div className="success-symbol"><Check size={32} strokeWidth={1.6}/><span/></div><div className="eyebrow">MADE WITH YOUR WORDS</div><h1>心意已收到</h1><p>接下来 把它变成真正的摆件</p><div className="success-ticket"><div className="ticket-top"><span>你的专属双面字</span><span>× 1</span></div><strong>{modelWords.front}<span> / </span>{modelWords.side}</strong><div className="perforation"/><div className="progress-row"><span className="current"><Check size={14}/>已下单</span><i/><span>制作中</span><i/><span>待寄出</span></div><p>此页仅展示下单完成后的状态 未创建真实订单</p></div><button className="primary" onClick={()=>setSheet('orders')}><span>查看我的订单</span><ArrowUpRight size={20}/></button><button className="plain-link" onClick={()=>go('create')}>再做一份心意 <ArrowRight size={15}/></button></motion.section>}
 </AnimatePresence></main><footer className="site-footer"><span>ZIBIAN</span><span>心意 有另一面</span></footer>
 <AnimatePresence>{previewOpen&&<PreviewDialog key="expanded-preview" buffer={buffer} words={modelWords} onClose={()=>setPreviewOpen(false)}/>}</AnimatePresence>
 <AnimatePresence>{sheet&&<motion.div className="sheet-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={e=>e.target===e.currentTarget&&setSheet(null)}><motion.section role="dialog" aria-modal="true" aria-label={sheet==='address'?'收货地址':sheet==='orders'?'我的订单':'支付流程演示'} className="sheet" initial={{y:50,opacity:0}} animate={{y:0,opacity:1}} exit={{y:50,opacity:0}} transition={spring}><div className="sheet-top"><h2>{sheet==='address'?'送到你身边':sheet==='orders'?'我的订单':'支付流程演示'}</h2><button className="icon-button" onClick={()=>setSheet(null)} aria-label="关闭"><X size={20}/></button></div>{sheet==='address'?<form onSubmit={saveAddress}><p>仅用于本次原型演示 不会提交或保存到服务器</p><label>收件人<input autoFocus required value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})} placeholder="怎么称呼你"/></label><label>手机号码<input required type="tel" value={draft.phone} maxLength={11} onChange={e=>setDraft({...draft,phone:e.target.value})} placeholder="用于配送联系"/></label><label>收货地址<textarea required value={draft.address} onChange={e=>setDraft({...draft,address:e.target.value})} placeholder="省 市 区 街道及门牌号"/></label>{addressError&&<p className="inline-message">{addressError}</p>}<button className="primary" type="submit">保存收货地址 <Check size={18}/></button></form>:sheet==='orders'?<div className="empty-orders"><ShoppingBag size={38} strokeWidth={1.3}/><h3>第一份心意 从这里开始</h3><p>原型中暂未创建真实订单</p><button className="primary" onClick={()=>{setSheet(null);go('create')}}>去定制我的摆件 <ArrowUpRight size={20}/></button></div>:<div className="payment-demo"><ShieldCheck size={36} strokeWidth={1.4}/><h3>这一步 先看流程</h3><p>支付尚未接入<br/>继续仅预览成功页 不会产生订单或扣款</p><button className="primary" onClick={()=>{setSheet(null);go('success')}}>预览支付成功页 <ArrowRight size={18}/></button></div>}</motion.section></motion.div>}</AnimatePresence></div></MotionConfig>
}
createRoot(document.getElementById('root')).render(<App/>);
