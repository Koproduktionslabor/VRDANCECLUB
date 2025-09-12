const TREE_DEPTH = 4;

let g0;
let g1;
let g2;

let trigger_g0, trigger_g1, trigger_g2;
let button_nextStep;
let zoom;


let go_back;

let levels = [];
let depth = 0;

let current_level;
let prev_level = null;


let oscPort;
let oscReady = false;

function setup() {

  print("Program Start");

  createCanvas(800, 1000);
  g0 = new Group(0);
  g1 = new Group(1);
  g2 = new Group(2);

  createLevels();
  createNodes();
  current_level = levels[0];
  current_level.setActive(0);


  trigger_g0 = createButton("G0");
  trigger_g0.style("font-size", "30px");
  trigger_g0.position(width - 100, height);

  trigger_g1 = createButton("G1");
  trigger_g1.style("font-size", "30px");
  trigger_g1.position(width - 100, height + 50);

  trigger_g2 = createButton("G2");
  trigger_g2.style("font-size", "30px");
  trigger_g2.position(width - 100, height + 100);

  trigger_g0.mousePressed(() => g0.triggerCue());
  trigger_g1.mousePressed(() => g1.triggerCue());
  trigger_g2.mousePressed(() => g2.triggerCue());

  
  stop_button = createButton("Stop");
  stop_button.style("font-size", "30px");
  stop_button.position(width - 100, height + 150);
  stop_button.mousePressed(() => stop());

  go_back = createButton("BACK");
  go_back.style("font-size", "20px");
  go_back.position(width - 100, 20);
  go_back.mousePressed(() => previousLevel());

  button_nextStep = createButton("STEP");
  button_nextStep.style("font-size", "20px");
  button_nextStep.position(width - 100, 60);
  button_nextStep.mousePressed(() => nextStep());

  zoom = createSlider(1, 100, 100, 10);
  zoom.position(10, 10);
  zoom.size(80);


  initOsc();

}

function draw() {
  background(220);

  push();
  autoZoom();
  
  g0.displayTransitions();
  g1.displayTransitions();
  g2.displayTransitions();

  for (let i = 0; i <= current_level.number; i++) {
    levels[i].displayNodes();
  }

  pop();

}

//todo
function autoZoom()
{
  let zoomFactor = (zoom.value() / 100);
  //  let yOff = map(zoomFactor, 0.1, 1, 100, 0);
  translate(0, 0);
  scale(zoomFactor);
}

function stop()
{
   oscPort?.send({
    address: "/stop",
    args: [{ type: "s", value: "bang" }]
  });

}

function mouseClicked() {
  for (let level of levels) {
    for (let node of level.nodes) {
      if (node.isHit(mouseX, mouseY)) {
        node.trigger();
        return;
      }
    }
  }
}


  //Hackyyyy Refactor!!!
function initOsc() {
  oscPort = new osc.WebSocketPort({ url: "ws://localhost:8081", metadata: true });
  oscPort.open();

  const onReady = () => {
    if (oscReady) return;        // guard against multiple events
    oscReady = true;
    console.log("OSC connection ready");

    // Send initial cues here OR remove these if you already send inside setActive()
    g0?.triggerCue();
    g1?.triggerCue();
    g2?.triggerCue();
  };

  // Some builds emit "ready", some "open" — listen once to both, guarded.
  oscPort.once("ready", onReady);
  oscPort.once("open",  onReady);

  oscPort.on("message", (m) => console.log("OSC in (browser):", m.address, m.args));
  oscPort.on("error", (e) => console.error("OSC WS error:", e));
}



function sendTestOsc()
{
    oscPort?.send({ address: "/mouse", args: [{type:"f", value:mouseX}, {type:"f", value:mouseY}] });
}