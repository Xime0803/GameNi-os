# PROMPT MAESTRO - EL MUNDO DE XIMENITA

> **Proyecto:** El Mundo de Ximenita  
> **Subtítulo:** Aprende jugando con tus amigos animales  
> **Audiencia:** Niños de 3 a 10 años (Modo Inicial 3-6 años / Modo Avanzado 7-10 años), Padres y Maestros  
> **Ámbito Pedagógico:** Currículo Nacional de la Educación Básica (CNEB) del Perú (Ciclo II Inicial, Ciclos III y IV Primaria)  
> **Marco Legal y Privacidad:** Ley Peruana N° 29733 (Protección de Datos Personales), COPPA, GDPR-K  
> **Stack Técnico:** TypeScript estricto (`strict: true`), Vite, HTML5, CSS3 Tokens, Canvas 2D, SVG, Web Speech API (`es-PE` / `es-MX`), Web Audio API nativo, PWA.

---

## 1. Identidad del Personaje Guía: Ximenita
- **Edad:** 4 años.
- **Rasgos visuales:** Cabello largo recogido en dos trenzas color canelita clara (`#C89B6B` con reflejos `#E6C79A`), piel cálida (`#F6D7B8`), mejillas rosadas (`#F4A7A0`), vestido rosa coral (`#FF8FA3`).
- **Personalidad:** Carismática, alegre, sonriente, curiosa y tierna. Acompaña siempre al niño, celebra sus logros, anima en caso de error, otorga pistas y narra todas las instrucciones con audio y gestos visuales.
- **Estados visuales:**
  1. *Idle:* Respiración suave y parpadeo.
  2. *Habla:* Movimiento de boca y ondas de voz.
  3. *Celebra:* Salto festivo con destellos y alegría.
  4. *Pista:* Inclinación de cabeza con expresión curiosa y bombilla/estrella.
- **Disfraces/Atuendos:** Cambia según el juego (delantal de artista, sombrero de exploradora de selva, gorro de chef, etc.).
- **Voz y Accesibilidad:** Web Speech API en español peruano (`es-PE`, fallback `es-MX`). Voz infantil femenina, pausada y cálida. Tres velocidades seleccionables y persistidas en `localStorage`:
  - Normal: rate `0.85`
  - Lenta: rate `0.70`
  - Muy lenta: rate `0.55`
- **Frases recurrentes:**
  - Saludo: *"¡Hola! Soy Ximenita"*
  - Aciertos: *"¡Muy bien!"*, *"¡Excelente!"*, *"¡Lo lograste!"*
  - Errores / Motivación: *"Casi, inténtalo otra vez"*, *"Vamos juntos"*
  - Celebración: *"¡Ganaste una estrella!"*
- **Regla estricta:** Ximenita **NO** aparece en el panel de adultos (padres y maestros), manteniendo la distinción entre el mundo lúdico infantil y la herramienta analítica sobria.

---

## 2. Elenco del Circo Digital (Animales Antropomórficos)
Inspirado en el concepto circense digital con animales amigables:
1. **Pomni:** Mona bufona ansiosa y protagonista principal (Miniturquesa y rojo).
2. **Jax:** Conejo alto, ágil y bromista (Morado y fucsia).
3. **Ragatha:** Leona amable, muñeca de trapo protectora y optimista (Naranja y amarillo sol).
4. **Gangle:** Ranita tímida y dulce que usa cintas y máscaras teatrales (Verde y carmesí).
5. **Kinger:** Elefante sabio vestido de rey de ajedrez (Gris perla y dorado).
6. **Zooble:** Abeja ingeniosa y constructora hecha de formas geométricas (Amarillo rayado y azul marino).
7. **Caine:** Tucán maestro de ceremonias excéntrico e hiperactivo con galera y moño (Multicolor).
8. **Bubble:** Tortuga marina asistente burbujeante y sonriente (Verde lima y celeste).
*Sonido animal:* Antes de hablar en español, el animal emite su sonido vocal nativo (rugido, croar, zumbido, chasquido o trompeta sonora sintetizada con Web Audio API).

---

## 3. Currículo CNEB (Perú)
- **Área Matemática:**
  - *Resuelve problemas de cantidad:* Conteo del 1 al 100, correspondencia término a término, comparación, sumas y restas hasta 100.
  - *Resuelve problemas de forma, movimiento y localización:* Direccionalidad, motricidad fina y trazado de números.
- **Área Comunicación:**
  - *Se comunica oralmente:* Discriminación auditiva fonológica, comprensión de consignas habladas.
  - *Lee y escribe diversos tipos de textos:* Asociación grafema-fonema, trazado de vocales (A, E, I, O, U) y consonantes iniciales (M, P, S, L, T).
- **Área Personal Social:**
  - *Construye su identidad y convive democráticamente:* Autonomía, persistencia frente al error sin frustración, empatía con los personajes.
- **Área Ciencia y Tecnología:**
  - *Indaga mediante métodos científicos:* Reconocimiento de animales, sonidos de la naturaleza, clasificación por hábitats (selva, costa, andes, granja, mar).

---

## 4. Los 10 Mini-Juegos
1. **01 Cuenta con Pomni:** Conteo interactivo con Pomni (1 al 100 con escalonamiento adaptativo).
2. **02 Números del bosque:** Reconocimiento auditivo de números guiado por Jax y los animales.
3. **03 Traza los números:** Motor de trazado háptico/táctil Canvas 2D + SVG para números del 1 al 100.
4. **04 Vocales animales:** Discriminación fonológica y letra inicial (A, E, I, O, U) con Ragatha y Gangle.
5. **05 Traza las vocales:** Trazado de vocales y consonantes fundamentales guiado por trazos vectoriales.
6. **06 Memoria animal:** Juego de concentración y emparejamiento con vocabulario zoológico y Kinger.
7. **07 Sumas de la selva:** Adición lúdica visual y concreta (desde $1+1$ hasta decenas y $100+100$).
8. **08 Patrones animales:** Pensamiento computacional y secuencias rítmicas (ABAB, AABB, ABC) con Zooble.
9. **09 ¿Dónde vive?:** Clasificación de hábitats naturales (Selva amazónica, Costa, Sierra, Océano).
10. **10 Sonidos del mundo animal:** Discriminación auditiva fina de onomatopeyas reales y canto de animales con Caine y Bubble.

---

## 5. Reglas de Oro de Diseño UX y Pedagogía Infantil
- **Sin estado de derrota:** El error nunca penaliza; se acompaña de una pista visual y auditiva de Ximenita ("Casi, inténtalo otra vez").
- **Sin cronómetros ni vidas:** Cero estrés o ansiedad por tiempo.
- **Recompensa inmediata:** Estrellas sonoras, lluvia de confeti físico en CSS, salto alegre de Ximenita.
- **Dificultad adaptativa (5 niveles por juego):**
  - 3 aciertos consecutivos $\rightarrow$ Sube de nivel.
  - 2 fallos consecutivos $\rightarrow$ Baja de nivel o refuerza con pista guiada.
- **Sesiones saludables:** 3 a 5 minutos por mini-juego, 8 rondas por sesión. Límite diario configurable por adultos (default: 20 min).
- **Botones y ergonomía táctil:** Targets mínimos de $80 \times 80\text{ px}$ con separación $\ge 16\text{ px}$.
- **Multimodalidad:** Toda instrucción combina voz natural + icono + ilustración gráfica. Nunca texto aislado.
- **Álbum de estampas y carpa de circo evolutiva:** El circo va ganando luces, banderines y público animado conforme el niño acumula logros.

---

## 6. Panel de Padres y Maestros (Bloque 3)
- Entrada separada (`panel.html` y `src/panel.ts`).
- Estilo sobrio, minimalista y profesional para adultos (`panel-theme.css`).
- **Seguridad parental:** Contraseña del adulto + Control Parental aritmético (ej. "¿Cuánto es 17 + 26?").
- **Múltiples perfiles anónimos:** Soporta perfiles locales anónimos ("perfil-1", "perfil-2" o apodos).
- **Métricas CNEB y pedagógicas:**
  - Tiempo de uso diario y semanal.
  - Dominio por área: Números, Escritura, Vocabulario y Lógica.
  - Detalle por juego: Nivel adaptativo alcanzado, aciertos, precisión y tiempo invertido.
  - **Recomendaciones automáticas:** Basadas en las dificultades detectadas (ej. *"Reforzar trazado del 7"*, *"Practicar la vocal U"*).
  - **Modo Aula:** Vista percentilar anónima para docentes sin exponer nombres ni rankings individuales.
- **Configuraciones:** Control de voz (normal, lenta, muy lenta), música ambiental (on/off), límite de tiempo diario (10, 20, 30, 45 min o ilimitado), reinicio seguro con doble confirmación.
- **Privacidad y Ley 29733:** Declaración explícita de no recolección de datos, almacenamiento 100% en el dispositivo del usuario, términos de uso y créditos.

---

## 7. Plan de Bloques y Estado del Proyecto
- **Bloque 1:** Fundaciones, tokens CSS, core services, Ximenita UI, Mini-juego 01. *(Completado)*
- **Bloque 2:** Motor de trazado Canvas/SVG, Mini-juegos 02 y 03, control de voz TTS, registro dinámico. *(Completado)*
- **Bloque 3:** Panel de Padres y Maestros con Parental Gate, perfiles, reportes CNEB y ajustes. *(Foco actual de entrega)*
- **Bloque 4:** Mini-juegos 04 y 05 (Vocales y trazado de letras).
- **Bloque 5:** Mini-juegos 06, 07 y 08 (Memoria, Sumas, Patrones).
- **Bloque 6:** Mini-juegos 09 y 10 (Hábitats y Sonidos animales).
- **Bloque 7:** Assets de alta fidelidad, PWA offline, suite de tests Vitest.
