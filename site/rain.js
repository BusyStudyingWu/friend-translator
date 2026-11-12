/* 雨窗背景：直接使用设计稿雨窗图，叠加程序化飘落的雨丝、水汽与颗粒。
   纯 WebGL，无外部依赖。 */
(function () {
  'use strict';
  var canvas = document.getElementById('rain');
  if (!canvas) return;
  var gl = canvas.getContext('webgl', { antialias: false, alpha: false, depth: false, stencil: false, preserveDrawingBuffer: true });
  if (!gl) { document.body.classList.add('no-webgl'); return; }

  var vsSrc = [
    'attribute vec2 aPos;',
    'void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }'
  ].join('\n');

  var fsSrc = [
    'precision highp float;',
    'uniform vec2 uRes;',
    'uniform float uTime;',
    'uniform sampler2D uTex;',
    'uniform float uTexReady;',
    '',
    'const float IMG_ASPECT = 0.5625; /* 1242x2208 */',
    '',
    'float hash1(float p){ p = fract(p*0.1031); p *= p + 33.33; p *= p + p; return fract(p); }',
    '',
    'float vnoise(vec2 p){',
    '  vec2 i = floor(p); vec2 f = fract(p);',
    '  f = f*f*(3.0-2.0*f);',
    '  float a = hash1(i.x + i.y*57.0);',
    '  float b = hash1(i.x + 1.0 + i.y*57.0);',
    '  float c = hash1(i.x + (i.y+1.0)*57.0);',
    '  float d = hash1(i.x + 1.0 + (i.y+1.0)*57.0);',
    '  return mix(mix(a,b,f.x), mix(c,d,f.x), f.y);',
    '}',
    '',
    '/* cover 适配：让图片铺满画布 */',
    'vec2 coverUv(vec2 st){',
    '  float ca = uRes.x/uRes.y;',
    '  vec2 s = (ca > IMG_ASPECT) ? vec2(1.0, IMG_ASPECT/ca) : vec2(ca/IMG_ASPECT, 1.0);',
    '  return (st - 0.5)*s + 0.5;',
    '}',
    '',
    'vec3 backdrop(vec2 st){',
    '  vec2 uv = coverUv(st);',
    '  vec2 px = vec2(1.0/700.0);',
    '  vec3 c = texture2D(uTex, uv).rgb*0.4',
    '         + texture2D(uTex, uv + vec2( px.x, 0.0)).rgb*0.15',
    '         + texture2D(uTex, uv + vec2(-px.x, 0.0)).rgb*0.15',
    '         + texture2D(uTex, uv + vec2(0.0,  px.x)).rgb*0.15',
    '         + texture2D(uTex, uv + vec2(0.0, -px.x)).rgb*0.15;',
    '  return c;',
    '}',
    '',
    '/* 纹理未就绪时的雨天渐变 */',
    'vec3 fallbackSky(vec2 st){',
    '  return mix(vec3(0.62, 0.65, 0.64), vec3(0.93, 0.94, 0.94), st.y);',
    '}',
    '',
    '/* 一层雨丝：细长的斜落线条 */',
    'float streakLayer(vec2 st, float t, float cols, float period, float speed, float thick, float gate){',
    '  float x = (st.x + st.y*0.28)*cols;   /* 斜向右下方飘落 */',
    '  float ci = floor(x);',
    '  float h = hash1(ci*91.7 + 17.3);',
    '  float fx = abs(fract(x) - 0.5);',
    '  float colMask = smoothstep(thick, thick*0.35, fx)*step(gate, h);',
    '  float ph = fract(st.y/period + t*speed/period + h*7.0);',
    '  float dash = smoothstep(0.0, 0.02, ph)*smoothstep(0.22, 0.05, ph);',
    '  return colMask*dash;',
    '}',
    '',
    'void main(){',
    '  vec2 st = gl_FragCoord.xy/uRes;',
    '  float t = uTime;',
    '  vec3 col = mix(fallbackSky(st), backdrop(st), uTexReady);',
    '',
    '  /* 三层飘落的雨丝：细银色、不显眼（底图自带静态雨痕，动态层更轻） */',
    '  float rain = 0.0;',
    '  rain += streakLayer(st, t, 85.0, 1.2, 1.30, 0.09, 0.38)*0.035;',
    '  rain += streakLayer(st + 3.7, t, 48.0, 0.9, 0.90, 0.07, 0.42)*0.055;',
    '  rain += streakLayer(st + 9.2, t, 22.0, 0.75, 0.65, 0.05, 0.48)*0.085;',
    '',
    '  /* 缓慢流动的水汽 */',
    '  float haze = vnoise(st*6.0 + t*0.02)*0.5 + vnoise(st*13.0)*0.5;',
    '  col = mix(col, vec3(0.78, 0.80, 0.79), 0.06 + 0.05*haze);',
    '',
    '  col += vec3(0.84, 0.87, 0.90)*rain;',
    '',
    '  col *= 1.0 - 0.18*pow(length(st - 0.5)*1.25, 2.0);',
    '  col += (hash1(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) + t) - 0.5)*0.02;',
    '  gl_FragColor = vec4(col, 1.0);',
    '}'
  ].join('\n');

  function compile(type, src) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('rain shader:', gl.getShaderInfoLog(shader));
      return null;
    }
    return shader;
  }

  var vs = compile(gl.VERTEX_SHADER, vsSrc);
  var fs = compile(gl.FRAGMENT_SHADER, fsSrc);
  if (!vs || !fs) { document.body.classList.add('no-webgl'); return; }
  var program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('rain link:', gl.getProgramInfoLog(program));
    document.body.classList.add('no-webgl');
    return;
  }
  gl.useProgram(program);

  var buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var aPos = gl.getAttribLocation(program, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  var uRes = gl.getUniformLocation(program, 'uRes');
  var uTime = gl.getUniformLocation(program, 'uTime');
  var uTex = gl.getUniformLocation(program, 'uTex');
  var uTexReady = gl.getUniformLocation(program, 'uTexReady');
  gl.uniform1i(uTex, 0);
  gl.uniform1f(uTexReady, 0);

  var texReady = 0;
  var tex = gl.createTexture();
  var img = new Image();
  img.onload = function () {
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    texReady = 1;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      /* 静帧模式下纹理就绪后补渲一帧 */
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, 12.0);
      gl.uniform1f(uTexReady, 1);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
  };
  img.src = './assets/rain-window.jpg?v=2';

  var scale = Math.min(window.devicePixelRatio || 1, 2) * 0.7;
  function resize() {
    var w = Math.max(1, Math.round(window.innerWidth * scale));
    var h = Math.max(1, Math.round(window.innerHeight * scale));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  }
  window.addEventListener('resize', resize);
  resize();

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var start = performance.now();
  function draw(timeSec) {
    resize();
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, timeSec);
    gl.uniform1f(uTexReady, texReady);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  if (reduced) {
    /* 减少动态：只渲染一帧静止雨幕 */
    draw(12.0);
  } else {
    (function frame(now) {
      draw((now - start) / 1000);
      requestAnimationFrame(frame);
    }(performance.now()));
  }
}());
