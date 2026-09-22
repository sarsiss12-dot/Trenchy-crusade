export class DeterministicRNG {
  constructor(seed=348127){this.state=seed>>>0||1;}
  next(){let n=this.state;n^=n<<13;n^=n>>>17;n^=n<<5;this.state=n>>>0;return this.state/4294967296;}
  snapshot(){return this.state;}
  restore(state){this.state=state>>>0||1;}
}
