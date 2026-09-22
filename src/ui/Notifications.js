export class Notifications {
  constructor(element,duration=3800){this.element=element;this.duration=duration;this.until=0;}
  show(message,now=performance.now()){this.element.textContent=message;this.element.style.opacity='1';this.until=now+this.duration;return this.until;}
  update(now=performance.now()){if(now>this.until)this.element.style.opacity='0';}
}
