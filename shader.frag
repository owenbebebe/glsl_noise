#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

// 2D Random
float random (in vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))
                 * 43758.5453123);
}

float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    // Smooth Interpolation
    // Cubic Hermine Curve.  Same as SmoothStep()
    vec2 u = f*f*(3.0-2.0*f);
    // u = smoothstep(0.,1.,f);

    // Mix 4 coorners percentages
    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

float PI = 3.1415926535897932384626433832795;

void main() {

    float RADIUS = 0.5;
    float SPEED = 0.5;

    vec3 prime_color = vec3(0.04, 0.22, 0.02);
    vec3 second_color = vec3(0.36, 1.0, 0.3);

    vec3 prime_color_2 = vec3(1.0);

    // Normalised pixel coordinates (from 0 to 1)
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    vec2 mouse = u_mouse/u_resolution.xy;
    st -= 0.5;
    mouse -= 0.5;
    st.x *= u_resolution.x/u_resolution.y;

    float dist = length(st);

    float angle = atan(st.y, st.x);
    vec2 trasition_angle = vec2(sin(angle), cos(angle));
    
    // First blob distortion
    float noise_val = noise(trasition_angle + u_time * SPEED) * 0.3;
    float d = dist - (RADIUS + noise_val) * 0.35;

    // Second blob distortion
    float noice_val_2 = noise(trasition_angle + u_time * SPEED * 1.5) * 0.2;
    float d2 = dist - (RADIUS + noice_val_2) * 0.3;

    // 1. COMBINE THE SHAPES HERE
    // Taking the minimum of the two distances unions them into a single shape
    float combined_d = min(d, d2);
    //combined_d = noise(vec2(d, d2));
    
    // 2. CREATE A SINGLE MASK
    float shape_mask = smoothstep(0.01, 0.0, combined_d);

    // Calculate the radial gradient
    float mix_factor = smoothstep(RADIUS, 0.0,noise(st + u_time) * 0.3);
    vec3 color_mix = mix(prime_color, second_color, mix_factor);
    
    // 3. APPLY COLOR TO THE UNIFIED MASK
    float mix_factor_2 = smoothstep(RADIUS * 0.45, 0.0, noise(st + u_time) * 2.);
    color_mix = mix(color_mix, prime_color_2, mix_factor_2);
    vec3 final_color = color_mix * shape_mask;

    gl_FragColor = vec4(final_color, 1.0);
}