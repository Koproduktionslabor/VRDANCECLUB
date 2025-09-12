
class Group {
  constructor(id) {
    this.id = id;
    this.groupColor = this.setColor();
    this.prevNodes = [];
    this.currentNode = null;
  }

  setColor() {
    let gc;
    if (this.id === 0) gc = color(255, 0, 0);
    else if (this.id === 1) gc = color(0, 255, 0);
    else if (this.id === 2) gc = color(0, 0, 255);
    return gc;
  }

  triggerCue(optional_step_id) {
    const address = "/group";
   const g = this.id;
   const l = this.currentNode.level.number;
   const b = this.currentNode.branch_id;

   const args = [
    { type: "i", value: g },
    { type: "i", value: l },
    { type: "i", value: b },
  ];

  if (optional_step_id != null) args.push({ type: "i", value: optional_step_id });
  else if(this.currentNode.level.steps > 1) args.push({ type: "i", value: 1})
    
  oscPort?.send({ address, args});
  }

  displayTransitions() {
    push();
    if (this.prevNodes.length == 0 || !this.currentNode) return;

    stroke(this.groupColor);
    let x = this.prevNodes[this.prevNodes.length - 1].x - 20 + this.id * 20;
    line(
      x,
      this.prevNodes[this.prevNodes.length - 1].y,
      this.currentNode.x,
      this.currentNode.y
    );

    for (let i = this.prevNodes.length - 1; i > 0; i--) {
      let current = this.prevNodes[i];
      let prev = this.prevNodes[i - 1];
      let x = prev.x - 20 + this.id * 20;
      line(x, prev.y, current.x, current.y);
    }
  pop();
  }
}
