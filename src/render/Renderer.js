import {VERTEX_SHADER,FRAGMENT_SHADER} from './Materials.js';
import {createMesh} from './MeshFactory.js';
import {Camera} from './Camera.js';
import {INSTANCE_STRIDE,Batch} from './Batch.js';
export {INSTANCE_STRIDE,Batch};
export class Renderer {
  constructor(canvas) {
    this.canvas=canvas;
    const gl=this.gl=canvas.getContext('webgl2', {
      antialias:false,alpha:false,powerPreference:'high-performance'
    });
    if(!gl)throw Error('Bu cihazda WebGL 2 kullanılamıyor. Chrome veya güncel Android tarayıcısı gerekli.');
    const sh=(type,src)=> {
      let s=gl.createShader(type);
      gl.shaderSource(s,src);
      gl.compileShader(s);
      if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));
      return s;
    };
    const p=this.program=gl.createProgram();
    gl.attachShader(p,sh(gl.VERTEX_SHADER,VERTEX_SHADER));
    gl.attachShader(p,sh(gl.FRAGMENT_SHADER,FRAGMENT_SHADER));
    gl.linkProgram(p);
    if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));
    this.uniform=gl.getUniformLocation(p,'vp');
    this.meshes= {
    };
    for(const kind of['box','sphere','cone','cylinder','ring','quad']) {
      const data=createMesh(kind);
      const buffer=gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
      gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);
      this.meshes[kind]= {
        buffer,count:data.length/6
      };
    }
    gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    this.camera=new Camera({x:30,z:74,zoom:52});
    this.cam=this.camera.state;
    this.quality=1.4;
    this.drawCalls=0;
    this.instances=0;
    this.static=null;
    this.vp=new Float32Array(16);
    this.resize();
  }
  resize() {
    const d=Math.min(devicePixelRatio||1,this.quality);
    this.width=this.canvas.clientWidth;
    this.height=this.canvas.clientHeight;
    this.canvas.width=Math.round(this.width*d);
    this.canvas.height=Math.round(this.height*d);
    this.gl.viewport(0,0,this.canvas.width,this.canvas.height);
    this.updateCamera();
  }
  ensureCamera(){
    if(!this.camera)this.camera=new Camera(this.cam||{x:30,z:74,zoom:52},this.vp);
    this.camera.state=this.cam;this.camera.vp=this.vp;this.camera.resize(this.width,this.height);return this.camera;
  }
  updateCamera(){const camera=this.ensureCamera();this.right=camera.right;this.up=camera.up;this.forward=camera.forward;}
  project(x,y,z){return this.ensureCamera().project(x,y,z);}
  ground(px,py){return this.ensureCamera().ground(px,py);}
  pan(dx,dy){this.ensureCamera().pan(dx,dy);this.updateCamera();}
  zoom(delta){this.ensureCamera().zoomBy(delta);this.updateCamera();}
  upload(batch,usage) {
    const gl=this.gl,out= {
    };
    for(const[kind,arr]of Object.entries(batch.data)) {
      if(!arr.length)continue;
      const data=new Float32Array(arr),buffer=gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
      gl.bufferData(gl.ARRAY_BUFFER,data,usage);
      out[kind]= {
        buffer,count:arr.length/INSTANCE_STRIDE
      };
    }
    return out;
  }
  setStatic(batch) {
    if(this.static)for(const x of Object.values(this.static))this.gl.deleteBuffer(x.buffer);
    this.static=this.upload(batch,this.gl.STATIC_DRAW);
  }
  drawGroup(group) {
    const gl=this.gl;
    for(const[kind,g]of Object.entries(group)) {
      if(!g.count)continue;
      const m=this.meshes[kind];
      gl.bindBuffer(gl.ARRAY_BUFFER,m.buffer);
      for(let i=0; i<2; i++) {
        gl.enableVertexAttribArray(i);
        gl.vertexAttribPointer(i,3,gl.FLOAT,false,24,i*12);
        gl.vertexAttribDivisor(i,0);
      }
      gl.bindBuffer(gl.ARRAY_BUFFER,g.buffer);
      for(const[i,n,offset]of[[2,3,0],[3,3,12],[4,4,24],[5,1,40],[6,2,44],[7,2,52]]) {
        gl.enableVertexAttribArray(i);
        gl.vertexAttribPointer(i,n,gl.FLOAT,false,INSTANCE_STRIDE*4,offset);
        gl.vertexAttribDivisor(i,1);
      }
      gl.drawArraysInstanced(gl.TRIANGLES,0,m.count,g.count);
      this.drawCalls++;
      this.instances+=g.count;
    }
  }
  updateGroup(batch,group) {
    const gl=this.gl;
    for(const [kind,arr] of Object.entries(batch.data)) {
      let g=group[kind];
      if(!arr.length){if(g)g.count=0;continue;}
      if(!g)g=group[kind]={buffer:gl.createBuffer(),count:0,staging:new Float32Array(0)};
      gl.bindBuffer(gl.ARRAY_BUFFER,g.buffer);
      if(g.staging.length<arr.length){
        g.staging=new Float32Array(2**Math.ceil(Math.log2(arr.length)));
        gl.bufferData(gl.ARRAY_BUFFER,g.staging.byteLength,gl.DYNAMIC_DRAW);
      }
      g.staging.set(arr);g.count=arr.length/INSTANCE_STRIDE;
      gl.bufferSubData(gl.ARRAY_BUFFER,0,g.staging,0,arr.length);
    }
  }
  render(batch,transparent=null) {
    const gl=this.gl;
    gl.clearColor(.092,.107,.103,1);
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.useProgram(this.program);
    gl.uniformMatrix4fv(this.uniform,false,this.vp);
    this.drawCalls=0;this.instances=0;
    gl.disable(gl.BLEND);gl.depthMask(true);
    if(this.static)this.drawGroup(this.static);
    this.dynamic ||= {};this.updateGroup(batch,this.dynamic);this.drawGroup(this.dynamic);
    if(transparent){
      this.transparent ||= {};this.updateGroup(transparent,this.transparent);
      gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);
      this.drawGroup(this.transparent);
      gl.depthMask(true);gl.disable(gl.BLEND);
    }
  }
}
