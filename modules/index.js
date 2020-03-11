const soundPresets = [
  {
    category: "category-1",
    bpm: "top",
    preset: [
      {
        id: "preset-1",
        name: "Exchange",
        layers: [
          { type: "beat", path: "./sounds/top/exchange/exchange-beats.ogg" },
          { type: "synth", path: "./sounds/top/exchange/exchange-synth-2.ogg" },
          {
            type: "sample",
            path: "./sounds/top/exchange/exchange-sample-2.ogg",
          },
        ],
      },
      {
        id: "preset-2",
        name: "Nice For What",
        layers: [
          {
            type: "hi hat",
            path: "./sounds/top/niceforwhat/niceforwhat-hihat-2.ogg",
          },
          {
            type: "beat",
            path: "./sounds/top/niceforwhat/niceforwhat-beats-2.ogg",
          },
          {
            type: "sample",
            path: "./sounds/top/niceforwhat/niceforwhat-sample-2.ogg",
          },
        ],
      },
      {
        id: "preset-3",
        name: "No Limit",
        layers: [
          { type: "synth", path: "./sounds/top/nolimit/nolimit-synth.ogg" },
          { type: "chimes", path: "./sounds/top/nolimit/nolimit-chimes.ogg" },
          { type: "hi hat", path: "./sounds/top/nolimit/nolimit-hihat.ogg" },
          { type: "beats", path: "./sounds/top/nolimit/nolimit-beats.ogg" },
          { type: "sample", path: "./sounds/top/nolimit/nolimit-sample.ogg" },
        ],
      },
      {
        id: "preset-4",
        name: "Panda",
        layers: [
          { type: "synth", path: "./sounds/top/panda/panda-synth.ogg" },
          { type: "hi hat", path: "./sounds/top/panda/panda-hihat.ogg" },
          { type: "beats", path: "./sounds/top/panda/panda-beats.ogg" },
          { type: "melody", path: "./sounds/top/panda/panda-melody.ogg" },
        ],
      },
      {
        id: "preset-5",
        name: "One Dance",
        layers: [
          { type: "synth", path: "./sounds/top/onedance/onedance-synth-2.ogg" },
          {
            type: "melody",
            path: "./sounds/top/onedance/onedance-melody-2.ogg",
          },
          {
            type: "beats",
            path: "./sounds/top/onedance/onedance-beats-1-2.ogg",
          },
          {
            type: "second beats",
            path: "./sounds/top/onedance/onedance-beats-2-2.ogg",
          },
          {
            type: "sample",
            path: "./sounds/top/onedance/onedance-sample-2.ogg",
          },
        ],
      },
      {
        id: "preset-6",
        name: "Work",
        layers: [
          { type: "synth", path: "./sounds/top/work/work-synth-2.ogg" },
          { type: "effects", path: "./sounds/top/work/work-effects-2.ogg" },
          { type: "beats", path: "./sounds/top/work/work-beats-2.ogg" },
          { type: "melody", path: "./sounds/top/work/work-melody-3.ogg" },
          { type: "melody-2", path: "./sounds/top/work/work-melody-2-2.ogg" },
          { type: "bridge", path: "./sounds/top/work/work-bridge-2.ogg" },
        ],
      },
    ],
  },
  {
    category: "category-4",
    bpm: "97",
    preset: [
      {
        id: "preset-1",
        name: "Sound 1",
        layers: [
          { type: "beat", path: "./sounds/97/beats/beats-1.ogg" },
          { type: "bass line", path: "./sounds/97/bassline/bassline-1.ogg" },
          { type: "keys", path: "./sounds/97/keysline/keysline-1.ogg" },
        ],
      },
      {
        id: "preset-2",
        name: "Sound 2",
        layers: [
          { type: "beat", path: "./sounds/97/beats/beats-2.ogg" },
          { type: "bass line", path: "./sounds/97/bassline/bassline-2.ogg" },
          { type: "keys", path: "./sounds/97/keysline/keysline-2.ogg" },
        ],
      },
    ],
  },
];
const click = new Audio("./sounds/click.mp3");
click.volume = 0.5;
const cover = document.querySelector("#cover");
const video = document.querySelector("#myVideo");
const audioWrapper = document.querySelector("#audioWrapper");

const newColorGuide = document.querySelector("#newColorGuide");
//for clickNewColor()
const vW = video.clientWidth;
const vH = video.clientHeight;
const pixelRatio = Number(vW / vH);
const canvasW = video.clientWidth - 100;
const canvasH = Number(canvasW / pixelRatio);
let registerComplete = false; //begins tracker when true

const presetWrapper = document.querySelector("#presetsWrapper");

const btnNewColor = document.querySelector("#btnNewColor");
const btnReset = document.querySelector("#btnReset");
const allButtons = document.querySelectorAll(".control-button");

const colorWrapper = document.querySelector("#currentColorWrapper");

const canvasScreenshot = document.querySelector("#canvasScreenshot");
const THRESHOLD = 10;

let soundList = document.querySelectorAll("audio");
let sounds = [...soundList];
let soundPlaying = [];

let colorList = document.querySelectorAll(".currentColors");
let colorDisplay = [...colorList];
let colorStore = []; //colorProps.name
let colorProps = [];

sounds.forEach(sound => {
  sound.volume = 0;
  soundPlaying.push(false);
  colorProps.push({ name: "", set: false, detected: false });
});
console.log("colorProps initiated");
console.log(colorProps);
function handleOnCanPlay() {
  console.log(this + "is ready to play");
}

if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: false })
    .then(stream => {
      try {
        video.srcObject = stream;
        video.play();
      } catch (err) {
        video.src = URL.createObjectURL(stream);
      }
    })
    .catch(err => {
      console.log(err);
    });
}

let trackerTask;
let colors = new tracking.ColorTracker();

let startMusic = false;
let count = 0; //delays for color detection

//Establish structure for trackElement nodes
let divTrackWrapper = document.createElement("div");
divTrackWrapper.setAttribute("class", "btnPresetWrapper");
let btnPresetElement = document.createElement("button");
divTrackWrapper.appendChild(btnPresetElement);

let currentCategory, currentPreset;
let counter = 0;
function startTracking() {
  console.log("startTracking fired");

  colors.on("track", event => {
    //same as tracker.on
    if (event.data.length === 0) {
      // No colors were detected in this frame.
      if (sounds[0].volume > 0 || sounds[1].volume > 0 || sounds[2].volume > 0)
        muteAll();
    } else {
      if (!startMusic) replay(sounds);
      for (let i = 0; i < colorProps.length; i++) {
        let match = event.data.find(rect => {
          return rect.color === colorProps[i].name;
        });

        if (match === undefined) {
          colorProps[i].detected = false;
        } else {
          colorProps[i].detected = true;
        }
      }

      for (let x = 0; x < colorProps.length; x++) {
        sounds[x].volume = colorProps[x].detected ? 1 : 0;
      }
    }
  });

  trackerTask = tracking.track("#myVideo", colors);
  trackerTask.run();
} //end of startTracking()

function clickNewColor() {
  canvasScreenshot.width = canvasW;
  canvasScreenshot.height = canvasH;

  let ctx = canvasScreenshot.getContext("2d");
  ctx.webkitImageSmoothingEnabled = true;
  ctx.msImageSmoothingEnabled = true;
  ctx.imageSmoothingEnabled = true;

  // Draws current image from the video element into the canvas
  const sX = newColorGuide.offsetLeft - video.offsetLeft;
  const sY = newColorGuide.offsetTop - video.offsetTop;
  const sWidth = newColorGuide.offsetWidth;
  const sHeight = newColorGuide.offsetHeight;

  ctx.drawImage(video, sX, sY, sWidth, sHeight, 0, 0, sWidth, sHeight);

  const imageData = ctx.getImageData(0, 0, sWidth, sHeight);

  //Grabs all the data in scanned image
  const data = imageData.data;
  let rMin = 255,
    rMax = 0,
    gMin = 255,
    gMax = 0,
    bMin = 255,
    bMax = 0;

  //sorts through imageData.data array to find rgb min and max values
  for (let i = 0; i < data.length; i += 4) {
    data[i]; //r
    data[i + 1]; //g
    data[i + 2]; //b

    if (data[i] < rMin) {
      rMin = data[i];
    }
    if (data[i] > rMax) {
      rMax = data[i];
    }
    if (data[i + 1] < gMin) {
      gMin = data[i + 1];
    }
    if (data[i + 1] > gMax) {
      gMax = data[i + 1];
    }
    if (data[i + 2] < bMin) {
      bMin = data[i + 2];
    }
    if (data[i + 2] > bMax) {
      bMax = data[i + 2];
    }
  }

  registerColor(rMin, rMax, gMin, gMax, bMin, bMax);
}

function registerColor(R_MIN, R_MAX, G_MIN, G_MAX, B_MIN, B_MAX) {
  for (let i = 0; i < colorProps.length; i++) {
    if (!colorProps[i].set) {
      colors.constructor.registerColor(`COLOR${i}`, (r, g, b) => {
        if (
          r > R_MIN - THRESHOLD &&
          r < R_MAX + THRESHOLD &&
          g > G_MIN - THRESHOLD &&
          g < G_MAX + THRESHOLD &&
          b > B_MIN - THRESHOLD &&
          b < B_MAX + THRESHOLD
        ) {
          return true;
        }
        return false;
      });
      displayColor(R_MIN, R_MAX, G_MIN, G_MAX, B_MIN, B_MAX, i);

      colorProps[i].set = true;
      colorProps[i].name = `COLOR${i}`;
      console.log(`${i} and ${colorDisplay.length}`);
      console.log(colorProps);

      if (i == colorDisplay.length - 1) {
        console.log("end of registration");
        for (let x = 0; x < colorProps.length; x++) {
          colorStore.push(colorProps[x].name);
        }
        colors.setColors(colorStore);
        btnNewColor.style.visibility = "hidden";
        registerComplete = true;
        //DISPLAY COLOR NUMBER
      }
      break;
    }
  }

  if (registerComplete) {
    startTracking();
  }
}

function displayColor(R_MIN, R_MAX, G_MIN, G_MAX, B_MIN, B_MAX, i) {
  if (!colorProps[i].set) {
    colorDisplay[
      i
    ].style.background = `linear-gradient(to bottom right, rgba(${R_MIN}, ${G_MIN}, ${B_MIN}, 1), rgba(${R_MAX}, ${G_MAX}, ${B_MAX}, 1))`;
    // break;
  }
}

function resetColorDisplay() {
  colorDisplay.forEach(
    elem =>
      (elem.style.background = `linear-gradient(to bottom right, rgba(255,255,255,0), rgba(255,255,255,0))`),
  );
}

function muteAll() {
  console.log("muteAll");
  for (let i = 0; i < sounds.length; i++) {
    sounds[i].volume = 0;
  }
  console.log(sounds);
}

function reset() {
  //re-initialize colorTracker instance
  if (trackerTask) trackerTask.stop();
  colors = new tracking.ColorTracker();
  colorStore = [];
  registerComplete = false;

  for (let i = 0; i < colorProps.length; i++) {
    colorProps[i] = { name: "", set: false, detected: false };
  }
  muteAll();
  btnNewColor.style.visibility = "visible";
  resetColorDisplay();
  sounds.forEach(sound => {
    sound.pause();
    sound.currentTime = 0;
    sound.setAttribute("loop", "true");
    soundPlaying[`${sound.getAttribute("data-number")}`] = false;
  });

  startMusic = false;
}

function replay(audio) {
  if (!startMusic) {
    console.log("music started playing");

    for (let i = 0; i < audio.length; i++) {
      audio[i].currentTime = 0;
      audio[i].setAttribute("loop", "true");
      soundPlaying[`${audio[i].getAttribute("data-number")}`] = true;
      audio[i].play();
    }
  }
  startMusic = true;
}

function loadPreset(track) {
  let preset = track.id;
  let numLayers;

  for (let i = 0; i < soundPresets.length; i++) {
    if (soundPresets[i].category == currentCategory) {
      for (let x = 0; x < soundPresets[i].preset.length; x++) {
        if (soundPresets[i].preset[x].id == preset) {
          numLayers = soundPresets[i].preset[x].layers.length;

          soundPresets[i].preset[x].layers.forEach((layer, index) => {
            if (sounds[index]) {
              sounds[index].src = layer.path;
            } else if (!sounds[index]) {
              createAudioElement(layer.path);
              createColorElement();
            }
            displayColorLabel(layer, index);
          });
          loadSounds();
          break;
        }
      }
    }
  }

  //remove surplus of audio tracks and color div elementss
  if (numLayers < sounds.length) {
    trimDOM(numLayers);
  }
}

function displayColorLabel(layer, index) {
  colorDisplay[index].innerHTML = layer.type.toUpperCase();
}

function loadSounds() {
  for (let i = 0; i < sounds.length; i++) {
    sounds[i].load();
    console.log(`loading ${sounds[i]}`);
  }
}

function trimDOM(max) {
  // check existing in sounds
  // check existing in colorDisplay
  const currentColorList = colorWrapper.querySelectorAll(".currentColors");
  const currentAudioList = audioWrapper.querySelectorAll("audio");
  for (let i = 0; i < currentAudioList.length; i++) {
    if (i >= max) {
      colorWrapper.removeChild(currentColorList[i]);
      audioWrapper.removeChild(currentAudioList[i]);
    }
  }

  sounds.splice(max, sounds.length);
  colorDisplay.splice(max, colorDisplay.length);
  soundPlaying.splice(max, soundPlaying.length);
  colorProps.splice(max, colorProps.length);
}

function createAudioElement(path) {
  // append new to audioWrapper
  // check existing in sounds
  const audioDOM = document.createElement("audio");
  audioDOM.setAttribute("src", path);
  audioDOM.setAttribute("id", `sound${sounds.length + 1}`);
  audioDOM.setAttribute("data-number", `${sounds.length}`);

  audioWrapper.appendChild(audioDOM);
  sounds.push(audioDOM);
  soundPlaying.push(false);
  console.log(sounds);
}

function createColorElement() {
  // append new to colorWrapper
  // check existing in colorDisplay
  const colorDOM = document.createElement("div");
  colorDOM.setAttribute("id", `currentColor${colorDisplay.length + 1}`);
  colorDOM.setAttribute("class", "currentColors");

  colorDisplay.push(colorDOM);
  colorWrapper.appendChild(colorDOM);
  colorProps.push({ name: "", set: false, detected: false });
}

function mute(audio) {
  audio.volume = 0;
}

let wrapper = document.querySelector("#presetTrackWrapper");
function clearTrackPresets() {
  while (wrapper.firstChild) {
    wrapper.removeChild(wrapper.firstChild);
  }
}

function toggleGuide() {
  newColorGuide.style.left = `${video.offsetLeft +
    (video.clientWidth / 2 - newColorGuide.clientWidth / 2)}px`;

  newColorGuide.style.top = `${video.offsetTop +
    (video.clientHeight / 2 - newColorGuide.clientHeight / 2)}px`;

  newColorGuide.style.opacity = newColorGuide.style.opacity == 0 ? "1" : "0";
}

function togglePresets() {
  if (presetsWrapper.style.opacity == 0) {
    presetsWrapper.style.opacity = "1";
    presetCategoryWrapper.style.display = "block";
  } else if (presetsWrapper.style.opacity == 1) {
    presetsWrapper.style.opacity = "0";
    presetCategoryWrapper.style.display = "none";
    clearTrackPresets();
  }
  presetTrackWrapper.style.display = "none";
}

function toggleTrackPresets() {
  presetTrackWrapper.style.display =
    presetTrackWrapper.style.display == "none" ? "block" : "none";

  //Fill #presetTrackWrapper with the current track presets in specified category
  soundPresets.forEach(function(sound) {
    if (sound.category == currentCategory) {
      for (let i = 0; i < sound.preset.length; i++) {
        let trackElement = divTrackWrapper.cloneNode(true);
        trackElement.firstChild.setAttribute("id", `${sound.preset[i].id}`);
        trackElement.firstChild.innerHTML = sound.preset[i].name;
        wrapper.appendChild(trackElement);
      }
    }
  });
}

function toggleCategory() {
  presetCategoryWrapper.style.display =
    presetCategoryWrapper.style.display == "block" ? "none" : "block";
  toggleTrackPresets();
}

function resetButtonBackgrounds() {
  allButtons.forEach(button => {
    button.style.background = "rgba(241,241,241, 0.6)";
    button.style.color = "rgba(100, 100, 100, 0.8)";
  });
}

function addActive(element) {
  element.style.background = "rgba(100,100,100, 0.1)";
}

function onClick(event) {
  console.log(event);
  let target = event.target;

  if (target.id !== "") {
    click.currentTime = 0;
    click.play();
  }
  if (target.id == "btnReset") {
    reset();
  }
  if (target.id == "btnNewColor") {
    clickNewColor();
  }
  if (target.id == "btnGuides") {
    toggleGuide();
  }
  if (target.id == "btnPresets") {
    togglePresets();
  }
  if (target.id.startsWith("category")) {
    currentCategory = target.id;
    toggleCategory();
  }
  if (target.id.startsWith("preset-")) {
    currentPreset = target.id;
    if (startMusic) reset();
    loadPreset(target);
    togglePresets();
  }
  if (target.id === "presetsWrapper") {
    togglePresets();
  }
  if (target.id === "start") {
    cover.style.opacity = 0;
    setTimeout(() => {
      cover.style.display = "none";
    }, 500);
  }
}

function handleMouseDown(event) {
  if (event.target.id.indexOf("btn") >= 0) {
    addActive(event.target);
  }
}

function handleMouseUp(event) {
  resetButtonBackgrounds();
}

window.addEventListener("click", onClick);
window.addEventListener("mousedown", handleMouseDown);
window.addEventListener("mouseup", handleMouseUp);
