import { RunIsometricCameraPan } from "./isometric-camera-pan";
import { RunTriangle } from "./triangle";

const selectDemoElement = document.getElementById("select_demo");

if (!selectDemoElement) {
  throw new Error("selectDemoElement not found");
}

let cleanup: () => void;

selectDemoElement.addEventListener("change", async (event) => {
  // cleanup
  if (cleanup) {
    cleanup();
  }

  switch ((event.target as HTMLSelectElement)?.value) {
    case "select": {
      console.warn("select a demo");
      break;
    }
    case "triangle": {
      cleanup = await RunTriangle();
      break;
    }
    case "isometric_pan": {
      cleanup = await RunIsometricCameraPan();
      break;
    }
    case "outlines": {
      // TODO
      break;
    }
    default: {
      console.error("no demo selected or demo not found");
    }
  }
});
