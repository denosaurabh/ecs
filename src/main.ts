import "./index.css";

import {
  EdgesAndShadowMap,
  ImportObj,
  Grass,
  Tree,
  AmbientOcclusion,
  CuriousCabins,
} from "./demos";

let cleanup: () => void;

//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////

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

//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////

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
    case "#edges_shadowmap": {
      cleanup = await EdgesAndShadowMap();
      break;
    }
    case "#import_obj": {
      cleanup = await ImportObj();
      break;
    }
    case "#grass": {
      cleanup = await Grass();
      break;
    }
    case "#tree": {
      cleanup = await Tree();
      break;
    }
    case "#ao": {
      cleanup = await AmbientOcclusion();
      break;
    }
    case "#curious-cabins": {
      cleanup = await CuriousCabins();
      break;
    }
    default: {
      console.error("no demo selected or demo not found");
    }
  }
}
