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
    vec2 u = f*f*(3.0-2.0*f);

    // Mix 4 corners percentages
    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

float smooth_min(float a, float b) {
    const float k = 0.3; // Smoothness factor
    float h = max(k - abs(a - b), 0.0) / k;
    return min(a, b) - h * h * h * k * (1.0 / 6.0);
}

float PI = 3.1415926535897932384626433832795;

void main() {

    float RADIUS = 0.5;
    float SPEED = 0.5;

    // Normalised pixel coordinates (from 0 to 1)
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    st -= 0.5;
    st.x *= u_resolution.x/u_resolution.y;


    vec2 mouse = vec2(0.0);
    mouse = u_mouse.xy / u_resolution.xy;
    mouse -= 0.5;
    mouse.x *= u_resolution.x / u_resolution.y;
        
    // Calculate distance from current pixel to mouse
    vec2 to_mouse = st - mouse;
    float mouse_dist = length(to_mouse);
        
    // Push pixels away from the mouse to create a squishy dent
    vec2 push = normalize(to_mouse) * smoothstep(5.0, 4.3, mouse_dist) * 0.05;
    st -= push;


    float dist = length(st);

    float angle = atan(st.y, st.x);
    vec2 trasition_angle = vec2(sin(angle), cos(angle));
    
    // First blob distortion
    float noise_val = noise(trasition_angle + u_time * SPEED) * 0.3;
    float d = dist - (RADIUS + noise_val) * 0.35;

    // Second blob distortion
    float noice_val_2 = noise(trasition_angle * 1.5 + u_time * SPEED) * 0.2;
    float d2 = dist - (RADIUS + noice_val_2) * 0.3;

    // 1. COMBINE THE SHAPES
    float combined_d = smooth_min(d, d2);
    float shape_mask = smoothstep(0.01, 0.0, combined_d);

    // ==========================================
    // --- 3D BUBBLE LIGHTING & SHADING ---
    // ==========================================

    // 1. FAKE DEPTH
    float inner_depth = clamp(-combined_d / (RADIUS * 0.35), 0.0, 1.0);

    // 2. FRESNEL EFFECT (Rim Lighting)
    float fresnel = pow(1.0 - inner_depth, 4.);

    // 3. IRIDESCENCE (Rainbow Soap Swirls)
    float swirl = inner_depth + noise(st + u_time * SPEED) * 0.3;
    vec3 iridescence = 0.5 + 0.5 * cos(2. * PI * (swirl + vec3(0.0, 0.33, 0.67)));

    // 4. SPECULAR HIGHLIGHT (The shine)
    vec2 light_pos = vec2(0.1, 0.1); 

    vec2 wobble_light = light_pos + min(noice_val_2, noise_val) * 0.08;
    vec2 light_dir = st - wobble_light;

    // Create rotation matrix
    float rot_angle = 2.3 + min(noice_val_2, noise_val) * 0.08;  
    float c = cos(rot_angle);
    float s = sin(rot_angle);
    mat2 rot_matrix = mat2(c, -s, 
                           s,  c);
    light_dir = rot_matrix * light_dir;

    // Oval the highlight
    light_dir.y *= 1.8 + min(noice_val_2, noise_val) * 0.08; 
    light_dir.x *= 0.8 + min(noice_val_2, noise_val) * 0.08;
    float highlight = smoothstep(0.07, 0.02, length(light_dir + min(noice_val_2, noise_val) * 0.1));

    // 5. THE BORDER RING
    float border = smoothstep(-0.001, 0.0, combined_d);

    // 6. WHITE BORDER FLARE
    float flare = smoothstep(0.08, 0.0, abs(combined_d + 0.03));

    // ==========================================
    // --- COMBINE EVERYTHING ---
    // ==========================================

    vec3 base_color = vec3(0.05, 0.08, 0.1); 
    vec3 bubble_color = mix(base_color, iridescence, fresnel * 0.9);
    
    bubble_color += vec3(1.0) * highlight;
    bubble_color += vec3(1.0) * border * 0.6;

    vec2 cut_direction = normalize(vec2(-1., -1.));
    float cut_mask = smoothstep(-0.01, 0.2, dot(st, cut_direction));
    flare *= cut_mask; 
    bubble_color += vec3(1.0) * flare * 0.8;

    vec3 final_color = bubble_color * shape_mask;

    gl_FragColor = vec4(final_color, 1.0);
}