const fpsElement = document.getElementById("fps")!;

let startTime = 0;
let endTime = 0;
let frameCount = "";

export const animate = (callback: () => void) => {
  requestAnimationFrame(() => {
    startTime = performance.now();

    callback();

    endTime = performance.now();

    frameCount = `${(endTime - startTime).toFixed(2)} ms`;

    // fpsElement.textContent = frameCount;
  });
};

export const waitForMs = (ms: number) => {
  const start = performance.now();
  while (performance.now() - start < ms) {}
};
