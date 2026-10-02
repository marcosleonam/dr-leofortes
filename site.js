/* ==========================================================================
   Dr. Leonardo Fortes — Nexus Cyber
   ⚠️ A CONFIRMAR: o WhatsApp abaixo é o do Linktree dele ("Fortes e Fernandes"),
   que tem DDD 21. Se a clínica de Teresina tiver número 86, trocar aqui.
   ========================================================================== */
const CONFIG = {
  whatsapp: "5521994377555",
  mensagem: "Olá, Dr. Leonardo! Vim pelo site e gostaria de agendar uma consulta.",
};
const waLink = m => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(m || CONFIG.mensagem)}`;
document.querySelectorAll("[data-wa]").forEach(a => { a.href = waLink(a.dataset.wa || ""); a.target = "_blank"; a.rel = "noopener"; });

/* formulário do CTA → WhatsApp com nome */
document.getElementById("cta-form").addEventListener("submit", e => {
  e.preventDefault();
  const nome = document.getElementById("cta-nome").value.trim();
  window.open(waLink(`Olá, Dr. Leonardo! Meu nome é ${nome}. Vim pelo site e gostaria de agendar uma consulta.`), "_blank");
});

/* FAQ em formato terminal */
const FAQ = [
  ["Faz bioimpedância na consulta?", "Sim. A bioimpedância é feita no consultório e mostra gordura, massa magra e água corporal. Ela vira a linha de base para acompanhar sua evolução a cada retorno."],
  ["Preciso levar exames?", "Leve os exames que você já tiver, mesmo os antigos. Na consulta o Dr. Leonardo avalia o que existe e pede o que estiver faltando."],
  ["Trata emagrecimento?", "Sim, com acompanhamento médico e foco em perder gordura preservando massa magra. O plano considera exames, rotina, sono e treino."],
  ["Atende plano de saúde?", "Fale pelo WhatsApp para confirmar as formas de atendimento, valores e convênios disponíveis."],
  ["Como agendar?", "Pelo WhatsApp. Toque em qualquer botão “Agendar” desta página e a mensagem já vai pronta."],
];
const list = document.getElementById("faq-list"), ans = document.getElementById("faq-answer");
let typer = null;
const type = txt => { clearInterval(typer); ans.textContent = ""; let i = 0;
  typer = setInterval(() => { ans.textContent = txt.slice(0, ++i); if (i >= txt.length) clearInterval(typer); }, 12); };
FAQ.forEach(([q, a], i) => {
  const b = document.createElement("button"); b.className = "faq-btn" + (i === 0 ? " on" : "");
  b.innerHTML = `<span>${q}</span><iconify-icon icon="solar:alt-arrow-right-linear" class="w-4 h-4 shrink-0"></iconify-icon>`;
  b.addEventListener("click", () => { list.querySelectorAll(".faq-btn").forEach(x => x.classList.remove("on")); b.classList.add("on"); type(a); });
  list.appendChild(b);
});
ans.textContent = FAQ[0][1];

/* barra de WhatsApp no celular */
const bar = document.getElementById("wa-bar");
addEventListener("scroll", () => bar.classList.toggle("on", scrollY > innerHeight * 0.7), { passive: true });

/* ---------- WebGL: feixe de laser + fumaça (original do Nexus) ---------- */
const canvas = document.getElementById("webgl-canvas");
const gl = canvas.getContext("webgl");
if (gl) {
  const resize = () => { canvas.width = innerWidth; canvas.height = innerHeight; gl.viewport(0, 0, canvas.width, canvas.height); };
  addEventListener("resize", resize); resize();
  const vs = `attribute vec2 position; void main(){ gl_Position = vec4(position,0.0,1.0); }`;
  const fs = `precision highp float; uniform vec2 u_resolution; uniform float u_time;
    float random(vec2 st){ return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123); }
    float noise(vec2 st){ vec2 i=floor(st); vec2 f=fract(st); float a=random(i); float b=random(i+vec2(1.0,0.0)); float c=random(i+vec2(0.0,1.0)); float d=random(i+vec2(1.0,1.0)); vec2 u=f*f*(3.0-2.0*f); return mix(a,b,u.x)+(c-a)*u.y*(1.0-u.x)+(d-b)*u.x*u.y; }
    float fbm(vec2 st){ float v=0.0; float amp=0.5; for(int i=0;i<5;i++){ v+=amp*noise(st); st*=2.0; amp*=0.5; } return v; }
    void main(){ vec2 uv=gl_FragCoord.xy/u_resolution.xy; vec2 p=uv*2.0-1.0; p.x*=u_resolution.x/u_resolution.y;
      float beamX=-0.1; float dist=abs(p.x-beamX); float core=smoothstep(0.0,1.0,0.001/dist); float glow=0.02/(dist+0.05);
      vec2 sUV=vec2(p.x,p.y-u_time*0.1); float sn=fbm(sUV*3.0+vec2(u_time*0.05,0.0)); float smoke=sn*smoothstep(0.8,0.0,dist)*0.4;
      float pulse=sin(u_time*2.0)*0.1+0.9; vec3 beamColor=vec3(1.0,0.54,0.12); vec3 smokeColor=vec3(0.85,0.32,0.05);
      vec3 col=core*vec3(1.0)+glow*beamColor*pulse+smoke*smokeColor; float edge=smoothstep(1.0,0.4,abs(p.x))*smoothstep(1.0,0.2,abs(p.y));
      gl_FragColor=vec4(col*edge,1.0); }`;
  const sh = (src, t) => { const s = gl.createShader(t); gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const pr = gl.createProgram(); gl.attachShader(pr, sh(vs, gl.VERTEX_SHADER)); gl.attachShader(pr, sh(fs, gl.FRAGMENT_SHADER)); gl.linkProgram(pr);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, "position"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  gl.useProgram(pr);
  const tL = gl.getUniformLocation(pr, "u_time"), rL = gl.getUniformLocation(pr, "u_resolution"); const t0 = performance.now();
  (function render(){ gl.uniform1f(tL, (performance.now() - t0) / 1000); gl.uniform2f(rL, canvas.width, canvas.height); gl.drawArrays(gl.TRIANGLES, 0, 6); requestAnimationFrame(render); })();
}

/* ---------- Sequência de boot (GSAP) + cards lanterna + reveal ---------- */
document.addEventListener("DOMContentLoaded", () => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce) {
    gsap.set("#bg-orange-bottom", { xPercent: -100, yPercent: 100 });
    gsap.set("#bg-darkorange-bottom", { xPercent: -100, yPercent: 100 });
    gsap.set("#bg-orange-topleft", { xPercent: -100 });
    gsap.set("#top-accent", { opacity: 0, y: -20 });
    gsap.set("#pre-title", { opacity: 0, letterSpacing: "0.5em" });
    gsap.set("#title-text", { opacity: 0, scale: 1.1, filter: "blur(10px)" });
    gsap.set("#hero-visual", { opacity: 0, x: 40 });
    gsap.timeline({ defaults: { ease: "power3.out" } })
      .to("#bg-orange-topleft", { xPercent: 0, duration: 1.2 })
      .to("#bg-orange-bottom", { xPercent: 0, yPercent: 0, duration: 1.5 }, "-=1.0")
      .to("#bg-darkorange-bottom", { xPercent: 0, yPercent: 0, duration: 1.5 }, "-=1.2")
      .to("#hero-visual", { opacity: 1, x: 0, duration: 1.2 }, "-=1.1")
      .to("#top-accent", { opacity: 1, y: 0, duration: 0.8 }, "-=0.6")
      .to("#pre-title", { opacity: 1, letterSpacing: "0.1em", duration: 1 }, "-=0.4")
      .to("#title-text", { opacity: 1, scale: 1, filter: "blur(0px)", duration: 1.5, ease: "expo.out" }, "-=0.2");
  }
  document.querySelectorAll(".glow-card").forEach(card => card.addEventListener("mousemove", e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mouse-x", `${e.clientX - r.left}px`); card.style.setProperty("--mouse-y", `${e.clientY - r.top}px`);
  }));
  const io = new IntersectionObserver(entries => { let d = 0;
    entries.forEach(en => { if (en.isIntersecting) { setTimeout(() => en.target.classList.add("active"), d); d += 100; io.unobserve(en.target); } });
  }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
  document.querySelectorAll(".reveal").forEach(el => io.observe(el));
});
