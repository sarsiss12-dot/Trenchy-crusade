export const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
export const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
export function hash(x,z,seed=1) {
  let n=Math.imul((x*100|0)^seed,374761393)+Math.imul(z*100|0,668265263);
  n=Math.imul(n^(n>>>13),1274126177);
  return ((n^(n>>>16))>>>0)/4294967295;
}
