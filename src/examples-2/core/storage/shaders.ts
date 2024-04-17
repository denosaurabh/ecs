export type CreateShaderProps = {
  label?: string;

  code: string;

  vertex?: string;
  frag?: string;
};

export type CreateShaderReturn = [
  GPUShaderModule,
  { vertex: string; frag: string }
];

export class ShaderManager {
  constructor(private device: GPUDevice) {}

  create(shader: CreateShaderProps): CreateShaderReturn {
    const { vertexFunction, fragmentFunction } = getShaderFunctionNames(
      shader.code
    );

    const vertex = shader.vertex || vertexFunction;
    const frag = shader.frag || fragmentFunction;

    if (!vertex || !frag) {
      throw new Error(
        `Could not find vertex or fragment function in shader code`
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
      },
    ];
  }
}

function getShaderFunctionNames(wgslCode: string): {
  vertexFunction: string | null;
  fragmentFunction: string | null;
} {
  const lines = wgslCode.split(";");
  let vertexFunction: string | null = null;
  let fragmentFunction: string | null = null;

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
    }
  }

  return { vertexFunction, fragmentFunction };
}
