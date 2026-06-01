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

    // Normalised pixel coordinates (from 0 to 1)
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    st -= 0.5;
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

    // 1. COMBINE THE SHAPES
    float combined_d = min(d, d2);
    float shape_mask = smoothstep(0.01, 0.0, combined_d);

    // ==========================================
    // --- 3D BUBBLE LIGHTING & SHADING ---
    // ==========================================

    // 1. FAKE DEPTH
    // We map the distance inside the shape to a 0.0 to 1.0 range.
    // 1.0 = The thickest part (center), 0.0 = The thinnest part (edge).
    float inner_depth = clamp(-combined_d / (RADIUS * 0.35), 0.0, 1.0);

    // 2. FRESNEL EFFECT (Rim Lighting)
    // By subtracting the depth from 1.0 and using a power function, 
    // we make the edges highly visible and the center nearly invisible.
    float fresnel = pow(1.0 - inner_depth, 4.);

    // 3. IRIDESCENCE (Rainbow Soap Swirls)
    // We use a cosine palette driven by our noise and fake depth.
    // This creates shifting rainbow colors that swirl over time.
    float swirl = inner_depth + noise(st + u_time * SPEED) * 0.3;
    vec3 iridescence = 0.5 + 0.5 * cos(2. * PI * (swirl + vec3(0.0, 0.33, 0.67)));

    // 4. SPECULAR HIGHLIGHT (The shine)
    // We place a bright white dot offset to the top-left to simulate a light source.
    vec2 light_pos = vec2(0.1, 0.1); 
    vec2 wobble_light = light_pos + min(noice_val_2, noise_val) * 0.08;
    vec2 light_dir = st - wobble_light;

    // create rotaion matrix
    float rot_angle = 2.3 + min(noice_val_2, noise_val) * 0.08;  
    float c = cos(rot_angle);
    float s = sin(rot_angle);
    mat2 rot_matrix = mat2(c, -s, 
                        s,  c);
    light_dir = rot_matrix * light_dir;

    // oval the highlight
    light_dir.y *= 1.8 + min(noice_val_2, noise_val) * 0.08; 
    light_dir.x *= 0.8 + min(noice_val_2, noise_val) * 0.08;

    // 6. Draw the final shape
    float highlight = smoothstep(0.07, 0.02, length(light_dir + min(noice_val_2, noise_val) * 0.1));

    // 5. THE BORDER RING
    // Keep a thin white outline to define the absolute edge of the bubble
    float border = smoothstep(-0.001, 0.0, combined_d);

    // ==========================================
    // --- COMBINE EVERYTHING ---
    // ==========================================

    // Start with a dark, slightly transparent base for the center of the bubble
    vec3 base_color = vec3(0.05, 0.08, 0.1); 

    // Mix in the rainbow colors, but only strongly on the edges (using fresnel)
    vec3 bubble_color = mix(base_color, iridescence, fresnel * 0.9);

    // Add the bright white highlight
    bubble_color += vec3(1.0) * highlight;

    // Add the sharp white border rim
    bubble_color += vec3(1.0) * border * 0.6;

    // Finally, multiply by the shape mask so the background remains black/transparent
    vec3 final_color = bubble_color * shape_mask;

    gl_FragColor = vec4(final_color, 1.0);
}