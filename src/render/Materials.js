export const VERTEX_SHADER=`#version 300 es
precision highp float;
layout(location=0) in vec3 p;layout(location=1) in vec3 n;
layout(location=2) in vec3 pos;layout(location=3) in vec3 scl;
layout(location=4) in vec4 color;layout(location=5) in float rot;
layout(location=6) in vec2 tilt;layout(location=7) in vec2 style;
uniform mat4 vp;out vec3 normal;out vec4 col;out vec3 world;
out vec2 uv;out vec2 material;
vec3 rotate(vec3 v){
 float cp=cos(tilt.x),sp=sin(tilt.x),cr=cos(tilt.y),sr=sin(tilt.y);
 v=vec3(v.x,cp*v.y-sp*v.z,sp*v.y+cp*v.z);
 v=vec3(cr*v.x-sr*v.y,sr*v.x+cr*v.y,v.z);
 float c=cos(rot),s=sin(rot);return vec3(v.x*c+v.z*s,v.y,-v.x*s+v.z*c);
}
void main(){
 vec3 q=p*scl;
 if(style.y>0.)world=pos+vec3(.7071,0.,-.7071)*q.x+vec3(-.4082,.8165,-.4082)*q.y;
 else world=rotate(q)+pos;
 normal=normalize(rotate(n/max(abs(scl),vec3(.001))));
 col=color;uv=p.xy+.5;material=style;gl_Position=vp*vec4(world,1.);
}`;
export const FRAGMENT_SHADER=`#version 300 es
precision highp float;
in vec3 normal;in vec4 col;in vec3 world;in vec2 uv;in vec2 material;
out vec4 outColor;
float noise(vec2 p){
 vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);vec2 k=vec2(127.1,311.7);
 float a=fract(sin(dot(i,k))*43758.5453),b=fract(sin(dot(i+vec2(1.,0.),k))*43758.5453);
 float c=fract(sin(dot(i+vec2(0.,1.),k))*43758.5453),d=fract(sin(dot(i+vec2(1.,1.),k))*43758.5453);
 return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);
}
void main(){
 if(material.y>0.){
   float radius=length((uv-.5)*2.);
   float edge=1.-smoothstep(.25,1.,radius);
   float turbulence=.62+.38*noise(uv*7.+world.xz*.08);
   float alpha=col.a*edge*edge*turbulence;
   if(alpha<.004)discard;
   outColor=vec4(col.rgb,alpha);return;
 }
 float dither=fract(sin(dot(floor(gl_FragCoord.xy),vec2(12.9898,78.233)))*43758.5453);
 if(dither>col.a)discard;
 float light=.42+.58*max(0.,dot(normal,normalize(vec3(-.5,1.,.35))));
 vec3 c=col.rgb*light;
 float grain=noise(world.xz*11.+world.y*2.);c*=.93+grain*.12;
 if(world.y<.16&&normal.y>.7){
   float mottling=noise(world.xz*.22)*.7+noise(world.xz*1.8)*.3;
   c*=.67+mottling*.57;
   float field=1.-smoothstep(10.,19.,abs(world.x-56.));
   c=mix(c,c*vec3(.74,.70,.67),field*noise(world.xz*.48)*.62);
   float rut=pow(max(0.,sin(world.z*8.+sin(world.x*.3)*3.)),16.)*.13;
   c*=1.-rut;
 }else if(world.y>.4){
   float stain=noise(world.xz*1.4+world.y*.21);
   c*=.90+.1*stain;
 }
 float haze=smoothstep(25.,135.,world.z)*.16;
 c=mix(c,vec3(.25,.27,.25),haze);
 c=mix(c,col.rgb*1.22,material.x);
 c=pow(c,vec3(.91));
 outColor=vec4(c,1.);
}`;
