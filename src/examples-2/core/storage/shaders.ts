export type CreateShaderProps = {
  label?: string;

  code: string;

  vertex: string;
  frag: string;
};

export type CreateShaderReturn = [
  GPUShaderModule,
  { vertex: string; frag: string }
];

export class ShaderManager {
  constructor(private device: GPUDevice) {}

  create(shader: CreateShaderProps): CreateShaderReturn {
    return [
      this.device.createShaderModule({
        label: shader.label,
        code: shader.code,
      }),
      { vertex: shader.vertex, frag: shader.frag },
    ];
  }
}
