// Continuous resistance, inspired by the rubberband interaction in pmndrs/use-gesture.
// No upstream source is copied. Distances are normalized to the preview's own size.
export const LIMITS = {x: 3.2, y: 1.15};
// Keep the centre responsive; resistance grows mainly near the rotation limit.
export function resist(value, limit) { return limit * Math.tanh(value / limit); }
export function unresist(value, limit) {
  return limit * Math.atanh(Math.max(-.999, Math.min(.999, value / limit)));
}
// Exact solution of a damped spring; consistent at 30, 60 and 120 Hz.
export function springStep(position, velocity, target, seconds, reducedMotion = false) {
  if (reducedMotion) return {position: target, velocity: 0};
  const dt = Math.min(Math.max(seconds, 0), .064);
  const decay = 9.5, frequency = Math.sqrt(190 - decay * decay);
  const x = position - target, c = Math.cos(frequency * dt), s = Math.sin(frequency * dt);
  const e = Math.exp(-decay * dt), b = (velocity + decay * x) / frequency;
  let next = target + e * (x * c + b * s);
  let speed = e * (velocity * c - (decay * velocity + 190 * x) / frequency * s);
  if (Math.abs(next - target) < .00004 && Math.abs(speed) < .0004) { next = target; speed = 0; }
  return {position: next, velocity: speed};
}

// Smooth detents add travel only around the two readable faces.
// Invert a strictly increasing input-distance function, so dragging never
// reverses or jumps at a boundary. No velocity-dependent snap is used.
export const DRAG_GAIN={x:4.8,y:2.3};
export function faceInput(angle,originYaw,stops){
 let input=unresist(angle,LIMITS.x);
 for(const stop of stops)input+=.16*(Math.tanh((originYaw+angle-stop)/.1)-Math.tanh((originYaw-stop)/.1));
 return input;
}
export function faceDrag(input,originYaw,stops){
 let lo=-LIMITS.x*.9989,hi=LIMITS.x*.9989;
 for(let i=0;i<42;i++){const mid=(lo+hi)/2;if(faceInput(mid,originYaw,stops)<input)lo=mid;else hi=mid;}
 return (lo+hi)/2;
}
const smooth=x=>{const t=Math.min(1,Math.max(0,x));return t*t*(3-2*t)};
export function faceAssist(yaw,vertical,stops){
 const distance=Math.min(...stops.map(stop=>Math.abs(yaw-stop)));
 // Gently remove the initial elevation near a reading angle; a deliberate
 // vertical inspection remains free to tilt above or underneath the object.
 return smooth(1-distance/.52)*(1-smooth((Math.abs(vertical)-.22)/.55));
}
