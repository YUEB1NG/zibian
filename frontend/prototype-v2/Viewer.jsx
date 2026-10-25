import {forwardRef,useEffect,useImperativeHandle,useRef} from 'react';
import * as THREE from 'three';
import {LIMITS,resist,unresist,springStep,DRAG_GAIN,faceInput,faceDrag,faceAssist} from './inspection-motion.js';
import {STLLoader} from 'three/addons/loaders/STLLoader.js';

const Viewer=forwardRef(function Viewer({buffer,color,grid,onError,onReady,onInteract,onViewChange},ref){
 const host=useRef(null), sceneRef=useRef(null), callback=useRef({onError,onReady,onInteract,onViewChange});callback.current={onError,onReady,onInteract,onViewChange};
 useImperativeHandle(ref,()=>({view:(kind)=>sceneRef.current?.view(kind),zoom:(delta)=>sceneRef.current?.zoom(delta),snapshot:()=>sceneRef.current?.snapshot()}),[]);
 useEffect(()=>{
  const el=host.current;let renderer;
  try {renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});}catch(e){callback.current.onError('当前设备无法启动三维预览，请使用支持 WebGL 的浏览器');return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.setClearColor(0xf7f8fa,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
  el.appendChild(renderer.domElement);
  const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-100,100,100,-100,0.1,5000);camera.position.set(260,200,320);
  const canvas=renderer.domElement;
  canvas.tabIndex=0;canvas.setAttribute('aria-label','拖动检视摆件 松手回正 也可按住方向键查看');
  const target=new THREE.Vector3(),home=new THREE.Spherical().setFromVector3(new THREE.Vector3(.9,.65,1.1).normalize().multiplyScalar(450));
  const pose=new THREE.Quaternion(),poseAngles={yaw:0,level:0},up=new THREE.Vector3(0,1,0);
  const right=new THREE.Vector3(Math.cos(home.theta),0,-Math.sin(home.theta));
  const viewUp=new THREE.Vector3().crossVectors(new THREE.Vector3().setFromSpherical(home).normalize(),right).normalize();
  const faceStops=[home.theta,home.theta-Math.PI/2],elevation=Math.PI/2-home.phi;
  const levelQuaternion=new THREE.Quaternion(),yawQuaternion=new THREE.Quaternion(),pitchQuaternion=new THREE.Quaternion(),rotationMatrix=new THREE.Matrix4();
  let zoomVelocity=0,zoomUntil=0;
  const offset={x:0,y:0},velocity={x:0,y:0},pointers=new Map();
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let drag=null,pinch=null,keyActive=null;
  scene.add(new THREE.HemisphereLight(0xffffff,0xb0b0b0,1.6));
  const key=new THREE.DirectionalLight(0xffffff,2.6);key.position.set(-140,300,230);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-300,right:300,top:300,bottom:-300,near:.1,far:1000});key.shadow.bias=-.0005;key.shadow.normalBias=.06;scene.add(key);
  const fill=new THREE.DirectionalLight(0xffffff,1.0);fill.position.set(150,100,-180);scene.add(fill);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(1800,1800),new THREE.ShadowMaterial({opacity:.19}));floor.rotation.x=-Math.PI/2;floor.position.y=-.12;floor.receiveShadow=true;floor.visible=false;scene.add(floor);
  const gridHelper=new THREE.GridHelper(800,80,0xd8dde6,0xe6e9ef);gridHelper.material.transparent=true;gridHelper.material.opacity=0;gridHelper.position.y=-.2;scene.add(gridHelper);
  const state={scene,camera,target,renderer,mesh:null,span:150,gridHelper,tween:null,baseAxis:new THREE.Vector3(1,0,0)};
  function resize(){const w=el.clientWidth,h=el.clientHeight;if(!w||!h)return;renderer.setSize(w,h);const a=w/h;const half=state.span*.53/(Math.min(a,1.4)*.9);camera.left=-half*a;camera.right=half*a;camera.top=half;camera.bottom=-half;camera.updateProjectionMatrix();}
  state.resize=resize;
  function release(){
   drag=null;pinch=null;keyActive=null;pointers.clear();canvas.classList.remove('is-inspecting');
   for(const axis of ['x','y'])velocity[axis]=0;
   zoomUntil=0;zoomVelocity=0;
  }
  state.view=(kind)=>{
   release();zoomUntil=0;zoomVelocity=0;
   const end={yaw:kind==='front'?faceStops[0]:kind==='side'?faceStops[1]:0,level:kind==='iso'?0:1};
   state.viewMode=kind;state.tween={start:{...poseAngles},end,t:performance.now()};callback.current.onViewChange?.(kind);
  };
  state.zoom=(delta)=>{zoomUntil=performance.now()+180;zoomVelocity=0;camera.zoom=THREE.MathUtils.clamp(camera.zoom*delta,.7,1.8);camera.updateProjectionMatrix();};
  state.snapshot=()=>{renderer.render(scene,camera);return canvas.toDataURL('image/png');};
  function beginDrag(point){
   drag={x:point.x,y:point.y,originX:faceInput(offset.x,poseAngles.yaw,faceStops),originY:unresist(offset.y,LIMITS.y)};
   velocity.x=velocity.y=0;
  }
  function distance(){const [a,b]=[...pointers.values()];return Math.hypot(a.x-b.x,a.y-b.y);}
  function pointerDown(e){
   if((e.pointerType==='mouse'&&e.button!==0)||pointers.size>=2)return;
   e.preventDefault();canvas.setPointerCapture(e.pointerId);keyActive=null;
   zoomUntil=0;zoomVelocity=0;
   callback.current.onInteract?.();
   pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
   canvas.classList.add('is-inspecting');
   if(pointers.size===1)beginDrag(pointers.get(e.pointerId));
   else if(pointers.size===2){drag=null;pinch={distance:Math.max(distance(),1),zoom:camera.zoom};}
  }
  function pointerMove(e){
   if(!pointers.has(e.pointerId))return;
   pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
   if(pointers.size===1&&drag){
    offset.x=faceDrag(drag.originX+(e.clientX-drag.x)/Math.max(el.clientWidth,1)*DRAG_GAIN.x,poseAngles.yaw,faceStops);
    offset.y=resist(drag.originY+(e.clientY-drag.y)/Math.max(el.clientHeight,1)*DRAG_GAIN.y,LIMITS.y);
   }else if(pinch&&pointers.size>=2){
    camera.zoom=THREE.MathUtils.clamp(pinch.zoom*distance()/pinch.distance,.7,1.8);camera.updateProjectionMatrix();
   }
  }
  function pointerEnd(e){
   if(!pointers.has(e.pointerId))return;
   pointers.delete(e.pointerId);pinch=null;
   if(pointers.size===1)beginDrag([...pointers.values()][0]);
   else if(pointers.size===0)release();
   if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);
  }
  function wheel(e){e.preventDefault();state.zoom(Math.exp(-e.deltaY*.001));}
  function keyDown(e){
   const directions={ArrowLeft:[-.35,0],ArrowRight:[.35,0],ArrowUp:[0,-.18],ArrowDown:[0,.18]};
   if(e.key==='Escape'){release();state.view('iso');return;}
   if(!directions[e.key]||pointers.size)return;
   e.preventDefault();keyActive=e.key;[offset.x,offset.y]=directions[e.key];velocity.x=velocity.y=0;
  }
  function keyUp(e){if(e.key===keyActive)release();}
  function hidden(){if(document.hidden)release();}
  canvas.addEventListener('pointerdown',pointerDown);
  canvas.addEventListener('pointermove',pointerMove);
  for(const name of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(name,pointerEnd);
  canvas.addEventListener('wheel',wheel,{passive:false});
  canvas.addEventListener('keydown',keyDown);canvas.addEventListener('keyup',keyUp);
  canvas.addEventListener('blur',release);window.addEventListener('blur',release);
  document.addEventListener('visibilitychange',hidden);
  // Opt-in inspection data for browser regression tests, absent in the normal UI.
  if(new URLSearchParams(location.search).has('inspectDebug')){
   canvas.getInspectionState=()=>({offset:{...offset},velocity:{...velocity},dragging:pointers.size>0,baseNormal:state.mesh?new THREE.Vector3(0,1,0).applyQuaternion(state.mesh.quaternion).toArray():null,camera:camera.position.toArray(),cameraRotation:camera.quaternion.toArray(),viewMode:state.viewMode,base:{theta:home.theta,phi:home.phi},pose:pose.toArray(),poseAngles:{...poseAngles},faceStops,assist:faceAssist(poseAngles.yaw+offset.x,offset.y,faceStops),zoom:camera.zoom,rotation:state.mesh?.quaternion.toArray(),position:state.mesh?.position.toArray(),floor:floor.matrixWorld.toArray(),tween:!!state.tween});
   canvas.projectedUpright=()=>{
    if(!state.mesh)return null;
    state.mesh.updateMatrixWorld(true);camera.updateMatrixWorld(true);
    return [new THREE.Vector3(),new THREE.Vector3(0,10,0)].map(v=>{
     const p=v.applyMatrix4(state.mesh.matrixWorld).project(camera);
     return [(p.x+1)*el.clientWidth/2,(1-p.y)*el.clientHeight/2];
    });
   };
   canvas.projectedBase=()=>{
    if(!state.mesh)return null;
    state.mesh.updateMatrixWorld(true);camera.updateMatrixWorld(true);
    return state.baseEnds.map(v=>{
     const p=v.clone().applyMatrix4(state.mesh.matrixWorld).project(camera);
     return [(p.x+1)*el.clientWidth/2,(1-p.y)*el.clientHeight/2];
    });
   };
   canvas.projectedBounds=()=>{
    if(!state.mesh)return null;
    state.mesh.updateMatrixWorld(true);camera.updateMatrixWorld(true);
    const points=state.mesh.geometry.attributes.position,p=new THREE.Vector3();
    let left=Infinity,right=-Infinity,top=Infinity,bottom=-Infinity;
    for(let i=0;i<points.count;i++){
     p.fromBufferAttribute(points,i).applyMatrix4(state.mesh.matrixWorld).project(camera);
     const x=(p.x+1)*el.clientWidth/2,y=(1-p.y)*el.clientHeight/2;
     left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
    }
    return {left,right,top,bottom,centerX:(left+right)/2,centerY:(top+bottom)/2,width:el.clientWidth,height:el.clientHeight};
   };
   canvas.shadowDigest=()=>{
    const map=key.shadow.map;if(!map)return null;
    const pixels=new Uint8Array(map.width*map.height*4);renderer.readRenderTargetPixels(map,0,0,map.width,map.height,pixels);
    let hash=2166136261;for(let i=0;i<pixels.length;i+=4){hash=Math.imul(hash^pixels[i],16777619);hash=Math.imul(hash^pixels[i+1],16777619);}
    return hash>>>0;
   };
  }
  const observer=new ResizeObserver(resize);observer.observe(el);resize();let frame;
  let lastTime=performance.now();
  function draw(now){
   frame=requestAnimationFrame(draw);const dt=(now-lastTime)/1000;lastTime=now;
   if(state.tween){
    if(pointers.size||keyActive)state.tween.t+=dt*1000;
    else {
    const t=state.tween;let k=reduced.matches?1:Math.min((now-t.t)/650,1);k=1-Math.pow(1-k,3);
    poseAngles.yaw=THREE.MathUtils.lerp(t.start.yaw,t.end.yaw,k);poseAngles.level=THREE.MathUtils.lerp(t.start.level,t.end.level,k);if(k===1)state.tween=null;
    }
   }
   if(!pointers.size&&!keyActive){
    for(const axis of ['x','y']){const next=springStep(offset[axis],velocity[axis],0,dt,reduced.matches);offset[axis]=next.position;velocity[axis]=next.velocity;}
   }
   if(!pointers.size&&now>=zoomUntil&&camera.zoom!==1){
    const next=springStep(camera.zoom,zoomVelocity,1,dt,reduced.matches);camera.zoom=next.position;zoomVelocity=next.velocity;camera.updateProjectionMatrix();
   }
   // Keep the light rig and camera orientation fixed while the object rotates.
   // Measure real vertices in the camera basis to lock the visible silhouette
   // to the viewport center, including the lift needed to stay on the floor.
   if(state.mesh){
    const yaw=poseAngles.yaw+offset.x,assist=faceAssist(yaw,offset.y,faceStops);
    const level=poseAngles.level+(1-poseAngles.level)*assist;
    levelQuaternion.setFromAxisAngle(right,-elevation*level);
    yawQuaternion.setFromAxisAngle(up,yaw);
    pitchQuaternion.setFromAxisAngle(state.baseAxis,offset.y*(1-assist));
    // The continuous pose is independent of pointer-down state. Catching a
    // return or pressing during a face transition preserves the exact frame.
    pose.copy(levelQuaternion).multiply(yawQuaternion);
    state.mesh.quaternion.copy(pose).multiply(pitchQuaternion);
    rotationMatrix.makeRotationFromQuaternion(state.mesh.quaternion);
    const m=rotationMatrix.elements,vertices=state.mesh.geometry.attributes.position.array;
    let lowest=Infinity,minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
    for(let i=0;i<vertices.length;i+=3){
     const vx=vertices[i],vy=vertices[i+1],vz=vertices[i+2];
     const x=m[0]*vx+m[4]*vy+m[8]*vz,y=m[1]*vx+m[5]*vy+m[9]*vz,z=m[2]*vx+m[6]*vy+m[10]*vz;
     const screenX=x*right.x+z*right.z,screenY=x*viewUp.x+y*viewUp.y+z*viewUp.z;
     lowest=Math.min(lowest,y);minX=Math.min(minX,screenX);maxX=Math.max(maxX,screenX);
     minY=Math.min(minY,screenY);maxY=Math.max(maxY,screenY);
    }
    state.mesh.position.y=-lowest;
    target.copy(right).multiplyScalar((minX+maxX)/2).addScaledVector(viewUp,(minY+maxY)/2);
    target.y-=lowest;
   }
   camera.position.setFromSpherical(home).add(target);camera.lookAt(target);renderer.render(scene,camera);
  }
  frame=requestAnimationFrame(draw);sceneRef.current=state;
  return()=>{cancelAnimationFrame(frame);observer.disconnect();
   canvas.removeEventListener('pointerdown',pointerDown);canvas.removeEventListener('pointermove',pointerMove);
   for(const name of ['pointerup','pointercancel','lostpointercapture'])canvas.removeEventListener(name,pointerEnd);
   canvas.removeEventListener('wheel',wheel);canvas.removeEventListener('keydown',keyDown);canvas.removeEventListener('keyup',keyUp);
   canvas.removeEventListener('blur',release);window.removeEventListener('blur',release);document.removeEventListener('visibilitychange',hidden);
   delete canvas.getInspectionState;delete canvas.projectedBounds;delete canvas.projectedBase;delete canvas.projectedUpright;delete canvas.shadowDigest;
   scene.traverse(o=>{o.geometry?.dispose();if(o.material){(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose());}});renderer.dispose();renderer.domElement.remove();sceneRef.current=null;};
 },[]);
 useEffect(()=>{const s=sceneRef.current;if(!s||!buffer)return;try{const g=new STLLoader().parse(buffer);g.rotateX(-Math.PI/2);g.computeBoundingBox();const center=g.boundingBox.getCenter(new THREE.Vector3());g.translate(-center.x,-center.y,-center.z);g.computeBoundingBox();g.computeVertexNormals();if(s.mesh){s.scene.remove(s.mesh);s.mesh.geometry.dispose();s.mesh.material.dispose();}const material=new THREE.MeshStandardMaterial({color,roughness:.84,metalness:.01,flatShading:true});s.mesh=new THREE.Mesh(g,material);s.mesh.castShadow=true;s.mesh.receiveShadow=true;s.scene.add(s.mesh);const size=g.boundingBox.getSize(new THREE.Vector3());s.span=Math.max(Math.hypot(size.x,size.z),size.y*2);s.target.set(0,size.y*.35,0);
   // Infer the long edge from unique vertices on the base's bottom plane.
   // This also handles bases exported diagonally by the original generator.
   const points=g.attributes.position,unique=new Map(),bottom=g.boundingBox.min.y;
   for(let i=0;i<points.count;i++)if(Math.abs(points.getY(i)-bottom)<.001){
    const x=points.getX(i),z=points.getZ(i);unique.set(x+','+z,[x,z]);
   }
   const basePoints=[...unique.values()];
   if(basePoints.length>1){
    const cx=basePoints.reduce((sum,p)=>sum+p[0],0)/basePoints.length,cz=basePoints.reduce((sum,p)=>sum+p[1],0)/basePoints.length;
    let xx=0,zz=0,xz=0;
    for(const [x,z] of basePoints){xx+=(x-cx)**2;zz+=(z-cz)**2;xz+=(x-cx)*(z-cz);}
    const angle=.5*Math.atan2(2*xz,xx-zz);s.baseAxis.set(Math.cos(angle),0,Math.sin(angle));
   }
   const projections=basePoints.map(([x,z])=>x*s.baseAxis.x+z*s.baseAxis.z);
   s.baseEnds=[Math.min(...projections),Math.max(...projections)].map(v=>s.baseAxis.clone().multiplyScalar(v).setY(bottom));
   const light=s.scene.children.find(o=>o.isDirectionalLight&&o.castShadow),extent=s.span*.8;
   light.position.set(-s.span*.7,s.span*1.5,s.span*1.15);
   Object.assign(light.shadow.camera,{left:-extent,right:extent,top:extent,bottom:-extent,near:.1,far:s.span*5});light.shadow.camera.updateProjectionMatrix();
   s.resize();s.view('iso');callback.current.onReady?.();}catch(e){callback.current.onError('模型预览加载失败，请重新生成');}},[buffer]);
 useEffect(()=>{if(sceneRef.current?.mesh)sceneRef.current.mesh.material.color.set(color);},[color]);
 useEffect(()=>{if(sceneRef.current)sceneRef.current.gridHelper.visible=grid;},[grid]);
 return <div className="canvas-host" ref={host} role="img" aria-label="双面立体字三维模型，拖动检视，松手回正，滚轮或双指缩放"/>;
});
export default Viewer;
