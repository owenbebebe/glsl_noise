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

// we first have to create a circualr shape and apply a noise funtion to its border
// the shape border would interpolate in according to time . 
void main() {

    float RADIUS = 0.3;
    float SPEED = 0.5;

    vec3 prime_color = vec3(0.0, 0.97, 0.32);
    vec3 second_color = vec3(0.97, 0.55, 0.04);

    // Normalised pixel coordinates (from 0 to 1)
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    st -= 0.5;
    st.x *= u_resolution.x/u_resolution.y;

    float dist = length(st);

    float angle = atan(st.y, st.x);
    vec2 trasition_angle = vec2(sin(angle), cos(angle));
    float noise_val = noise(trasition_angle  + u_time * SPEED) * 0.3;
    float d  = dist - (RADIUS + noise_val) * 0.3;
    float circle = smoothstep(0.01, 0.0, d);

    float mix_factor = smoothstep(RADIUS, 0.0, dist);

    vec3 color_mix = mix(prime_color, second_color, mix_factor);
    vec3 final_color = color_mix * circle;

    gl_FragColor = vec4(final_color, 1.0);
}