import React, { useEffect, useRef } from 'react';
import { ThreeUniverse } from './ThreeUniverse';

interface ShaderBackgroundProps {
  type?: 'core' | 'radar' | 'universe';
  className?: string;
}

const VERTEX_SHADER_SRC = `
  attribute vec2 a_position;
  varying vec2 v_texCoord;
  void main() {
    v_texCoord = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER_CORE_SRC = `
  precision highp float;
  varying vec2 v_texCoord;
  uniform float u_time;
  uniform vec2 u_resolution;

  void main() {
      vec2 uv = v_texCoord;
      vec2 center = vec2(0.5, 0.5);
      float dist = distance(uv, center);
      
      // Cyber-Nexus Core Pulse
      float pulse = sin(u_time * 0.8) * 0.5 + 0.5;
      vec3 color = vec3(0.01, 0.01, 0.03); // Deep background
      
      // Dynamic Grid Lines
      float grid = abs(sin(uv.x * 50.0)) * abs(sin(uv.y * 50.0));
      grid = pow(grid, 0.1);
      color += grid * vec3(0.05, 0.1, 0.2) * 0.15;
      
      // Floating "Data" Particles
      float particles = sin(uv.x * 100.0 + u_time) * cos(uv.y * 100.0 - u_time);
      particles = smoothstep(0.98, 1.0, particles);
      color += particles * vec3(0.23, 0.51, 0.96) * pulse;
      
      // Radial Vignette
      color *= 1.5 - dist;

      gl_FragColor = vec4(color, 1.0);
  }
`;

const FRAGMENT_SHADER_RADAR_SRC = `
  precision highp float;
  varying vec2 v_texCoord;
  uniform float u_time;
  uniform vec2 u_resolution;

  void main() {
      vec2 uv = v_texCoord;
      vec2 center = vec2(0.5, 0.5);
      float dist = distance(uv, center);
      
      // Background grid
      float grid = (sin(uv.x * 40.0) * 0.5 + 0.5) * (sin(uv.y * 40.0) * 0.5 + 0.5);
      vec3 color = vec3(0.01, 0.01, 0.03);
      color += grid * 0.02;
      
      // Rotating sweep
      float angle = atan(uv.y - 0.5, uv.x - 0.5);
      float sweep = mod(angle - u_time * 2.0, 6.28318) / 6.28318;
      sweep = pow(sweep, 4.0);
      
      // Rings
      float ring1 = abs(sin(dist * 20.0 - u_time * 2.0)) * 0.1;
      float ring2 = 1.0 - smoothstep(0.45, 0.46, dist);
      ring2 *= smoothstep(0.44, 0.45, dist);
      
      // Glow
      vec3 glowColor = vec3(0.23, 0.51, 0.96); // Neon Blue
      color += sweep * glowColor * 0.3;
      color += ring1 * glowColor * 0.2 * (1.0 - dist);
      color += ring2 * glowColor * 0.8;
      
      // Center point
      float centerDot = 1.0 - smoothstep(0.0, 0.01, dist);
      color += centerDot * vec3(1.0);

      gl_FragColor = vec4(color, 1.0);
  }
`;

export const ShaderBackground: React.FC<ShaderBackgroundProps> = ({
  type = 'core',
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (type === 'universe') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let gl = canvas.getContext('webgl') as WebGLRenderingContext | null;
    if (!gl) {
      gl = canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
    }
    if (!gl) return;

    // Size Sync
    const syncSize = () => {
      const w = canvas.clientWidth || window.innerWidth;
      const h = canvas.clientHeight || window.innerHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        if (gl) gl.viewport(0, 0, w, h);
      }
    };

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(syncSize);
      resizeObserver.observe(canvas);
    }
    syncSize();

    // Helper compiler
    const compileShader = (shaderType: number, src: string): WebGLShader | null => {
      const shader = gl!.createShader(shaderType);
      if (!shader) return null;
      gl!.shaderSource(shader, src);
      gl!.compileShader(shader);
      if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl!.getShaderInfoLog(shader));
        gl!.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = compileShader(gl.VERTEX_SHADER, VERTEX_SHADER_SRC);
    const fsSrc = type === 'radar' ? FRAGMENT_SHADER_RADAR_SRC : FRAGMENT_SHADER_CORE_SRC;
    const fs = compileShader(gl.FRAGMENT_SHADER, fsSrc);

    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program linking error:', gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Quad Buffer
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    const posAttr = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(posAttr);
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

    const uTimeLoc = gl.getUniformLocation(program, 'u_time');
    const uResolutionLoc = gl.getUniformLocation(program, 'u_resolution');
    const uMouseLoc = gl.getUniformLocation(program, 'u_mouse');

    let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      if (rect.width && rect.height) {
        const nx = (e.clientX - rect.left) / rect.width;
        const ny = 1.0 - (e.clientY - rect.top) / rect.height;
        mouse.x = nx * canvas.width;
        mouse.y = ny * canvas.height;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);

    let animationFrameId: number;
    const render = (time: number) => {
      if (!gl || !canvas) return;
      gl.viewport(0, 0, canvas.width, canvas.height);
      
      if (uTimeLoc) gl.uniform1f(uTimeLoc, time * 0.001);
      if (uResolutionLoc) gl.uniform2f(uResolutionLoc, canvas.width, canvas.height);
      if (uMouseLoc) gl.uniform2f(uMouseLoc, mouse.x, mouse.y);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationFrameId = requestAnimationFrame(render);
    };

    render(0);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      if (resizeObserver) resizeObserver.disconnect();
      if (gl) {
        gl.deleteBuffer(buffer);
        gl.deleteProgram(program);
        gl.deleteShader(vs);
        gl.deleteShader(fs);
      }
    };
  }, [type]);

  if (type === 'universe') {
    return (
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
        <ThreeUniverse className={className} />
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 w-full h-full pointer-events-none z-0 ${className}`}
      style={{ display: 'block' }}
    />
  );
};
