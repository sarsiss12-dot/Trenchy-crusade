// All sound is synthesized. A single noise buffer is shared by capped voices.
export class AudioEngine {
  constructor(){this.enabled=false;this.ctx=null;this.last=0;this.lastBlast=-1;this.voices=0;}
  toggle(){
    this.enabled=!this.enabled;
    if(this.enabled){
      if(!this.ctx){
        this.ctx=new (window.AudioContext||window.webkitAudioContext)();
        const c=this.ctx;this.noise=c.createBuffer(1,c.sampleRate,c.sampleRate);
        const data=this.noise.getChannelData(0);
        for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*.6;
      }
      this.ctx.resume();
    }
    return this.enabled;
  }
  noiseVoice(duration,volume,frequency){
    if(!this.enabled||!this.ctx||this.voices>=6)return;
    const c=this.ctx,source=c.createBufferSource(),filter=c.createBiquadFilter(),gain=c.createGain();
    source.buffer=this.noise;filter.type='lowpass';filter.frequency.value=frequency;
    gain.gain.setValueAtTime(volume,c.currentTime);gain.gain.exponentialRampToValueAtTime(.001,c.currentTime+duration);
    source.connect(filter).connect(gain).connect(c.destination);this.voices++;
    source.onended=()=>{this.voices--;source.disconnect();filter.disconnect();gain.disconnect();};
    source.start();source.stop(c.currentTime+duration);
  }
  shot(f){if(!this.enabled||!this.ctx||this.ctx.currentTime-this.last<.09)return;this.last=this.ctx.currentTime;this.noiseVoice(f?.17:.075,f?.06:.09,f?650:2300);}
  explosion(size){if(!this.enabled||!this.ctx||this.ctx.currentTime-this.lastBlast<.3)return;this.lastBlast=this.ctx.currentTime;this.noiseVoice(size>1?.85:.4,size>1?.19:.11,290);}
}
