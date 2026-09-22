export const INSTANCE_STRIDE=15;
export class Batch {
  constructor() {
    this.data= {
      box:[],sphere:[],cone:[],cylinder:[],ring:[],quad:[]
    };
  }
  reset(){for(const a of Object.values(this.data))a.length=0;return this;}
  add(kind,x,y,z,sx,sy,sz,color,rot=0,alpha=1,pitch=0,roll=0,glow=0,soft=0) {
    this.data[kind].push(x,y,z,sx,sy,sz,color[0],color[1],color[2],alpha,rot,pitch,roll,glow,soft);
  }
}
