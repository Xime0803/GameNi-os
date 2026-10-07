import{p,A as f,s as x}from"./progressService-aJ7dJ4-q.js";class y{static calculateCNEBReports(e){const a={cantidad:{competency:"Resuelve problemas de cantidad (Conteo y sumas)",cycle:"Ciclo II (3-6 años) y Ciclo III (7-8 años)",games:["01-cuenta-con-pomni","02-numeros-del-bosque","07-sumas-de-la-selva"]},forma:{competency:"Resuelve problemas de forma y localización (Trazado numérico)",cycle:"Ciclo II Inicial",games:["03-traza-los-numeros"]},comunicacion:{competency:"Se comunica oralmente y escribe diversos tipos de textos (Vocales y trazo)",cycle:"Ciclo II Inicial y Ciclo III Primaria",games:["04-vocales-animales","05-traza-las-vocales","10-sonidos-animales"]},logicaCiencia:{competency:"Indaga mediante métodos científicos y pensamiento lógico (Hábitats y patrones)",cycle:"Ciclo II Inicial",games:["06-memoria-animal","08-patrones-animales","09-donde-vive"]}},s={};for(const[d,o]of Object.entries(a)){const r=e.filter(m=>o.games.includes(m.gameId));if(r.length===0){s[d]={competency:o.competency,cnebCycle:o.cycle,masteryPercentage:0,level:"C",levelDescription:"En Inicio (Aún sin actividades registradas)",totalActivities:0,accuracy:0};continue}let c=0,l=0,t=0;r.forEach(m=>{c+=m.hits,l+=m.misses,t+=m.level});const i=c+l,n=i>0?c/i*100:0,b=t/r.length,g=Math.min(100,Math.round(n*.6+b/5*40));let v="C",h="En Inicio";g>=85?(v="AD",h="Logro Destacado"):g>=65?(v="A",h="Logro Esperado"):g>=40&&(v="B",h="En Proceso"),s[d]={competency:o.competency,cnebCycle:o.cycle,masteryPercentage:g,level:v,levelDescription:h,totalActivities:r.length,accuracy:Math.round(n)}}return s}static generatePedagogicalRecommendations(e){const a=[],s=e.filter(t=>["03-traza-los-numeros","05-traza-las-vocales"].includes(t.gameId)),d=s.reduce((t,i)=>t+i.misses,0),o=s.reduce((t,i)=>t+i.hits,0);s.length>0&&d/Math.max(1,o+d)>.3&&a.push({id:"rec-trazado",area:"Escritura y Grafomotricidad",priority:"alta",title:"Refuerzo de direccionalidad y motricidad fina",observation:"Se detectaron retrocesos o desvíos frecuentes en la trayectoria guiada del dedo.",homeActivity:"Practicar trazos con el dedo índice sobre bandejas con harina o sémola antes de la pantalla.",classroomTip:"Brindar ejercicios vivenciales en el suelo caminando sobre líneas curvas y rectas con tiza."});const r=e.filter(t=>t.gameId==="07-sumas-de-la-selva"),c=r.reduce((t,i)=>t+i.misses,0);r.length>0&&c>=3&&a.push({id:"rec-sumas",area:"Matemática (Cantidad)",priority:"alta",title:"Consolidación del conteo concreto (Enfoque CPA)",observation:"Presenta dificultad al combinar dos conjuntos numéricos simultáneamente.",homeActivity:"Utilizar semillas, botones o tapitas para juntar grupos de 3 y 4 elementos en platos separados.",classroomTip:"Trabajar con material concreto estructurado (regletas de Cuisenaire o fichas de dos colores)."});const l=e.filter(t=>t.gameId==="04-vocales-animales");return l.length>0&&l.some(t=>t.misses>2)&&a.push({id:"rec-vocales",area:"Comunicación Oral",priority:"media",title:"Estimulación de discriminación auditiva fonológica",observation:"Confusión ocasional entre sonidos vocálicos iniciales abiertos y cerrados.",homeActivity:'Jugar a "Veo veo una cosita que empieza con..." exagerando la boca frente a un espejo.',classroomTip:"Rimas cortas infantiles y palmadas fonémicas al inicio de palabras cotidianas."}),a.length===0&&a.push({id:"rec-positiva",area:"Desarrollo Integral",priority:"positiva",title:"¡Excelente progreso y constancia lúdica!",observation:"El estudiante demuestra alta atención, persistencia y fluidez en todas las áreas exploradas.",homeActivity:"Celebrar los logros alcanzados e invitar a contar objetos durante las compras o paseos.",classroomTip:"Proponerle retos de mayor autonomía o ser guía de sus pares en actividades grupales."}),a}static calculateClassroomMetrics(e,a=24){const s=e.length>0?e.map(n=>Math.min(100,Math.round(n.hits/Math.max(1,n.hits+n.misses)*100))):[45,60,72,85,90,68,75,82];s.sort((n,b)=>n-b);const d=s[Math.floor(s.length*.25)]||50,o=s[Math.floor(s.length*.5)]||70,r=s[Math.floor(s.length*.75)]||85;let c=0,l=0,t=0,i=0;return s.forEach(n=>{n>=85?i++:n>=65?t++:n>=40?l++:c++}),{totalStudents:a,medianMastery:o,percentile25:d,percentile75:r,distribution:{inicio:Math.round(c/s.length*100),proceso:Math.round(l/s.length*100),logrado:Math.round(t/s.length*100),destacado:Math.round(i/s.length*100)}}}}class E{container;currentTab="overview";activeProfile=null;profilesList=[];progressEntries=[];settings=null;isDarkMode=!1;constructor(e){this.container=e}async init(){this.isDarkMode=localStorage.getItem("ximenita_dark_mode")==="true",this.isDarkMode&&document.body.classList.add("dark-mode"),await this.refreshData(),this.render()}async refreshData(){this.profilesList=await p.getProfiles(),this.activeProfile=await p.getActiveProfile(),this.progressEntries=await p.getAll(this.activeProfile.id),this.settings=await p.getSettings()}render(){!this.activeProfile||!this.settings||(this.container.innerHTML=`
      <div class="panel-container">
        <!-- Encabezado del Panel Adulto -->
        <header class="panel-header">
          <div class="panel-title">
            <h1>Panel Pedagógico para Familias y Docentes</h1>
            <p>Monitoreo formativo alineado al Currículo Nacional de la Educación Básica (CNEB)</p>
          </div>

          <div class="panel-header-controls">
            <!-- Selector de Perfil -->
            <div class="profile-selector-box" title="Seleccionar perfil del estudiante">
              <span>👤 Perfil:</span>
              <select id="profile-select-dropdown" aria-label="Seleccionar perfil de estudiante">
                ${this.profilesList.map(e=>`<option value="${e.id}" ${e.id===this.activeProfile?.id?"selected":""}>
                        ${e.name} (${e.ageGroup==="inicial"?"3-6 años":"7-10 años"})
                      </option>`).join("")}
              </select>
            </div>

            <button id="add-profile-btn" class="theme-toggle-btn" title="Crear nuevo perfil">+ Nuevo</button>

            <!-- Modo Oscuro -->
            <button id="theme-toggle-btn" class="theme-toggle-btn" aria-label="Alternar modo oscuro">
              ${this.isDarkMode?"☀️ Modo Claro":"🌙 Modo Oscuro"}
            </button>

            <!-- Enlace al Juego -->
            <a href="./index.html" class="gate-btn gate-btn-primary" style="text-decoration: none;">🎪 Volver al Circo</a>
          </div>
        </header>

        <!-- Navegación por Pestañas -->
        <nav class="panel-nav" role="tablist">
          <button class="panel-nav-btn ${this.currentTab==="overview"?"active":""}" data-tab="overview" role="tab">
            📊 Resumen y Tiempo
          </button>
          <button class="panel-nav-btn ${this.currentTab==="cneb"?"active":""}" data-tab="cneb" role="tab">
            🎓 Competencias CNEB
          </button>
          <button class="panel-nav-btn ${this.currentTab==="games"?"active":""}" data-tab="games" role="tab">
            🎮 Detalle por Juego
          </button>
          <button class="panel-nav-btn ${this.currentTab==="recs"?"active":""}" data-tab="recs" role="tab">
            💡 Recomendaciones Pedagógicas
          </button>
          <button class="panel-nav-btn ${this.currentTab==="classroom"?"active":""}" data-tab="classroom" role="tab">
            🏫 Modo Aula (Docentes)
          </button>
          <button class="panel-nav-btn ${this.currentTab==="settings"?"active":""}" data-tab="settings" role="tab">
            ⚙️ Ajustes y Privacidad
          </button>
          <button class="panel-nav-btn ${this.currentTab==="about"?"active":""}" data-tab="about" role="tab">
            📜 Acerca de y Legal
          </button>
        </nav>

        <!-- Contenido de la Pestaña Activa -->
        <main class="panel-tab-content">
          ${this.renderActiveTabContent()}
        </main>
      </div>
    `,this.bindEvents())}renderActiveTabContent(){switch(this.currentTab){case"overview":return this.renderOverviewTab();case"cneb":return this.renderCnebTab();case"games":return this.renderGamesDetailTab();case"recs":return this.renderRecommendationsTab();case"classroom":return this.renderClassroomTab();case"settings":return this.renderSettingsTab();case"about":return this.renderAboutTab();default:return"<p>Pestaña no encontrada.</p>"}}renderOverviewTab(){const e=this.progressEntries.reduce((c,l)=>c+(l.timeMs||0),0),a=Math.round(e/6e4),s=this.progressEntries.reduce((c,l)=>c+l.hits,0),d=this.progressEntries.reduce((c,l)=>c+l.misses,0),o=s+d,r=o>0?Math.round(s/o*100):0;return`
      <div class="metric-grid">
        <div class="metric-card">
          <div class="metric-label">Tiempo Total de Juego</div>
          <div class="metric-value">${a} min</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Actividades Completadas</div>
          <div class="metric-value">${this.progressEntries.length}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Precisión Promedio</div>
          <div class="metric-value" style="color: #16A34A;">${r}%</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Límite Diario Asignado</div>
          <div class="metric-value">${this.settings?.dailyTimeLimitMinutes||20} min</div>
        </div>
      </div>

      <div class="panel-card">
        <h3>Hábitos de Uso y Bienestar Digital</h3>
        <p style="color: var(--panel-text-secondary); margin-top: 6px; font-size: 14px;">
          Se recomienda que las sesiones de juego no superen los 20-30 minutos continuos para cuidar la agudeza visual y promover la motricidad gruesa al aire libre.
        </p>
      </div>
    `}renderCnebTab(){const e=y.calculateCNEBReports(this.progressEntries);return`
      <div class="panel-card">
        <h3>Evaluación Formativa según Currículo Nacional (CNEB)</h3>
        <p style="color: var(--panel-text-secondary); margin-bottom: 20px; font-size: 14px;">
          Nivel de logro adaptativo evaluado en los ciclos II (Inicial) y III/IV (Primaria):
        </p>

        ${Object.values(e).map(a=>`
            <div class="competency-card">
              <div class="competency-header">
                <div>
                  <div class="competency-title">${a.competency}</div>
                  <div class="competency-cycle">${a.cnebCycle} • ${a.totalActivities} actividades realizadas</div>
                </div>
                <span class="cneb-badge badge-${a.level.toLowerCase()}">
                  ${a.level} - ${a.levelDescription}
                </span>
              </div>
              <div class="progress-bar-bg">
                <div class="progress-bar-fill" style="width: ${a.masteryPercentage}%; background: ${this.getColorForLevel(a.level)};"></div>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 13px; color: var(--panel-text-muted);">
                <span>Precisión: ${a.accuracy}%</span>
                <span>Dominio pedagógico: ${a.masteryPercentage}%</span>
              </div>
            </div>
          `).join("")}
      </div>
    `}getColorForLevel(e){switch(e){case"AD":return"#16A34A";case"A":return"#2563EB";case"B":return"#D97706";default:return"#94A3B8"}}renderGamesDetailTab(){return`
      <div class="panel-card">
        <h3>Desempeño Individualizado en los 10 Mini-Juegos</h3>
        <div class="table-responsive" style="margin-top: 16px;">
          <table class="panel-table">
            <thead>
              <tr>
                <th>Juego</th>
                <th>Área CNEB</th>
                <th>Nivel Máx.</th>
                <th>Aciertos</th>
                <th>Intentos</th>
                <th>Precisión</th>
                <th>Tiempo</th>
              </tr>
            </thead>
            <tbody>
              ${f.map(e=>{const a=this.progressEntries.filter(i=>i.gameId===e.config.id),s=a.reduce((i,n)=>Math.max(i,n.level),1),d=a.reduce((i,n)=>i+n.hits,0),o=a.reduce((i,n)=>i+n.misses,0),r=d+o,c=r>0?Math.round(d/r*100):0,l=a.reduce((i,n)=>i+(n.timeMs||0),0),t=Math.round(l/6e4);return`
                  <tr>
                    <td><strong>${e.config.title}</strong></td>
                    <td>${e.config.area}</td>
                    <td>${a.length>0?`Nivel ${s}`:"-"}</td>
                    <td>${d}</td>
                    <td>${r}</td>
                    <td>${r>0?`${c}%`:"Sin jugar"}</td>
                    <td>${t} min</td>
                  </tr>
                `}).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `}renderRecommendationsTab(){return`
      <div class="panel-card">
        <h3>Orientaciones Formativas para Familias y Docentes</h3>
        <p style="color: var(--panel-text-secondary); margin-bottom: 20px; font-size: 14px;">
          Sugerencias automáticas basadas en los patrones de respuesta y trazado del estudiante:
        </p>

        ${y.generatePedagogicalRecommendations(this.progressEntries).map(a=>`
            <div class="rec-card priority-${a.priority}">
              <div class="rec-title">${a.title} (${a.area})</div>
              <div class="rec-item"><strong>Observación:</strong> ${a.observation}</div>
              <div class="rec-item"><strong>Actividad recomendada en el hogar:</strong> ${a.homeActivity}</div>
              <div class="rec-item"><strong>Pauta pedagógica en el aula:</strong> ${a.classroomTip}</div>
            </div>
          `).join("")}
      </div>
    `}renderClassroomTab(){const e=y.calculateClassroomMetrics(this.progressEntries);return`
      <div class="panel-card">
        <h3>Visión Docente de Cohorte (Modo Aula Anónimo)</h3>
        <p style="color: var(--panel-text-secondary); margin-bottom: 20px; font-size: 14px;">
          Distribución estadística de percentiles sin individualización de nombres ni rankings competitivos (garantía de privacidad según Ley 29733):
        </p>

        <div class="cohort-grid">
          <div class="cohort-stat-box">
            <div class="cohort-stat-num">${e.percentile25}%</div>
            <div class="cohort-stat-label">Percentil 25 (P25)</div>
          </div>
          <div class="cohort-stat-box">
            <div class="cohort-stat-num" style="color: #16A34A;">${e.medianMastery}%</div>
            <div class="cohort-stat-label">Mediana del Grupo (P50)</div>
          </div>
          <div class="cohort-stat-box">
            <div class="cohort-stat-num" style="color: #2563EB;">${e.percentile75}%</div>
            <div class="cohort-stat-label">Percentil 75 (P75)</div>
          </div>
        </div>

        <h4 style="margin-top: 24px; margin-bottom: 12px;">Distribución Cualitativa de la Clase:</h4>
        <div style="display: flex; gap: 8px; height: 32px; border-radius: 8px; overflow: hidden; margin-bottom: 12px;">
          <div style="width: ${e.distribution.inicio}%; background: #94A3B8;" title="En Inicio: ${e.distribution.inicio}%"></div>
          <div style="width: ${e.distribution.proceso}%; background: #D97706;" title="En Proceso: ${e.distribution.proceso}%"></div>
          <div style="width: ${e.distribution.logrado}%; background: #2563EB;" title="Logrado: ${e.distribution.logrado}%"></div>
          <div style="width: ${e.distribution.destacado}%; background: #16A34A;" title="Destacado: ${e.distribution.destacado}%"></div>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 13px; color: var(--panel-text-secondary);">
          <span>En Inicio: ${e.distribution.inicio}%</span>
          <span>En Proceso: ${e.distribution.proceso}%</span>
          <span>Logro Esperado: ${e.distribution.logrado}%</span>
          <span>Destacado: ${e.distribution.destacado}%</span>
        </div>
      </div>
    `}renderSettingsTab(){return`
      <div class="panel-card">
        <h3>Configuración de la Experiencia Infantil</h3>

        <div class="settings-group" style="margin-top: 16px;">
          <div class="settings-field">
            <div class="settings-label">
              <h4>Velocidad de voz de Ximenita</h4>
              <p>Español peruano (es-PE) pausado y adaptado para atención infantil</p>
            </div>
            <div class="settings-control">
              <select id="voice-speed-select" aria-label="Velocidad de voz">
                <option value="normal" ${this.settings?.voiceSpeed==="normal"?"selected":""}>Normal (0.85)</option>
                <option value="lenta" ${this.settings?.voiceSpeed==="lenta"?"selected":""}>Lenta (0.70)</option>
                <option value="muy_lenta" ${this.settings?.voiceSpeed==="muy_lenta"?"selected":""}>Muy lenta (0.55)</option>
              </select>
            </div>
          </div>

          <div class="settings-field">
            <div class="settings-label">
              <h4>Límite de tiempo diario</h4>
              <p>Avisa al niño de forma cariñosa cuando se cumple el tiempo</p>
            </div>
            <div class="settings-control">
              <select id="time-limit-select" aria-label="Límite de tiempo diario">
                <option value="10" ${this.settings?.dailyTimeLimitMinutes===10?"selected":""}>10 minutos</option>
                <option value="20" ${this.settings?.dailyTimeLimitMinutes===20?"selected":""}>20 minutos (Recomendado)</option>
                <option value="30" ${this.settings?.dailyTimeLimitMinutes===30?"selected":""}>30 minutos</option>
                <option value="45" ${this.settings?.dailyTimeLimitMinutes===45?"selected":""}>45 minutos</option>
                <option value="0" ${this.settings?.dailyTimeLimitMinutes===0?"selected":""}>Sin límite</option>
              </select>
            </div>
          </div>

          <div class="settings-field">
            <div class="settings-label">
              <h4>Música ambiental circense</h4>
              <p>Síntesis armónica de fondo suave (desactivada por defecto)</p>
            </div>
            <div class="settings-control">
              <input type="checkbox" id="music-toggle-check" ${this.settings?.musicEnabled?"checked":""} style="width: 20px; height: 20px;" />
            </div>
          </div>

          <div class="settings-field">
            <div class="settings-label">
              <h4>Sincronización en la nube (Backend)</h4>
              <p>Exportación e importación de perfiles</p>
            </div>
            <div class="settings-control">
              <span style="font-size: 13px; color: var(--panel-text-muted);">Próximamente con backend seguro (Supabase/Firebase)</span>
            </div>
          </div>

          <div class="settings-field">
            <div class="settings-label">
              <h4 style="color: var(--panel-danger);">Reiniciar progreso del perfil actual</h4>
              <p>Elimina las estrellas y registros de este perfil de forma irreversible</p>
            </div>
            <div class="settings-control">
              <button id="reset-profile-btn" class="btn-danger">Reiniciar Datos</button>
            </div>
          </div>
        </div>
      </div>
    `}renderAboutTab(){return`
      <div class="panel-card legal-box">
        <h3>Declaración de Privacidad y Protección de Datos Infantiles</h3>
        <p>
          <strong>El Mundo de Ximenita</strong> ha sido desarrollado bajo el principio de <em>Privacidad por Diseño</em> (Privacy by Design), cumpliendo de manera estricta:
        </p>
        <ul>
          <li><strong>Ley Peruana N° 29733 (Ley de Protección de Datos Personales):</strong> No se solicita, recolecta ni almacena información personal identificable (PII) de los menores. Todo el historial pedagógico reside exclusivamente en el dispositivo local (LocalStorage del navegador).</li>
          <li><strong>COPPA (Children's Online Privacy Protection Act):</strong> Cero rastreo, cero cookies de terceros y ausencia absoluta de publicidad o analíticas externas.</li>
          <li><strong>GDPR-K (Reglamento General de Protección de Datos de la Unión Europea para menores):</strong> Perfiles completamente anónimos y portabilidad local de progreso.</li>
        </ul>

        <h3>Marco Pedagógico y Curricular CNEB</h3>
        <p>
          Las actividades y curvas de dificultad de los 10 mini-juegos responden a las competencias del <strong>Currículo Nacional de la Educación Básica (CNEB) del Perú</strong>, articulando de manera lúdica:
        </p>
        <ul>
          <li><strong>Área de Matemática:</strong> "Resuelve problemas de cantidad" y "Resuelve problemas de forma, movimiento y localización".</li>
          <li><strong>Área de Comunicación:</strong> "Se comunica oralmente en su lengua materna" y "Escribe diversos tipos de textos".</li>
          <li><strong>Área de Personal Social y Ciencia y Tecnología:</strong> "Indaga mediante métodos científicos" y autorregulación emocional frente al error sin estado de derrota.</li>
        </ul>

        <h3>Términos de Uso y Derechos de Autor</h3>
        <p>
          El software se distribuye con todos los derechos reservados para fines educativos. Los personajes animales están inspirados en conceptos circenses digitales fantásticos con adaptaciones faunísticas autóctonas e internacionales.
        </p>
        <p>
          <strong>Créditos de Audio y Gráficos:</strong> Efectos sonoros generados en tiempo real mediante Web Audio API y síntesis fonológica nativa del navegador. Ilustraciones vectoriales en SVG puro desarrolladas para El Mundo de Ximenita.
        </p>
      </div>
    `}bindEvents(){this.container.querySelectorAll(".panel-nav-btn").forEach(t=>{t.addEventListener("click",()=>{const i=t.getAttribute("data-tab");i&&(this.currentTab=i,this.render())})}),this.container.querySelector("#profile-select-dropdown")?.addEventListener("change",async t=>{const i=t.target.value;await p.setActiveProfile(i),await this.refreshData(),this.render()}),this.container.querySelector("#add-profile-btn")?.addEventListener("click",async()=>{const t=prompt("Ingrese el nombre o apodo del estudiante (ej. Sofía):");t&&t.trim()&&(await p.createProfile(t.trim(),"inicial"),await this.refreshData(),this.render())}),this.container.querySelector("#theme-toggle-btn")?.addEventListener("click",()=>{this.isDarkMode=!this.isDarkMode,document.body.classList.toggle("dark-mode",this.isDarkMode),localStorage.setItem("ximenita_dark_mode",this.isDarkMode?"true":"false"),this.render()});const o=this.container.querySelector("#voice-speed-select");o?.addEventListener("change",async()=>{const t=o.value;x.setSpeed(t),await p.updateSettings({voiceSpeed:t})});const r=this.container.querySelector("#time-limit-select");r?.addEventListener("change",async()=>{const t=parseInt(r.value,10);await p.updateSettings({dailyTimeLimitMinutes:t})});const c=this.container.querySelector("#music-toggle-check");c?.addEventListener("change",async()=>{await p.updateSettings({musicEnabled:c.checked})}),this.container.querySelector("#reset-profile-btn")?.addEventListener("click",async()=>{confirm("¿Está seguro de que desea reiniciar el progreso del perfil seleccionado?")&&confirm("Esta acción no se puede deshacer. ¿Confirma el reinicio de estrellas y actividades?")&&(await p.reset(this.activeProfile?.id),await this.refreshData(),this.render(),alert("El progreso ha sido reiniciado con éxito."))})}}class C{container;numA=0;numB=0;correctAnswer=0;onUnlocked;constructor(e){this.onUnlocked=e,this.container=document.createElement("div"),this.container.className="parental-gate-overlay",this.generateMathProblem()}generateMathProblem(){this.numA=Math.floor(Math.random()*20)+14,this.numB=Math.floor(Math.random()*25)+12,this.correctAnswer=this.numA+this.numB}async render(e){const s=(await p.getSettings()).adultPassword||"1234";this.container.innerHTML=`
      <div class="parental-gate-modal" role="dialog" aria-labelledby="gate-title">
        <div class="gate-icon-shield">🛡️</div>
        <h2 id="gate-title" class="gate-title">Zona Exclusiva para Familias y Docentes</h2>
        <p class="gate-desc">
          Para garantizar la seguridad de los niños y proteger los ajustes, resuelva el siguiente cálculo aritmético o ingrese la clave de adulto.
        </p>

        <div class="gate-challenge-box">
          <div class="challenge-label">Pregunta de Seguridad Parental:</div>
          <div class="challenge-equation">¿Cuánto es <strong>${this.numA} + ${this.numB}</strong>?</div>
          <input
            type="number"
            id="gate-math-input"
            class="gate-input"
            placeholder="Resultado"
            autocomplete="off"
            aria-label="Resultado de la operación matemática"
          />
        </div>

        <div class="gate-password-accordion">
          <details>
            <summary>¿Prefiere ingresar con contraseña de adulto?</summary>
            <div style="margin-top: 10px;">
              <input
                type="password"
                id="gate-pass-input"
                class="gate-input"
                placeholder="Contraseña (por defecto: 1234)"
                aria-label="Contraseña de adulto"
              />
            </div>
          </details>
        </div>

        <div id="gate-error-msg" class="gate-error" style="display: none;"></div>

        <div class="gate-actions">
          <a href="./index.html" class="gate-btn gate-btn-secondary">Volver al Circo</a>
          <button id="gate-submit-btn" class="gate-btn gate-btn-primary">Verificar e Ingresar</button>
        </div>
      </div>
    `,e.appendChild(this.container),this.injectStylesOnce();const d=this.container.querySelector("#gate-submit-btn"),o=this.container.querySelector("#gate-math-input"),r=this.container.querySelector("#gate-pass-input"),c=this.container.querySelector("#gate-error-msg"),l=()=>{const t=parseInt(o.value.trim(),10),i=r?.value.trim();if(t===this.correctAnswer||i&&i===s)this.container.remove(),this.onUnlocked();else{c.textContent="Respuesta o contraseña incorrecta. Por favor intente nuevamente.",c.style.display="block",this.generateMathProblem();const n=this.container.querySelector(".challenge-equation");n&&(n.innerHTML=`¿Cuánto es <strong>${this.numA} + ${this.numB}</strong>?`),o.value="",o.focus()}};d?.addEventListener("click",l),o.addEventListener("keydown",t=>{t.key==="Enter"&&l()}),r?.addEventListener("keydown",t=>{t.key==="Enter"&&l()}),o.focus()}injectStylesOnce(){if(document.getElementById("parental-gate-styles"))return;const e=document.createElement("style");e.id="parental-gate-styles",e.textContent=`
      .parental-gate-overlay {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.85);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100000;
        padding: 20px;
      }

      .parental-gate-modal {
        background: #FFFFFF;
        border-radius: 16px;
        padding: 36px 32px;
        max-width: 520px;
        width: 100%;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        border: 1px solid #E2E8F0;
        text-align: center;
      }

      .gate-icon-shield {
        font-size: 48px;
        margin-bottom: 12px;
      }

      .gate-title {
        font-size: 22px;
        font-weight: 700;
        color: #0F172A;
        margin-bottom: 8px;
        line-height: 1.3;
      }

      .gate-desc {
        font-size: 14px;
        color: #475569;
        margin-bottom: 24px;
        line-height: 1.5;
      }

      .gate-challenge-box {
        background: #F8FAFC;
        border: 1px solid #CBD5E1;
        border-radius: 12px;
        padding: 18px;
        margin-bottom: 16px;
      }

      .challenge-label {
        font-size: 13px;
        font-weight: 600;
        color: #64748B;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 6px;
      }

      .challenge-equation {
        font-size: 24px;
        color: #1E293B;
        margin-bottom: 14px;
      }

      .gate-input {
        width: 100%;
        max-width: 260px;
        padding: 10px 16px;
        border-radius: 8px;
        border: 2px solid #CBD5E1;
        font-size: 18px;
        text-align: center;
        font-weight: 600;
        color: #0F172A;
        outline: none;
        transition: border-color 0.2s;
      }

      .gate-input:focus {
        border-color: #2563EB;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
      }

      .gate-password-accordion {
        margin-bottom: 20px;
        font-size: 13px;
        color: #64748B;
        text-align: left;
      }

      .gate-password-accordion summary {
        cursor: pointer;
        user-select: none;
      }

      .gate-error {
        color: #DC2626;
        font-size: 13px;
        font-weight: 600;
        margin-bottom: 16px;
        padding: 8px;
        background: #FEE2E2;
        border-radius: 6px;
      }

      .gate-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        margin-top: 16px;
      }

      .gate-btn {
        padding: 10px 20px;
        border-radius: 8px;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }

      .gate-btn-secondary {
        background: #F1F5F9;
        color: #475569;
        border: 1px solid #CBD5E1;
      }

      .gate-btn-secondary:hover {
        background: #E2E8F0;
      }

      .gate-btn-primary {
        background: #2563EB;
        color: #FFFFFF;
        border: 1px solid #1D4ED8;
      }

      .gate-btn-primary:hover {
        background: #1D4ED8;
      }
    `,document.head.appendChild(e)}}document.addEventListener("DOMContentLoaded",()=>{const u=document.getElementById("panel-app");if(!u)return;new C(()=>{new E(u).init()}).render(document.body)});
