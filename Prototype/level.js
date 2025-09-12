let buttons = [];
let level0;
let level1;
let level2;
let level3;
let level4;

let n0_012;
let n1_012;
let n2_0;
let n2_12;
let n4a_02;

class Level {
  constructor(number, branches) {
    this.number = number;
    this.prevLevel = null;
    this.nextLevel = null;
    this.nodes = [];
    this.branches = branches;
    this.current_branch_id = -1;

    this.steps = 1;
    this.currentStep = 1;

  }

  addSteps(n)
  {
    this.steps = this.steps+n;
    return this;
  }

  setActive(branch_id) {
    this.current_branch_id = branch_id;
    this.currentStep = 1;
    //this.nodes.forEach(n => n.isActive = false);
    const inactiveNodes = this.nodes.filter(
      (node) => node.branch_id != branch_id
    );
    inactiveNodes.forEach((node) => (node.isActive = false));
    
    
    const activeNodes = this.nodes.filter(
      (node) => node.branch_id === branch_id
    );
    activeNodes.forEach((node) => (node.isActive = true));

    //TODO: REFACTOR!!
    //update current Node variable on groups
    g0.prevNodes.push(g0.currentNode);
    g1.prevNodes.push(g1.currentNode);
    g2.prevNodes.push(g2.currentNode);
    g0.currentNode = activeNodes.find((n) => n.groups.includes(g0));
    g1.currentNode = activeNodes.find((n) => n.groups.includes(g1));
    g2.currentNode = activeNodes.find((n) => n.groups.includes(g2));

    g0.triggerCue();
    g1.triggerCue();
    g2.triggerCue();



    this.createButtons();
  }
  



  createButtons() {
    for (let button of buttons) {
      button.remove();
    }
    buttons.length = 0;

    for (let branch_id = 0; branch_id < this.branches; branch_id++) {
      let xspacing = 100;
      let b = createButton(branch_id.toString());
      b.style("font-size", "30px");
      b.position(xspacing * branch_id, height);
      b.mousePressed(() => nextLevel(branch_id));
      buttons.push(b);
    }
  }

  addNodes(...nodes) {
    for (let n of nodes) {
      this.nodes.push(n);
      n.level = this;
      for (let i = 0; i < this.nodes.length; i++) this.nodes[i].setPosition(i);
    }
  }

  displayNodes() {
    for (let node of this.nodes) {
      node.display();
    }
  }
}

class Node {
  static musicCueList = [];

  constructor(branch_id, ...groups) {
    this.branch_id = branch_id;
    this.x;
    this.y;
    this.sz = 70;
    this.groups = [];
    this.groups.push(...groups);
    this.level = null;
    this.isActive = false;

  }




  isHit(mx, my) {
    let d = dist(mx, my, this.x, this.y);
    return d < this.sz / 2;
  }

  getName() {
    let groupsString = "";
    this.groups.forEach((g) => (groupsString += g.id.toString() + ", "));
    return `Node---LEVEL ${this.level.number}---BRANCH: ${this.branch_id}---GROUPS:  ${groupsString}`;
  }

  trigger() {
    let name = this.getName();
    print(name);
  }

  setPosition(i) {
    let xPos = 0;
    let xSpacing = width / (this.level.nodes.length + 1);
    const yOffset = 200;
    xPos = xPos + xSpacing * (i + 1);
    this.x = xPos;
    this.y = height / TREE_DEPTH + yOffset * this.level.number;
  }

  display() {
    push();
    let start = 0;
    let step = TWO_PI / this.groups.length; // slice angle
    let a = this.isActive ? 255 : 50;
    let s = this.isActive ? 2 : 0;

    for (let i = 0; i < this.groups.length; i++) {
      const base = this.groups[i].groupColor;
      let c = color(red(base), green(base), blue(base));
      c.setAlpha(a);
      strokeWeight(s);
      fill(c);
      arc(this.x, this.y, this.sz, this.sz, start, start + step, PIE);
      start += step;
    }
    if(this.isActive)
    {
      fill(0);
      textSize(20);
      text(this.level.currentStep+"/"+this.level.steps,this.x + this.sz/2, this.y - this.sz/2);
    }
    pop();
  }
}

function nextStep()
{
  if(current_level.currentStep < current_level.steps)
  {
    current_level.currentStep++;
    g0.triggerCue(current_level.currentStep);
    g1.triggerCue(current_level.currentStep);
    g2.triggerCue(current_level.currentStep);
  }   
}

function nextLevel(branch_id) {
  current_level = current_level.nextLevel;
  current_level.setActive(branch_id);
  print("Current Level: " + current_level.number);
}

function previousLevel() {
  if (!current_level || !current_level.prevLevel) return;

  oscPort?.send({
    address: "/back",
    args: [{ type: "s", value: "bang" }]
  });

  //current_level.nodes.forEach(n => n.isActive = false);
  current_level = current_level.prevLevel;
  current_level.setActive(current_level.current_branch_id);

  g0.prevNodes.pop();
  g1.prevNodes.pop();
  g2.prevNodes.pop(); //HACKYYYYYY REFACTOR!!!!!!!!!

  g0.currentNode = g0.prevNodes.pop();
  g1.currentNode = g1.prevNodes.pop();
  g2.currentNode = g2.prevNodes.pop();
  print("Current Level: " + current_level.number);
}

function createLevels() {
  level0 = new Level(0, 1);
  level1 = new Level(1, 1).addSteps(2);
  level2 = new Level(2, 2);
  level3 = new Level(3, 1);
  level4 = new Level(4, 0);
  level0.prevLevel = null;
  level1.prevLevel = level0;
  level2.prevLevel = level1;
  level3.prevLevel = level2;
  level4.prevLevel = level3;

  level0.nextLevel = level1;
  level1.nextLevel = level2;
  level2.nextLevel = level3;
  level3.nextLevel = level4;
  level4.nextLevel = null;

  levels.push(level0, level1, level2, level3, level4);
}

function createNodes() {
  n0_012 = new Node(0, g0, g1, g2);
  n1_012 = new Node(0, g0, g1, g2);
  n2_0 = new Node(0, g0);
  n2_12 = new Node(0, g1, g2);
  n3a_0 = new Node(0, g0);
  n3b_0 = new Node(1, g0);
  n3a_12 = new Node(0, g1, g2);
  n3b_12 = new Node(1, g1, g2);

  n4a_02 = new Node(0, g0, g1, g2,);

  level0.addNodes(n0_012);
  level1.addNodes(n1_012);
  level2.addNodes(n2_0, n2_12);
  level3.addNodes(n3a_0, n3b_0, n3a_12, n3b_12);

  level4.addNodes(n4a_02);

  //Set start Node
  g0.currentNode = n0_012;
  g1.currentNode = n0_012;
  g2.currentNode = n0_012;
}
