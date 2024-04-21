import { RunDepth } from "./depth";
import { RunGroundRender } from "./ground-render";
import { RunIsometricCameraPan } from "./isometric-camera-pan";
import { RunSimplePostprocessing } from "./postprocessing";
import { RunSimpleMultiPipeline } from "./simple-multi-pipeline";
import { RunTriangle } from "./triangle";

let cleanup: () => void;

// set default demo
if (!document.location.hash) {
  document.location.hash = "select";
}
setDemo(document.location.hash);

// change hash on Select element change
const selectDemoElement = document.getElementById("select_demo");

if (!selectDemoElement) {
  throw new Error("selectDemoElement not found");
} else {
  // @ts-ignore
  selectDemoElement.value = document.location.hash.replace("#", "");
}

selectDemoElement.addEventListener("change", async (event) => {
  const val = (event.target as HTMLSelectElement)?.value;
  document.location.hash = val;
});

// listen for hash change
window.addEventListener("hashchange", () => {
  setDemo(document.location.hash);
});

async function setDemo(demo: string) {
  // cleanup
  if (cleanup) {
    cleanup();
  }

  switch (demo) {
    case "#select": {
      console.warn("select a demo");
      break;
    }
    case "#triangle": {
      cleanup = await RunTriangle();
      break;
    }
    case "#ground": {
      cleanup = await RunGroundRender();
      break;
    }
    case "#simple-multi-pipeline": {
      cleanup = await RunSimpleMultiPipeline();
      break;
    }
    case "#simple-postprocess": {
      cleanup = await RunSimplePostprocessing();
      break;
    }
    case "#depth": {
      cleanup = await RunDepth();
      break;
    }
    case "#isometric_pan": {
      cleanup = await RunIsometricCameraPan();
      break;
    }
    case "#outlines": {
      // TODO
      break;
    }
    default: {
      console.error("no demo selected or demo not found");
    }
  }
}
