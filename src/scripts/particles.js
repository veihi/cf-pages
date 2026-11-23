// A small, dependency-free WebGL point field. No textures or external requests.
export function startParticles(canvas) {
  const parent = canvas.parentElement;
  const gl = canvas.getContext('webgl', { alpha: true, antialias: false, powerPreference: 'low-power' });
  if (!gl) return () => {};
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const vertex = `
    attribute vec3 aPosition;
    attribute float aSeed;
    uniform float uTime;
    uniform float uAspect;
    uniform float uDpr;
    uniform vec2 uPointer;
    varying float vAlpha;
    varying float vSeed;
    void main(){
      vec3 p=aPosition;
      float ay=uTime*.06+uPointer.x*.12;
      p.xz=mat2(cos(ay),-sin(ay),sin(ay),cos(ay))*p.xz;
      float ax=.75+uPointer.y*.1;
      p.yz=mat2(cos(ax),-sin(ax),sin(ax),cos(ax))*p.yz;
      float az=-.38;
      p.xy=mat2(cos(az),-sin(az),sin(az),cos(az))*p.xy;
      float depth=3.8+p.z;
      vec2 projected=p.xy*2.4/depth;
      projected.x/=uAspect;
      gl_Position=vec4(projected,0.,1.);
      gl_PointSize=(.7+aSeed*1.6)*uDpr*(3.4/depth);
      vAlpha=clamp((p.z+1.8)*.2+.2,.12,.85);
      vSeed=aSeed;
    }`;
  const fragment = `
    precision mediump float;
    varying float vAlpha;
    varying float vSeed;
    void main(){
      float d=length(gl_PointCoord-.5);
      if(d>.5)discard;
      vec3 color=mix(vec3(.64,.73,.48),vec3(.85,1.,.49),vSeed);
      gl_FragColor=vec4(color,vAlpha*(1.-smoothstep(.1,.5,d)));
    }`;
  const compile = (type, source) => {
    const shader = gl.createShader(type); gl.shaderSource(shader, source); gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { gl.deleteShader(shader); return null; }
    return shader;
  };
  const vs = compile(gl.VERTEX_SHADER, vertex), fs = compile(gl.FRAGMENT_SHADER, fragment);
  if (!vs || !fs) { if(vs) gl.deleteShader(vs); if(fs) gl.deleteShader(fs); return () => {}; }
  const program = gl.createProgram(); gl.attachShader(program, vs); gl.attachShader(program, fs); gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { gl.deleteProgram(program); gl.deleteShader(vs); gl.deleteShader(fs); return () => {}; }
  gl.useProgram(program);
  // Deterministic samples produce the same field on each visit.
  let seed = 421;
  const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const count = innerWidth < 700 ? 6500 : 14500;
  const points = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    const angle = random() * Math.PI * 2, cross = random() * Math.PI * 2;
    const thickness = .24 + random() * .21;
    const radius = 1.16 + Math.cos(cross) * thickness;
    points.set([Math.cos(angle) * radius, Math.sin(angle) * radius, Math.sin(cross) * thickness, random()], i * 4);
  }
  const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'aPosition'); const sample = gl.getAttribLocation(program, 'aSeed');
  gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 3, gl.FLOAT, false, 16, 0);
  gl.enableVertexAttribArray(sample); gl.vertexAttribPointer(sample, 1, gl.FLOAT, false, 16, 12);
  const time = gl.getUniformLocation(program, 'uTime'), aspect = gl.getUniformLocation(program, 'uAspect');
  const pointer = gl.getUniformLocation(program, 'uPointer'), pixelRatio = gl.getUniformLocation(program, 'uDpr');
  gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
  let raf = 0, visible = true, disposed = false, last = 0, elapsed = 0;
  let targetX = 0, targetY = 0, x = 0, y = 0;
  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(parent.clientWidth * dpr); canvas.height = Math.round(parent.clientHeight * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform1f(aspect, canvas.width / Math.max(canvas.height, 1)); gl.uniform1f(pixelRatio, dpr);
    if (reduced.matches) draw(0);
  }
  function draw(stamp) {
    if (disposed) return;
    const delta = last ? Math.min(stamp - last, 40) : 0; last = stamp; elapsed += delta;
    x += (targetX - x) * .04; y += (targetY - y) * .04;
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(time, reduced.matches ? 0 : elapsed * .001); gl.uniform2f(pointer, x, y);
    gl.drawArrays(gl.POINTS, 0, count);
    if (!reduced.matches && visible && !document.hidden) raf = requestAnimationFrame(draw);
  }
  function resume() { cancelAnimationFrame(raf); last = 0; if (visible && !document.hidden && !disposed) draw(0); }
  const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; resume(); }); observer.observe(canvas);
  const sizeObserver = new ResizeObserver(resize); sizeObserver.observe(parent);
  const move = event => { const r = parent.getBoundingClientRect(); targetX = ((event.clientX - r.left) / r.width - .5) * 2; targetY = ((event.clientY - r.top) / r.height - .5) * 2; };
  const leave = () => { targetX = 0; targetY = 0; };
  const lost = event => { event.preventDefault(); cancelAnimationFrame(raf); parent.classList.remove('gl-ready'); };
  parent.addEventListener('pointermove', move, { passive: true }); parent.addEventListener('pointerleave', leave);
  canvas.addEventListener('webglcontextlost', lost); document.addEventListener('visibilitychange', resume); reduced.addEventListener('change', resume);
  parent.classList.add('gl-ready'); resize(); resume();
  return () => {
    disposed = true; cancelAnimationFrame(raf); observer.disconnect(); sizeObserver.disconnect();
    parent.removeEventListener('pointermove', move); parent.removeEventListener('pointerleave', leave); canvas.removeEventListener('webglcontextlost', lost);
    document.removeEventListener('visibilitychange', resume); reduced.removeEventListener('change', resume);
    gl.deleteBuffer(buffer); gl.deleteProgram(program); gl.deleteShader(vs); gl.deleteShader(fs);
  };
}
