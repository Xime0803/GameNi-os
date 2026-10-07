import{p as c,X as b,B as u,a as d,s as h,A as y}from"./progressService-aJ7dJ4-q.js";class v{static trigger(e=3e3){if(typeof window>"u"||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;const a=document.createElement("div");a.style.position="fixed",a.style.top="0",a.style.left="0",a.style.width="100vw",a.style.height="100vh",a.style.pointerEvents="none",a.style.zIndex="9999",a.style.overflow="hidden",document.body.appendChild(a);const n=["#FF6B6B","#FFD93D","#6BCB77","#4D96FF","#B983FF","#FF8FA3"],o=55;for(let s=0;s<o;s++){const t=document.createElement("div"),i=Math.random()*12+8,l=Math.random()*100,f=n[Math.floor(Math.random()*n.length)],p=Math.random()*.5,m=Math.random()*2+1.8;t.style.position="absolute",t.style.top="-20px",t.style.left=`${l}vw`,t.style.width=`${i}px`,t.style.height=`${i*.8}px`,t.style.backgroundColor=f,t.style.borderRadius=Math.random()>.5?"50%":"3px",t.style.opacity="0.9",t.style.transform=`rotate(${Math.random()*360}deg)`,t.style.transition=`top ${m}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${p}s, transform ${m}s linear ${p}s, opacity ${m}s ease-in ${p}s`,a.appendChild(t),setTimeout(()=>{t.style.top="105vh",t.style.transform=`rotate(${Math.random()*1080-540}deg) translateX(${Math.random()*100-50}px)`,t.style.opacity="0"},50)}setTimeout(()=>{a.remove()},e+800)}}const g={pomni:{id:"pomni",name:"Pomni",role:"Bufón ansiosa y protagonista",species:"Mono",soundEffect:"¡Uh-uh ah-ah!",synthesizedFreq:480,primaryColor:"#00C4B4",avatarEmoji:"🐒",bio:"Ágil y expresiva, aprende a calmarse contando objetos del circo."},jax:{id:"jax",name:"Jax",role:"Conejo malabarista y travieso",species:"Conejo",soundEffect:"¡Boing!",synthesizedFreq:620,primaryColor:"#A855F7",avatarEmoji:"🐰",bio:"Alto y veloz, le fascina jugar con números y esconderse entre las ramas."},ragatha:{id:"ragatha",name:"Ragatha",role:"Muñeca de trapo optimista",species:"Leona",soundEffect:"¡Grrr dulce!",synthesizedFreq:330,primaryColor:"#F97316",avatarEmoji:"🦁",bio:"Cariñosa y paciente, ayuda con las primeras vocales y rimas."},gangle:{id:"gangle",name:"Gangle",role:"Acróbata sensible con máscaras",species:"Rana",soundEffect:"¡Croac!",synthesizedFreq:260,primaryColor:"#22C55E",avatarEmoji:"🐸",bio:"Tímida pero muy alegre cuando salta sobre nenúfares y letras."},kinger:{id:"kinger",name:"Kinger",role:"Pieza de ajedrez rey sabio",species:"Elefante",soundEffect:"¡Fruuuut!",synthesizedFreq:190,primaryColor:"#EAB308",avatarEmoji:"🐘",bio:"Guarda tesoros de memoria y ayuda a recordar amigos y formas."},zooble:{id:"zooble",name:"Zooble",role:"Constructora geométrica",species:"Abeja",soundEffect:"¡Bzzzz!",synthesizedFreq:520,primaryColor:"#EC4899",avatarEmoji:"🐝",bio:"Arma secuencias y patrones lógicos con bloques de colores."},caine:{id:"caine",name:"Caine",role:"Maestro de ceremonias excéntrico",species:"Tucán",soundEffect:"¡Cua-cua!",synthesizedFreq:750,primaryColor:"#EF4444",avatarEmoji:"🦜",bio:"Presenta el gran show y reconoce los más asombrosos sonidos de la naturaleza."},bubble:{id:"bubble",name:"Bubble",role:"Asistente de burbujas",species:"Tortuga",soundEffect:"¡Glup!",synthesizedFreq:400,primaryColor:"#06B6D4",avatarEmoji:"🐢",bio:"Llena la pista de burbujas sonoras que explotan de alegría."},kaufmo:{id:"kaufmo",name:"Kaufmo",role:"Payaso de las risas sorpresas",species:"Oso",soundEffect:"¡Grrr jojo!",synthesizedFreq:220,primaryColor:"#F59E0B",avatarEmoji:"🐻",bio:"Desbloqueable especial que premia la constancia."},queenie:{id:"queenie",name:"Queenie",role:"Reina de las estrellas",species:"Cisne",soundEffect:"¡Flap flap!",synthesizedFreq:680,primaryColor:"#8B5CF6",avatarEmoji:"🦢",bio:"Guarda la constelación de medallas del gran circo."}};class x{async getRewards(){return await c.getRewardState()}getCircusStageDetails(e){return[{title:"Carpa Base del Circo",description:"La carpa roja y blanca recién montada en la pradera.",decorations:["🎪 Carpa clásica"]},{title:"Circo con Banderines Coloridos",description:"Banderines y guirnaldas ondeando alegremente al viento.",decorations:["🎪 Carpa clásica","🎏 Banderines multicolores"]},{title:"Circo Iluminado con Guirnaldas de Luces",description:"Faroles mágicos y destellos dorados brillando en el atardecer.",decorations:["🎪 Carpa clásica","🎏 Banderines","💡 Luces festivas"]},{title:"Circo con Gradas y Público Familiar",description:"Los animalitos de la selva y las familias aplauden con entusiasmo.",decorations:["🎪 Carpa clásica","🎏 Banderines","💡 Luces festivas","👥 Público alegre"]},{title:"¡Gran Circo Estelar de Ximenita!",description:"Fuegos artificiales, pista dorada y ovación completa.",decorations:["🎪 Carpa clásica","🎏 Banderines","💡 Luces festivas","👥 Público alegre","🎆 Fuegos artificiales"]}][Math.min(5,Math.max(1,e))-1]}}const C=new x;class E{container;games;onSelectGame;ximenita;constructor(e,a){this.games=e,this.onSelectGame=a,this.container=document.createElement("div"),this.container.className="map-screen-container",this.ximenita=new b("default")}async render(e){e.innerHTML="";const a=await c.getRewardState(),n=C.getCircusStageDetails(a.circusStageLevel);this.container.innerHTML=`
      <div class="circus-map-wrapper">
        <!-- Encabezado del Circo -->
        <div class="circus-banner">
          <div class="circus-tent-badge">
            <span class="tent-icon">🎪</span>
            <div class="tent-text">
              <h2>${n.title}</h2>
              <p>${n.description}</p>
            </div>
          </div>
          <div class="circus-decorations">
            ${n.decorations.map(t=>`<span class="dec-tag">${t}</span>`).join(" ")}
          </div>
        </div>

        <!-- Cuadrícula de Atracciones del Circo (Los 10 Mini-Juegos) -->
        <div class="attractions-grid" role="region" aria-label="Atracciones del Circo">
          ${this.games.map(t=>{const i=g[t.config.characterId]||g.pomni,l=this.emojiForGame(t.config.id);return`
                <div class="attraction-card" data-game-id="${t.config.id}" tabindex="0" role="button" aria-label="${t.config.title}, área de ${t.config.area}. Con ${i.name} el ${i.species}">
                  <div class="attraction-character-badge" style="background-color: ${i.primaryColor}22; border-color: ${i.primaryColor}">
                    <span class="char-avatar">${i.avatarEmoji}</span>
                    <span class="char-name">${i.name}</span>
                  </div>
                  <div class="attraction-icon-circle">
                    <span class="attraction-emoji">${l}</span>
                  </div>
                  <h3 class="attraction-title">${t.config.title}</h3>
                  <span class="attraction-area-pill area-${this.normalizeArea(t.config.area)}">${t.config.area}</span>
                  <p class="attraction-desc">${t.config.instruction}</p>
                </div>
              `}).join("")}
        </div>

        <!-- Área de Ximenita -->
        <div class="map-ximenita-anchor"></div>
      </div>
    `,this.container.querySelectorAll(".attraction-card").forEach(t=>{t.addEventListener("click",()=>{const i=t.getAttribute("data-game-id");i&&this.onSelectGame(i)}),t.addEventListener("keydown",i=>{if(i.key==="Enter"||i.key===" "){const l=t.getAttribute("data-game-id");l&&this.onSelectGame(l)}})});const s=this.container.querySelector(".map-ximenita-anchor");s&&s.appendChild(this.ximenita.getElement()),e.appendChild(this.container),this.injectStylesOnce(),setTimeout(()=>{this.ximenita.narrate("¡Hola! Soy Ximenita. ¡Bienvenida y bienvenido a nuestro gran circo! Toca cualquier juego para divertirte y aprender con nuestros amigos animales.")},450)}emojiForGame(e){return{"01-cuenta-con-pomni":"🍌","02-numeros-del-bosque":"🌲","03-traza-los-numeros":"✍️","04-vocales-animales":"🔤","05-traza-las-vocales":"🎨","06-memoria-animal":"🃏","07-sumas-de-la-selva":"➕","08-patrones-animales":"🚂","09-donde-vive":"🏞️","10-sonidos-animales":"🎶"}[e]||"🎪"}normalizeArea(e){return e.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g,"-")}injectStylesOnce(){if(document.getElementById("map-screen-styles"))return;const e=document.createElement("style");e.id="map-screen-styles",e.textContent=`
      .map-screen-container {
        width: 100%;
        height: 100%;
        overflow-y: auto;
        padding: 16px 24px 100px;
        position: relative;
      }

      .circus-map-wrapper {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .circus-banner {
        background: #FFFFFFEE;
        border-radius: var(--radius-lg);
        padding: 18px 26px;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        border: 4px solid var(--color-sun);
        box-shadow: var(--shadow-md);
      }

      .circus-tent-badge {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .tent-icon {
        font-size: 52px;
        animation: pulseGentle 3s infinite ease-in-out;
      }

      .tent-text h2 {
        font-size: 26px;
        color: #B45309;
      }

      .tent-text p {
        font-size: 16px;
        color: #4B5563;
      }

      .circus-decorations {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .dec-tag {
        background: #FEF3C7;
        color: #92400E;
        padding: 6px 14px;
        border-radius: var(--radius-full);
        font-size: 15px;
        font-weight: 700;
      }

      .attractions-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 20px;
      }

      .attraction-card {
        background: #FFFFFFEE;
        border-radius: var(--radius-lg);
        padding: 22px 18px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        box-shadow: var(--shadow-bounce);
        cursor: pointer;
        transition: transform var(--transition-fast), box-shadow var(--transition-fast);
        border: 4px solid #F1F5F9;
        position: relative;
        overflow: hidden;
      }

      .attraction-card:hover, .attraction-card:focus-visible {
        transform: translateY(-8px) scale(1.02);
        box-shadow: var(--shadow-lg);
        border-color: var(--color-sky);
      }

      .attraction-card:active {
        transform: translateY(2px);
      }

      .attraction-character-badge {
        position: absolute;
        top: 12px;
        left: 12px;
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 4px 10px;
        border-radius: var(--radius-full);
        border-width: 2px;
        border-style: solid;
        font-size: 13px;
        font-weight: 700;
      }

      .attraction-icon-circle {
        width: 88px;
        height: 88px;
        border-radius: 50%;
        background: linear-gradient(135deg, #FFF9F0, #E8F4FF);
        border: 4px solid var(--color-coral);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 16px;
        margin-bottom: 12px;
        box-shadow: var(--shadow-sm);
      }

      .attraction-emoji {
        font-size: 44px;
      }

      .attraction-title {
        font-size: 22px;
        color: #1F2937;
        margin-bottom: 8px;
      }

      .attraction-area-pill {
        display: inline-block;
        padding: 4px 14px;
        border-radius: var(--radius-full);
        font-size: 13px;
        font-weight: 800;
        text-transform: uppercase;
        margin-bottom: 8px;
      }

      .area-numeros { background: #E0F2FE; color: #0369A1; }
      .area-escritura { background: #FEF3C7; color: #B45309; }
      .area-logica { background: #F3E8FF; color: #7E22CE; }
      .area-vocabulario-y-logica, .area-vocabulario { background: #DCFCE7; color: #15803D; }

      .attraction-desc {
        font-size: 15px;
        color: #4B5563;
        line-height: 1.35;
      }

      .map-ximenita-anchor {
        position: fixed;
        bottom: 16px;
        left: 24px;
        pointer-events: none;
      }
    `,document.head.appendChild(e)}}class w{element;starCountSpan;profileBadgeSpan;muteBtn;constructor(e={}){this.element=document.createElement("header"),this.element.className="top-bar";const a=document.createElement("div");if(a.className="top-bar-left",e.showMapButton!==!1&&e.onBackToMap){const t=new u({icon:"🎪",text:"Circo",color:"sky",ariaLabel:"Volver a la carpa del circo",onClick:()=>e.onBackToMap()});a.appendChild(t.getElement())}this.profileBadgeSpan=document.createElement("div"),this.profileBadgeSpan.className="timer-badge pulse-gentle",this.profileBadgeSpan.textContent="👤 ...",a.appendChild(this.profileBadgeSpan);const n=document.createElement("div");n.className="star-counter",n.setAttribute("aria-label","Estrellas acumuladas"),n.innerHTML="⭐ ",this.starCountSpan=document.createElement("span"),this.starCountSpan.textContent="0",n.appendChild(this.starCountSpan);const o=document.createElement("div");o.className="top-bar-right",this.muteBtn=new u({icon:"🔊",color:"sun",ariaLabel:"Silenciar o activar sonidos",onClick:()=>this.toggleSound()}),o.appendChild(this.muteBtn.getElement());const s=new u({icon:"🔒",text:"Adultos",color:"lavender",ariaLabel:"Abrir panel de padres y maestros",onClick:()=>{window.location.href="./panel.html"}});o.appendChild(s.getElement()),this.element.appendChild(a),this.element.appendChild(n),this.element.appendChild(o),this.refresh()}getElement(){return this.element}async refresh(){const e=await c.getRewardState();this.starCountSpan.textContent=e.totalStars.toString();const a=await c.getActiveProfile();this.profileBadgeSpan.textContent=`${a.avatar} ${a.name}`}toggleSound(){const a=!d.getMuted();d.setMuted(a),h.setMuted(a),this.muteBtn.getElement().querySelector(".btn-icon").textContent=a?"🔇":"🔊"}}class F{rootElement;starBar;mapScreen;games=new Map;currentGame=null;contentContainer;constructor(e,a){this.rootElement=e,this.rootElement.innerHTML="",a.forEach(n=>this.games.set(n.config.id,n)),this.starBar=new w({showMapButton:!1,onBackToMap:()=>this.showMap()}),this.rootElement.appendChild(this.starBar.getElement()),this.contentContainer=document.createElement("main"),this.contentContainer.className="scene-content-area",this.contentContainer.style.flex="1",this.contentContainer.style.overflow="hidden",this.contentContainer.style.position="relative",this.rootElement.appendChild(this.contentContainer),this.mapScreen=new E(a,n=>this.launchGame(n))}showMap(){this.currentGame&&(this.currentGame.unmount(),this.currentGame=null),this.starBar.refresh(),this.mapScreen.render(this.contentContainer)}async launchGame(e){const a=this.games.get(e);if(!a){console.warn(`Juego no encontrado: ${e}`);return}this.currentGame&&this.currentGame.unmount(),this.currentGame=a,this.contentContainer.innerHTML="";const n=document.createElement("div");n.className="game-scene-wrapper",n.style.width="100%",n.style.height="100%",n.style.position="relative",this.contentContainer.appendChild(n),await a.mount(n,o=>this.handleGameComplete(o))}async handleGameComplete(e){await c.record({gameId:e.gameId,level:e.finalLevel,hits:e.hits,misses:e.misses,timeMs:e.timeSpentMs,finishedAt:Date.now(),skillWorked:e.skillWorked,area:e.area}),d.playCheer(),d.playStar(),v.trigger(3500);const a=document.createElement("div");a.className="celebration-modal-overlay",a.innerHTML=`
      <div class="celebration-card">
        <div class="celebration-stars">⭐⭐⭐</div>
        <h2>¡Lo lograste!</h2>
        <p class="celebration-subtitle">¡Completaste esta ronda del circo!</p>
        <div class="celebration-stats">
          <div class="stat-pill">🎯 Aciertos: <strong>${e.hits}</strong></div>
          <div class="stat-pill">🏆 Nivel: <strong>${e.finalLevel}</strong></div>
        </div>
        <button class="btn-big btn-sun btn-continue pulse-gentle">
          🎪 ¡Volver al Circo!
        </button>
      </div>
    `,document.body.appendChild(a);const n=new b("default"),o=a.querySelector(".celebration-card");o&&o.insertBefore(n.getElement(),o.querySelector(".btn-continue")),n.celebrate("¡Excelente trabajo! ¡Ganaste una estrella dorada!"),a.querySelector(".btn-continue")?.addEventListener("click",()=>{d.playClick(),a.remove(),this.showMap()}),this.injectModalStylesOnce()}injectModalStylesOnce(){if(document.getElementById("celebration-modal-styles"))return;const e=document.createElement("style");e.id="celebration-modal-styles",e.textContent=`
      .celebration-modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.7);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99999;
        animation: fadeIn 0.3s ease;
      }

      .celebration-card {
        background: #FFFFFF;
        border-radius: var(--radius-lg);
        padding: 36px 40px;
        max-width: 480px;
        width: 90%;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        border: 6px solid var(--color-sun);
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
      }

      .celebration-stars {
        font-size: 54px;
        margin-bottom: 8px;
        animation: pulseGentle 1.5s infinite;
      }

      .celebration-card h2 {
        font-size: 34px;
        color: #B45309;
        margin-bottom: 8px;
      }

      .celebration-subtitle {
        font-size: 20px;
        color: #4B5563;
        margin-bottom: 20px;
      }

      .celebration-stats {
        display: flex;
        gap: 16px;
        margin-bottom: 24px;
      }

      .stat-pill {
        background: #FEF3C7;
        color: #92400E;
        padding: 8px 18px;
        border-radius: var(--radius-full);
        font-size: 18px;
        font-weight: 700;
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `,document.head.appendChild(e)}}document.addEventListener("DOMContentLoaded",async()=>{const r=document.getElementById("app");if(!r)return;const e=await c.getSettings();if(h.setSpeed(e.voiceSpeed),e.musicEnabled){const n=()=>{d.startBackgroundMusic(),window.removeEventListener("pointerdown",n)};window.addEventListener("pointerdown",n)}new F(r,y).showMap(),setInterval(async()=>{const o=(await c.getSettings()).dailyTimeLimitMinutes;o>0&&await c.getUsageTimeTodayMs()>=o*60*1e3&&B()},3e4)});function B(){if(document.getElementById("time-limit-modal"))return;const r=document.createElement("div");r.id="time-limit-modal",r.className="celebration-modal-overlay",r.innerHTML=`
    <div class="celebration-card" style="border-color: var(--color-sky);">
      <div style="font-size: 50px;">🌅 🧸</div>
      <h2 style="color: #0369A1; margin-top: 10px;">¡Tiempo de jugar en casa!</h2>
      <p style="font-size: 18px; color: #4B5563; margin: 16px 0;">
        ¡Hiciste un trabajo increíble hoy en el circo! Es momento de descansar los ojitos, abrazar a mamá o papá y jugar con tus juguetes.
      </p>
      <button id="btn-limit-close" class="btn-big btn-sky pulse-gentle">
        ¡Hasta mañana, circo!
      </button>
    </div>
  `,document.body.appendChild(r),h.speak("¡Gran trabajo por hoy! Cumpliste tu tiempo de juego. Es momento de descansar y jugar con tu familia."),document.getElementById("btn-limit-close")?.addEventListener("click",()=>{r.remove()})}
