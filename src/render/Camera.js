import {clamp} from '../core/math.js';
import {BALANCE} from '../core/Config.js';
export class Camera {
  constructor(state={x:30,z:74,zoom:52},vp=new Float32Array(16)){this.state=state;this.vp=vp;this.width=1;this.height=1;}
  resize(width,height){this.width=width||1;this.height=height||1;this.update();}
  update(){const a=Math.SQRT1_2,b=.577350269,c=.40824829;this.right=[a,0,-a];this.up=[-c,.81649658,-c];this.forward=[b,b,b];const sy=2/this.state.zoom,sx=sy/(this.width/this.height),sz=-2/300,m=this.vp;m.set([a*sx,-c*sy,b*sz,0,0,.81649658*sy,b*sz,0,-a*sx,-c*sy,b*sz,0,(-a*this.state.x+a*this.state.z)*sx,(c*this.state.x+c*this.state.z)*sy,-(b*this.state.x+b*this.state.z)*sz,1]);}
  project(x,y,z){const m=this.vp;return{x:((m[0]*x+m[4]*y+m[8]*z+m[12])*.5+.5)*this.width,y:(.5-(m[1]*x+m[5]*y+m[9]*z+m[13])*.5)*this.height};}
  ground(px,py){const nx=(px/this.width-.5)*this.state.zoom*(this.width/this.height),ny=(.5-py/this.height)*this.state.zoom;return{x:this.state.x+nx*.70710678-ny*1.22474487,z:this.state.z-nx*.70710678-ny*1.22474487};}
  pan(dx,dy){const a=this.ground(0,0),b=this.ground(dx,dy),min=BALANCE.camera.edgeMargin,max=BALANCE.world.size-min;this.state.x=clamp(this.state.x+a.x-b.x,min,max);this.state.z=clamp(this.state.z+a.z-b.z,min,max);this.update();}
  zoomBy(delta){this.state.zoom=clamp(this.state.zoom*delta,BALANCE.camera.minZoom,BALANCE.camera.maxZoom);this.update();}
}
