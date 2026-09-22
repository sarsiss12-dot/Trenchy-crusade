export function createMesh(kind) {
  const out=[];
  const tri=(a,b,c)=> {
    let u=b.map((v,i)=>v-a[i]),v=c.map((v,i)=>v-a[i]),n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],l=Math.hypot(...n)||1;
    n=n.map(v=>v/l*(kind==='box'?1:-1));
    for(const p of[a,b,c])out.push(...p,...n);
  };
  if(kind==='quad') {
    for(const p of [[-.5,-.5,0],[.5,-.5,0],[.5,.5,0],[-.5,-.5,0],[.5,.5,0],[-.5,.5,0]])out.push(...p,0,0,1);
  }else if(kind==='box') {
    const p=[[-.5,-.5,-.5],[.5,-.5,-.5],[.5,.5,-.5],[-.5,.5,-.5],[-.5,-.5,.5],[.5,-.5,.5],[.5,.5,.5],[-.5,.5,.5]];
    for(const f of[[0,3,2,1],[4,5,6,7],[0,4,7,3],[1,2,6,5],[3,7,6,2],[0,1,5,4]]) {
      tri(p[f[0]],p[f[1]],p[f[2]]);
      tri(p[f[0]],p[f[2]],p[f[3]]);
    }
  } else if(kind==='sphere') {
    const rings=4,seg=8;
    const p=(j,i)=> {
      const a=j/rings*Math.PI,b=i/seg*Math.PI*2;
      return[Math.sin(a)*Math.cos(b)*.5,Math.cos(a)*.5,Math.sin(a)*Math.sin(b)*.5];
    };
    for(let j=0; j<rings; j++)for(let i=0; i<seg; i++) {
      tri(p(j,i),p(j+1,i),p(j+1,i+1));
      tri(p(j,i),p(j+1,i+1),p(j,i+1));
    }
  } else {
    const seg=kind==='ring'?28:8;
    for(let i=0; i<seg; i++) {
      const a=i/seg*Math.PI*2,b=(i+1)/seg*Math.PI*2;
      const p=(angle,r,y)=>[Math.cos(angle)*r,y,Math.sin(angle)*r];
      if(kind==='ring') {
        tri(p(a,.5,0),p(b,.5,0),p(a,.44,0));
        tri(p(b,.5,0),p(b,.44,0),p(a,.44,0));
      }else {
        const rt=kind==='cone'?0:.5;
        tri(p(a,.5,-.5),p(b,.5,-.5),p(a,rt,.5));
        tri(p(b,.5,-.5),p(b,rt,.5),p(a,rt,.5));
        tri([0,.5,0],p(a,rt,.5),p(b,rt,.5));
        tri([0,-.5,0],p(b,.5,-.5),p(a,.5,-.5));
      }
    }
  }
  return new Float32Array(out);
}
