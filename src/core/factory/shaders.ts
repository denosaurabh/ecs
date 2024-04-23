export type CreateShaderProps = {
  label?: string;

  code: string;

  vertex?: string;
  frag?: string;
  compute?: string;
};

export type Shader = [
  GPUShaderModule,
  { vertex: string; frag: string; compute: string }
];

export class ShaderManager {
  constructor(private device: GPUDevice) {}

  create(shader: CreateShaderProps): Shader {
    const { vertexFunction, fragmentFunction, computeFunction } =
      getShaderFunctionNames(shader.code);

    const vertex = shader.vertex || vertexFunction || "";
    const frag = shader.frag || fragmentFunction || "";
    const compute = shader.compute || computeFunction || "";

    if (!vertex && !frag && !compute) {
      throw new Error(
        `Could not find neither vertex, frag nor compute function in given shader code`
      );
    }

    return [
      this.device.createShaderModule({
        label: shader.label,
        code: shader.code,
      }),
      {
        vertex,
        frag,
        compute,
      },
    ];
  }
}

function getShaderFunctionNames(wgslCode: string): {
  vertexFunction: string | null;
  fragmentFunction: string | null;
  computeFunction: string | null;
} {
  const lines = wgslCode.split(";");
  let vertexFunction: string | null = null;
  let fragmentFunction: string | null = null;
  let computeFunction: string | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    if (trimmedLine.includes("@vertex")) {
      const match = trimmedLine.match(/@vertex\s+fn\s+(\w+)/);
      if (match) {
        vertexFunction = match[1];
      }
    } else if (trimmedLine.includes("@fragment")) {
      const match = trimmedLine.match(/@fragment\s+fn\s+(\w+)/);
      if (match) {
        fragmentFunction = match[1];
      }
    } else if (trimmedLine.includes("@compute")) {
      const match = trimmedLine.match(/@compute\s+fn\s+(\w+)/);
      if (match) {
        computeFunction = match[1];
      }
    }
  }

  return { vertexFunction, fragmentFunction, computeFunction };
}
