// FOR MOBILE
// Share a mobile device gyroscopic x and y data
// Data sends only on MouseDragged, when the screen is touched

// This Sketch uses the 'SimpleSimplePeer' Library
// how to get mysocketId?

let lastY = [];
let lastZ = [];
let myVideo;
let angle;
let anglefirst;
let friends = {};
let myName = "";
let peer;
let newx;
let newy;
let myPosition = {
  x: 0,
  y: 0,
  tX: 0,
  tY: 0,
};

function avg(t) {
  let sum = 0;
  for (let item of t) {
    sum += item;
  }
  return sum / t.length;
}

let constraints = {
  video: {
    width: {
      ideal: 160,
    },
    height: {
      ideal: 120,
    },
    frameRate: {
      ideal: 20,
    },
  },
};

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);

  myVideo = createCapture(constraints, function (stream) {
    peer = new p5LiveMedia(this, "CAPTURE", stream, "friendTown");
    peer.on("stream", gotStream);
    // set up a data channel:
    peer.on("data", gotData);
  });
  myVideo.muted = true;
  myVideo.hide();
}

function draw() {
  camera(0, 0, height / 2 / tan(PI / 6), 0, 0, 0, 0, 1, 0);
  let distanceFromCenter = 800;
  //let anglefirst = angle + Math.PI;
  x = distanceFromCenter * Math.sin(angle);
  z = distanceFromCenter * Math.cos(angle);

  for (const id in friends) {
    friends[id].display();
  }
}

// We got a new stream!
function gotStream(stream, id) {
  friends[id] = new Friend(stream);
}
function gotData(data, id) {
  console.log(data);

  // If it is JSON, parse it
  let parsedData = JSON.parse(data);

  if (friends[id]) {
    friends[id].x = parsedData.x;
    friends[id].y = parsedData.y;
    friends[id].tX = parsedData.tX;
    friends[id].tY = parsedData.tY;
  }
}


function mouseDragged() {
  
  //remapping gyroscope data

  lastY.push(rotationY);
  lastY = lastY.slice(lastY.length - 40);
  avgY = avg(lastY);

  newx = map(rotationX, -180, 90, PI * 2, 0);
  translatey = map(newx, 4.71, 1.57, 800, 0);

  newy = map(avgY, -80, 80, PI * 2, 0);
  translatex = map(newy, -1.57, 1.57, 400, 0);

  newz = map(rotationZ, 280, 10, 0, 3.14);
  translatez = map(newz, -1.57, 1.57, 100, -100);

  friendtX = map(translatex, -0.5, 1, 0, 200);

  myPosition = {
    x: translatex,
    y: translatey,
    tX: friendtX,
    tY: newy,
  };

  // Have to send string
  peer.send(JSON.stringify(myPosition));
}

class Friend {
  constructor(stream, id) {
    this.x = 0;
    this.y = 0;
    this.tX = 0;
    this.tY = 0;
    this.stream = stream;
  }

  display() {
    translate(this.x, this.y);

    push();
    noStroke();
    texture(this.stream);
    rectMode(CENTER);
    //rotateX(this.tX);
    //rotateY(this.y);
    //rotateZ(newz);
    plane(100, 200);
    pop();
  }
}
