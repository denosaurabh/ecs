struct ProjectionView {
    projView: mat4x4f,
    invProjView: mat4x4f,
};
@group(0) @binding(0) var<uniform> pv : ProjectionView;
@group(0) @binding(1) var<uniform> time : f32;
@group(0) @binding(3) var<uniform> sunPos : vec3f;
@group(0) @binding(4) var<uniform> size : vec2f;

struct Transform {
    modelMat: mat4x4f,
    invModelMat: mat4x4f,
};
@group(1) @binding(0) var<uniform> model : Transform;

@group(2) @binding(0) var<uniform> totalInstances : u32;

/* ********** */
struct VertexInput {
    @builtin(instance_index) InstanceIndex: u32,
    @location(0) position: vec3f,
    @location(1) normal: vec3f,
    @location(2) uv: vec2f,
}

struct VertexOutput {
    @builtin(position) Position: vec4f,
    @location(1) normal: vec3f,
    @location(2) uv: vec2f,
    @location(3) @interpolate(flat) ii: u32,
}

@vertex
fn vertMain(input: VertexInput) -> VertexOutput {
    var pos = input.position;

    var totalInstancesSqrt = sqrt(f32(totalInstances));
    var id = vec2f(f32(input.InstanceIndex) % f32(totalInstancesSqrt), f32(input.InstanceIndex) / f32(totalInstancesSqrt));


    // random scaling
    var scale = 1. + perlinNoise2(id);
    pos *= scale;

    // curved blade
    var power = 2.;
    var offset = pow(2.718, (power * (1. - input.uv.x)) - power);
    pos.x += offset * 1.5 * (noise2(id) * 2. - 1.); //  * sin(time + (rand(input.InstanceIndex) * 0.5 * (rand(input.InstanceIndex) + 1. * 10.)));

    // rotate around y
    var angle = 3.141 * 2. * perlinNoise2(id);
    var x = pos.x * cos(angle) - pos.z * sin(angle);
    var z = pos.x * sin(angle) + pos.z * cos(angle);

    pos.x = x;
    pos.z = z;

    // square position
    var groupiness = .2;

    pos.x += f32(totalInstancesSqrt/(2. / groupiness)) - (groupiness * (f32(input.InstanceIndex) % f32(totalInstancesSqrt))  );
    pos.z += f32(totalInstancesSqrt/(2. / groupiness)) - (groupiness * (f32(input.InstanceIndex) / f32(totalInstancesSqrt))  );

    // position offset
    pos.x += 2. * (noise2(id) * 2. - 1.);
    pos.z += 2. * (noise2(id + f32(totalInstances)) * 2. - 1.);


    // OUTPUT
    var output: VertexOutput;

    output.Position = pv.projView * model.modelMat * vec4f(pos, 1.0);

    var tNormal = model.invModelMat * vec4f(input.normal, 0.0);
    output.normal = normalize(vec3f(tNormal.x, tNormal.y, tNormal.z));

    output.uv = input.uv;
    output.ii = input.InstanceIndex;

    return output;

}


const albedoTop = vec3f(0.656, 0.876, 0.493); 
const albedoBottom = vec3f(0.236, 0.568, 0.456); // 0.143, 0.529, 0.394

@fragment
fn fragMain(input: VertexOutput) -> @location(0) vec4f {
    var albedo = mix(albedoTop, albedoBottom, input.uv.x);

    var color = vec3f(0.0);

    // modifies uv.x
    var power = 4.;
    var offset = pow(2.718, (power * (1. - input.uv.x)) - power);
    color = (offset * albedoTop) + ((1. - offset) * albedoBottom);
    
    color *= min( 0.9, dot(vec3f(1, 0, 0), normalize(input.normal)) );

    return vec4f(color, 1.0);
}


fn rand(x: f32) -> f32 {
    let y = fract(sin(x * 1597.0) * 43758.5453123);
    return y; // * 2.0 - 1.0
}

fn noise2(n: vec2f) -> f32 {
    let d = vec2f(0., 1.);
    let b = floor(n);
    let f = smoothstep(vec2f(0.), vec2f(1.), fract(n));
    return mix(mix(rand22(b), rand22(b + d.yx), f.x), mix(rand22(b + d.xy), rand22(b + d.yy), f.x), f.y);
}

fn rand22(n: vec2f) -> f32 { return fract(sin(dot(n, vec2f(12.9898, 4.1414))) * 43758.5453); }



// MIT License. © Stefan Gustavson, Munrocket
//
fn permute4(x: vec4f) -> vec4f { return ((x * 34. + 1.) * x) % vec4f(289.); }
fn fade2(t: vec2f) -> vec2f { return t * t * t * (t * (t * 6. - 15.) + 10.); }

fn perlinNoise2(P: vec2f) -> f32 {
    var Pi: vec4f = floor(P.xyxy) + vec4f(0., 0., 1., 1.);
    let Pf = fract(P.xyxy) - vec4f(0., 0., 1., 1.);
    Pi = Pi % vec4f(289.); // To avoid truncation effects in permutation
    let ix = Pi.xzxz;
    let iy = Pi.yyww;
    let fx = Pf.xzxz;
    let fy = Pf.yyww;
    let i = permute4(permute4(ix) + iy);
    var gx: vec4f = 2. * fract(i * 0.0243902439) - 1.; // 1/41 = 0.024...
    let gy = abs(gx) - 0.5;
    let tx = floor(gx + 0.5);
    gx = gx - tx;
    var g00: vec2f = vec2f(gx.x, gy.x);
    var g10: vec2f = vec2f(gx.y, gy.y);
    var g01: vec2f = vec2f(gx.z, gy.z);
    var g11: vec2f = vec2f(gx.w, gy.w);
    let norm = 1.79284291400159 - 0.85373472095314 *
        vec4f(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
    g00 = g00 * norm.x;
    g01 = g01 * norm.y;
    g10 = g10 * norm.z;
    g11 = g11 * norm.w;
    let n00 = dot(g00, vec2f(fx.x, fy.x));
    let n10 = dot(g10, vec2f(fx.y, fy.y));
    let n01 = dot(g01, vec2f(fx.z, fy.z));
    let n11 = dot(g11, vec2f(fx.w, fy.w));
    let fade_xy = fade2(Pf.xy);
    let n_x = mix(vec2f(n00, n01), vec2f(n10, n11), vec2f(fade_xy.x));
    let n_xy = mix(n_x.x, n_x.y, fade_xy.y);
    return 2.3 * n_xy;
}