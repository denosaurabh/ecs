struct VertexOut {
    @builtin(position) position: vec4f,
    @location(0) texCoords: vec2f
}

@vertex 
fn vertexMain(
    @location(0) pos: vec2f,
    @location(1) inTexCoords: vec2f, 
) -> VertexOut 
{ 
    var output : VertexOut; 

    output.position = vec4f(pos, 0.0, 1.0);
    output.texCoords = inTexCoords;

    return output;
}

@group(0) @binding(0) var sDep: texture_depth_2d; // shadow map
@group(0) @binding(1) var rDep: texture_depth_2d; // render map

@group(0) @binding(2) var samp: sampler; // sampler

@group(0) @binding(3) var atex: texture_2d<f32>; // albedo
@group(0) @binding(4) var ntex: texture_2d<f32>; // normal

@group(0) @binding(5) var pvtex: texture_2d<f32>; // position in view space
@group(0) @binding(6) var nvtex: texture_2d<f32>; // normal in view space

@group(0) @binding(7) var noisetex: texture_2d<f32>; // noise

// struct AO {
//     viewSize : vec2f,
//     projectionMatrix : mat4x4f,
//     invProjectionMatrix : mat4x4f,
//     // noiseScale : vec2f,
//     // kernelSize : f32,
//     // kernelOffsets : array<vec3f, 16>, // 64
// };
// @group(1) @binding(0) var<uniform> ao: AO; // position

struct ProjectionView {
    projView: mat4x4f,
    invProjView: mat4x4f,
};
@group(1) @binding(0) var<uniform> pv : ProjectionView;
@group(1) @binding(4) var<uniform> size : vec2f;
@group(1) @binding(7) var<uniform> camView : mat4x4<f32>;


struct Projection {
    projMat: mat4x4f,
    invProjMat: mat4x4f,
};
@group(2) @binding(0) var<uniform> cam : Projection;

@group(3) @binding(0) var<uniform> noise: array<vec4f, 16>;


const kernelSize: u32 = 16u;
const kernelSamples: array<vec3f, kernelSize> = array<vec3f, kernelSize>(
    vec3f(-0.056, -0.008, 0.046),
    vec3f(0.050, -0.053, 0.050),
    vec3f(0.011, -0.056, 0.048),
    vec3f(0.045, 0.037, 0.127),
    vec3f(0.112, 0.107, 0.023),
    vec3f(-0.002, -0.092, 0.084),
    vec3f(0.064, -0.117, 0.039),
    vec3f(-0.264, 0.127, 0.228),
    vec3f(-0.105, -0.055, 0.284),
    vec3f(-0.297, 0.237, 0.166),
    vec3f(-0.353, 0.154, 0.202),
    vec3f(0.122, 0.383, 0.439),
    vec3f(-0.379, -0.149, 0.017),
    vec3f(-0.386, -0.182, 0.658),
    vec3f(0.219, 0.136, 0.455),
    vec3f(0.723, 0.220, 0.287),
);

const radius = 1.;
const bias = 0.025;
const power = 1.;

const noiseSize = 4.;

const noiseArr = array<vec4f, 16>(
    vec4f(-0.646, 0.680, 0.000, 1.000),
    vec4f(-0.810, 0.794, 0.000, 1.000),
    vec4f(-0.741, -0.310, 0.000, 1.000),
    vec4f(-0.974, -0.780, 0.000, 1.000),
    vec4f(-0.648, -0.981, 0.000, 1.000),
    vec4f(-0.236, 0.600, 0.000, 1.000),
    vec4f(0.596, 0.808, 0.000, 1.000),
    vec4f(0.786, -0.306, 0.000, 1.000),
    vec4f(-0.232, -0.108, 0.000, 1.000),
    vec4f(0.225, -0.148, 0.000, 1.000),
    vec4f(0.457, -0.434, 0.000, 1.000),
    vec4f(-0.766, 0.696, 0.000, 1.000),
    vec4f(0.930, 0.814, 0.000, 1.000),
    vec4f(0.741, 0.177, 0.000, 1.000),
    vec4f(-0.090, 0.866, 0.000, 1.000),
    vec4f(-0.993, 0.370, 0.000, 1.000),
);

@fragment
fn fragmentMain(
    @location(0) texCoords: vec2f
) -> @location(0) vec4f 
{
    let noiseScale = vec2f(size.x / noiseSize, size.y / noiseSize);

    var albedo = textureSample(atex, samp, texCoords).rgb;
    var normal = textureSample(ntex, samp, texCoords).rgb;

    var depth = textureSample(rDep, samp, texCoords);

    let vTexCoord = vec2<i32>(texCoords.xy * size);
    let vPosition = textureLoad(pvtex, vTexCoord, 0).xyz;

    // calculating vnormal
    // let vNormal = normalize( textureLoad(nvtex, vTexCoord, 0).xyz );
    let vNormal = mat3x3<f32>(camView[0].xyz, camView[1].xyz, camView[2].xyz) * normal;

    let wrappedCoords = vec2<i32>(
      texCoords * noiseScale
    ) % vec2<i32>(i32(noiseSize));
    // var randomVec = normalize( textureLoad(noisetex, wrappedCoords, 0).xyz );   

    let noiseX = i32((texCoords.x * size.x) - 0.5) % 4;
    let noiseY = i32((texCoords.y * size.y) - 0.5) % 4;
    let randomVec = vec4f(noiseArr[noiseX + (noiseY * 4)]).xyz;

    // let randomVec = normalize( textureLoad(noisetex, vec2<i32>(noiseX, noiseY), 0).xyz );
    
    // randomVec = vec3f(0., 0.1, 0.0);

    /* ********************* AO *********************** */

    let tangent = normalize( randomVec - vNormal * dot(randomVec, vNormal) );
    let bitangent = cross(vNormal, tangent);
    let TBN = mat3x3<f32>(tangent, bitangent, vNormal);

    var output = vec3f(0.0); // test
    var occlusion = 0.0;

    for (var i = 0u; i < kernelSize; i++)
    {
        let sample_vec = radius * (TBN * kernelSamples[i].xyz);
        let sample_pos = vPosition + (sample_vec); // * 0.2;

        /* IMPORTANT - `sample_clip_pos` & `sample_ndc` depends on camera type, i.e. - orthographic or projection */
        /* PROJECTION */
        // let sample_clip_pos = cam.projMat * vec4<f32>(sample_pos, 1.0);
        // let sample_ndc = sample_clip_pos.xy / sample_clip_pos.w;

        /* ORTHOGRAPHIC */
        let sample_clip_pos = cam.projMat * vec4<f32>(sample_pos, 1.0);
        let sample_ndc = sample_clip_pos.xy;// / sample_clip_pos.w; //  * 2.; // * 2. - is added

        let sample_uv = sample_ndc * vec2<f32>(0.5, -0.5) + 0.5;// * 2.; // * 2. - is added
        var sample_coords = vec2<i32>(floor(sample_uv * vec2<f32>(size)));
        sample_coords = clamp(sample_coords, vec2<i32>(0), vec2<i32>(size) - 1);

        let sample_depth: f32 = textureLoad(rDep, sample_coords, 0);
        if (sample_depth == 1.0) {
            continue;
        }

        // OPTION:::::::::: 1
        let z = screen_space_depth_to_view_space_z(sample_depth);
        // let z = textureLoad(pvtex, vec2<i32>(offset.xy * size), 0);

        // let range_check = smoothstep(0.0, 1.0, radius / abs(vPosition.z - z));
        // occlusion = occlusion + select(0.0, 1.0, z >= sample_pos.z + bias);// * range_check;


        // OPTION:::::::::: 2
        let sample_view_pos = textureLoad(pvtex, sample_coords, 0).xyz;
        // let range_check = smoothstep(0.0, 1.0, radius / abs(view_pos.z - sample_view_pos.z));
        occlusion = occlusion + select(0.0, 1.0, sample_view_pos.z >= sample_pos.z + bias);// * range_check;


        // output = output + sample_pos;
        // output = output + vec3f(sample_clip_pos.xyz);
        // output = output + vec3f(sample_ndc.xy, 0.);
        // output = output + vec3f(sample_uv.xy, 0.);
        // output = output + vec3f(range_check);
        // output = output + normalize( vec3f(abs(sample_pos.z)) );
        // output = output + normalize(abs(vec3f(z)));
        // output = output + vec3f(sample_depth);
        // output = vec3f(normalize(abs(sample_clip_pos.xyz)));
        // output = output + bias;

        ////////////////////////////////////////////////


        /*
        var sample = TBN * kernelSamples[i];
        sample = vPosition + sample * radius;

        var offset = vec4f(sample, 1.0);
        offset = cam.projMat * offset;
        offset = vec4f(offset.xyz / offset.w, offset.w);
        offset = vec4f(offset.xy * 0.5 + 0.5, offset.z, offset.w);

        let occluderPos = textureLoad(pvtex, vec2<i32>(offset.xy * size), 0).xyz;
        // let occluderPos = textureLoad(pvtex, vec2<i32>(offset.xy), 0).xyz;

        if (occluderPos.z >= sample.z + bias) {
            occlusion += 1.0;
        } else {
            occlusion += 0.0;
        }


        // if (sample.y + bias <= occluderPos.y) {
        //     occlusion += 0.0;
        // } else {
        //     occlusion += 1.0;
        // }


        */
    }


    /* ***************** FINAL COLOR ***************** */

    var color = vec3f(0.0);

    // color = vec3f(texCoords, 0.0);
    // color = vec3f(f32(vTexCoord.x), f32(vTexCoord.y), 0.0);

    // color = vec3f(depth);

    // color = albedo;
    // color = normal;
    // color = randomVec;

    // color = vPosition;
    // color = vNormal;

    // color = tangent;
    // color = bitangent;

    // color = vec3f( output / f32(kernelSize) );
    // color = vec3f( 1.0 - (occlusion / f32(kernelSize)) );

    return vec4f(color, 1.0);



    /*

    /* ***************** READ TEXTURES ***************** */
    let noiseScale = vec2f(size.x / 8., size.y / 8.);




    var albedo = textureSample(atex, samp, texCoords).rgb;
    var shadow = textureSample(stex, samp, texCoords).rgb;

    let vTexCoord = vec2<i32>(texCoords.xy * size);

    let position = textureLoad(ptex, vTexCoord, 0).xyz;
    let normal = normalize(textureLoad(ntex, vTexCoord, 0).xyz);

    let noiseTexDims = vec2f(textureDimensions(ntex));
    let wrappedCoords = vec2<i32>(
      texCoords.xy * noiseScale
    ) % vec2<i32>(8);

    // let noise = textureLoad(noisetex, vec2<i32>(texCoords.xy * noiseScale), 0).xyz;   
    let noise = textureLoad(noisetex, wrappedCoords, 0).xyz;   

    // let sDepth: f32 = textureLoad(sDep, vTexCoord, 0);
    let rDepth: f32 = textureLoad(rDep, vTexCoord, 0);


    /* ********************* AO *********************** */

    // // construct viewSpace pos from depth
    // let clipSpacePos = vec4f(texCoords * 2.0 - 1.0, rDepth, 1.0);

    // // transform the clip space position to view space
    // var viewSpacePos = pv.invProjView * clipSpacePos;
    // viewSpacePos /= viewSpacePos.w;

    let viewSpacePos = calculate_view_position(texCoords, rDepth, cam.invProjMat);


    // create tangent, bitangent & transform matrix
    let tangent = normalize(noise - normal * dot(noise, normal));
    let bitangent = cross(normal, tangent);
    let transformMat = mat3x3f(tangent, bitangent, normal);

    var occlusion = 0.0;

    let radius: f32 = 10.;

    for (var i = 0u; i < kernelSize; i++) {
        var samplePos = kernelOffsets[i] * transformMat;
        samplePos = samplePos * radius + rDepth;
        
        let sampleDir = normalize(samplePos - rDepth);

	    let nDotS = max(dot(normal, sampleDir), 0.);

        var offset = vec4f(samplePos, 1.0) * cam.projMat; // * pv.projView
	    offset.x /= offset.w;	
	    offset.y /= offset.w;

        // let sampleCoordsView = vec2<i32>(
        //     i32(size.x * (offset.x * 0.5 + 0.5)),
        //     i32(size.y * (-offset.y * 0.5 + 0.5))
        // );
        let sampleCoords = vec2<i32>(
            i32((offset.x * 0.5 + 0.5)),
            i32((-offset.y * 0.5 + 0.5))
        );

        var sampleDepth = textureLoad(
            rDep, 
            sampleCoords, 
            0
        );
	    // sampleDepth = ComputePositionViewFromZ(offset.xy, sampleDepth).z;		
        sampleDepth = calculate_view_position(
            // vec2f(f32(sampleCoordsView.x), f32(sampleCoordsView.y)),
            // vec2f(f32(sampleCoords.x), f32(sampleCoords.y)),
            offset.xy,
            sampleDepth,
            cam.invProjMat
        ).z;

        // construct viewSpace pos from depth
        // let clipSpacePosI = vec4f(texCoords * 2.0 - 1.0, sampleDepth, 1.0);

        // transform the clip space position to view space
        // var viewSpacePosI = pv.invProjView * clipSpacePosI;
        // viewSpacePosI /= viewSpacePosI.w;

        // sampleDepth = viewSpacePosI.z;

        var rangeCheck = smoothstep(0.0, 1.0, radius / abs(rDepth - sampleDepth)); // rDepth.z
        occlusion += rangeCheck * step(sampleDepth, samplePos.z) * nDotS;
    }


    let power: f32 = 1.0;

    occlusion = 1. - (occlusion / f32(kernelSize));
    let finalOcclusion = pow(occlusion, power);





    /* ***************** FINAL COLOR ***************** */


    // final color
    var color = vec3f(0.0);
    // color = albedo; 
    // color = shadow;

    // color = normal;
    // color = position;
    // color = vec3f(noise);

    // color = vec3f(rDepth);
    // color = vec3f(sDepth);

    let normalizedPos = (viewSpacePos.xyz + 1.0) * 0.5;
    // color = normalizedPos;

    // color = vec3f(finalOcclusion);


    return vec4f(color, 1.0);






    */










    /*




    var albedo = textureSample(atex, samp, texCoords).rgb;
    var shadow = textureSample(stex, samp, texCoords).rgb;

    let position = textureLoad(ptex, vec2<i32>(texCoords.xy), 0).xyz;
    let normal = normalize(textureLoad(ntex, vec2<i32>(texCoords.xy), 0).xyz);
    let noise = textureLoad(noisetex, vec2<i32>(texCoords.xy * ao.noiseScale), 0).zy; // bgra to rgba   

    var occlusion = 0.0;
    for (var i = 0u; i < u32(ao.kernelSize); i++) {
        let samplePos = position + ao.kernelOffsets[i] + vec3<f32>(noise, 0.0);
        let sampleDepth = textureLoad(ptex, vec2<i32>(samplePos.xy), 0).z;
        let rangeCheck = smoothstep(0.0, 1.0, ao.kernelOffsets[i].z / abs(position.z - sampleDepth));

        if (sampleDepth >= samplePos.z) {
            occlusion += 1.0 * rangeCheck;
        } else {
            occlusion += 0.0 * rangeCheck;
        }

        // occlusion += (sampleDepth >= samplePos.z ? 1.0 : 0.0) * rangeCheck;
    }
    occlusion = 1.0 - (occlusion / f32(ao.kernelSize));

    // final color
    var color = vec3f(occlusion);
    color = vec3f(noise, 0.0);
    // color = albedo;

    return vec4f(color, 1.0);




    */





    /*




    var albedo = textureSample(atex, samp, texCoords).rgb;
    var shadow = textureSample(stex, samp, texCoords).rgb;
    var normal = textureSample(ntex, samp, texCoords).rgb;
    var position = textureSample(ptex, samp, texCoords).rgb;
    var noise = textureSample(noisetex, samp, texCoords).rgb;

    // calculate edges
    let viewSize = vec2<f32>(1527.0, 1357.0);

    let texelSize = vec2<f32>(viewSize.x / (viewSize.x * viewSize.y), viewSize.y / (viewSize.x * viewSize.y)); // 0.0005, 0.0005

    // samples
    let tl = textureSample(ntex, samp, texCoords + vec2<f32>(-texelSize.x,    texelSize.y)).rgb;
    let tt = textureSample(ntex, samp, texCoords + vec2<f32>(0.0,             texelSize.y)).rgb;
    let tr = textureSample(ntex, samp, texCoords + vec2<f32>(texelSize.x,     texelSize.y)).rgb;

    let cl = textureSample(ntex, samp, texCoords + vec2<f32>(-texelSize.x,    0.0)).rgb;
    let cc = textureSample(ntex, samp, texCoords).rgb;
    let cr = textureSample(ntex, samp, texCoords + vec2<f32>(texelSize.x,     0.0)).rgb;

    let bl = textureSample(ntex, samp, texCoords + vec2<f32>(-texelSize.x,    -texelSize.y)).rgb;
    let bb = textureSample(ntex, samp, texCoords + vec2<f32>(0.0,             -texelSize.y)).rgb;
    let br = textureSample(ntex, samp, texCoords + vec2<f32>(texelSize.x,     -texelSize.y)).rgb;

    var sobelV = (1.*tl + 0.*tt + -1.*tr + 2.*cl + 0.*cc + -2.*cr + 1.*bl + 0.*bb + -1.*br) / 9.0;
    var sobelH = (1.*tl + 0.*cl + -1.*bl + 2.*tt + 0.*cc + -2.*bb + 1.*tr + 0.*cr + -1.*br) / 9.0;

    var edge = sqrt(sobelV * sobelV + sobelH * sobelH);


    // convert edge to black & white
    let edgeColor = vec3f(1.0);
    edge = (vec3f(edge.x + edge.y + edge.z) / 3.0) * 1.;

    let shadowColor = (1. - shadow) * vec3f(.4); // * vec3f(0.9);

    // final color
    // var color = albedo + shadowColor - edge;
    var color = albedo - edge;
    // color = albedo;
    // color = shadow; 
    // color = position;
    // color = edge; 
    color = noise;

    return vec4f(color, 1.0);




    */
}


// FOR FAST POSITION RECONSTRUCTION
// https://gamedev.stackexchange.com/questions/108856/fast-position-reconstruction-from-depth

fn calculate_view_position(texture_coordinate: vec2f, depth_from_depth_buffer: f32, inverse_projection_matrix: mat4x4f) -> vec3f {
    let clip_space_position = vec4f(texture_coordinate * 2.0 - vec2(1.0), 2.0 * depth_from_depth_buffer - 1.0, 1.0);
    var position = inverse_projection_matrix * clip_space_position; // Use this for view space
    return (position.xyz / position.w);

    // position /= position.w;
    // return position.xyz;
}

fn calculate_world_position(texture_coordinate: vec2f, depth_from_depth_buffer: f32, inverse_projection_view_matrix: mat4x4f) -> vec3f {
    let clip_space_position = vec4f(texture_coordinate * 2.0 - vec2(1.0), 2.0 * depth_from_depth_buffer - 1.0, 1.0);
    let position = inverse_projection_view_matrix * clip_space_position; // Use this for world space
    return (position.xyz / position.w);
}


/*


  let clipSpacePos = vec3f(texture_coordinate, depth_from_depth_buffer) * 2.0 - vec3f(1.0);


    //vec4 position = inverse_projection_matrix * clip_space_position; // Use this for view space
    let position = invProjViewMat * clip_space_position; // Use this for world space


    // let view_position = vec4f(
    //     vec2f(invProjMat[0][0], invProjMat[1][1]) * clipSpacePos.xy,
    //     invProjMat[2][3] * clipSpacePos.z + invProjMat[3][3],
    //     1.
    // );
    // let view_position = invProjMat * clipSpacePos;

    return view_position.xyz / view_position.w;

*/


fn screen_space_depth_to_view_space_z(d: f32) -> f32 {
    // FOR PERSSPECTIVE
    // let depth_add =  -cam.projMat[2][2];
    // let depth_mul = cam.projMat[3][2];

    // return depth_mul / (depth_add - d);

    // FOR ORTHOGRAPHIC
    let near = 0.001;// cam.near;
    let far = 150.;//cam.far;
    return mix(near, far, d);
}