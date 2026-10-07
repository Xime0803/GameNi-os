# 🎪 El Mundo de Ximenita
> *Aprende jugando con tus amigos animales*

Videojuego web educativo infantil interactivo para niños de 3 a 10 años, diseñado con identidad estética circense digital y fundamentado pedagógicamente en el **Currículo Nacional de la Educación Básica (CNEB) del Perú**.

---

## 🌟 1. Identidad y Personajes

### 👧 Ximenita (Guía Infantil)
- **Edad:** 4 años.
- **Rasgos:** Cabello largo en dos trenzas color canelita clara (`#C89B6B` con reflejos `#E6C79A`), piel cálida (`#F6D7B8`), mejillas rosadas (`#F4A7A0`) y vestido rosa coral (`#FF8FA3`).
- **Personalidad:** Carismática, alegre, tierna y curiosa.
- **Estados de animación:**
  1. `idle`: Respiración suave y tranquila.
  2. `speaking`: Movimiento de boca y narración por voz con burbujas de diálogo.
  3. `celebrating`: Salto festivo con estrellas ante aciertos.
  4. `hint`: Inclinación de cabeza con expresión reflexiva para animar ante el error.
- **Voz y Accesibilidad:** Web Speech API en español latino con acento peruano (`es-PE`, fallback `es-MX`), modulable en tres velocidades persistidas:
  - Normal: rate `0.85`
  - Lenta: rate `0.70`
  - Muy lenta: rate `0.55`
- **Regla Estricta:** Ximenita **no aparece** en el panel de adultos para preservar el entorno profesional sobrio.

### 🎭 Elenco del Circo Digital (Animales Antropomórficos)
1. **Pomni (Mono):** Bufón ansiosa y protagonista; counting y números (1 al 100).
2. **Jax (Conejo):** Ágil y travieso; discriminación auditiva numérica.
3. **Ragatha (Leona):** Muñeca de trapo tierna; vocales iniciales y hábitats.
4. **Gangle (Rana):** Tímida y bailarina; trazado de vocales y consonantes.
5. **Kinger (Elefante):** Rey sabio de ajedrez; memoria de trabajo y trazado de números.
6. **Zooble (Abeja):** Constructora de piezas geométricas; secuencias lógicas y patrones (ABAB, AABB).
7. **Caine (Tucán):** Maestro de ceremonias excéntrico; discriminación de sonidos y cantos de la naturaleza.
8. **Bubble (Tortuga):** Asistente burbujeante; alegría y animaciones.

---

## 📚 2. Alineamiento Curricular CNEB (Perú)

| Área CNEB | Competencia | Ciclo CNEB | Mini-Juegos Asociados |
| :--- | :--- | :--- | :--- |
| **Matemática** | Resuelve problemas de cantidad | Ciclo II Inicial / Ciclo III Primaria | 01 Cuenta con Pomni<br>02 Números del bosque<br>07 Sumas de la selva |
| **Matemática** | Resuelve problemas de forma, movimiento y localización | Ciclo II Inicial | 03 Traza los números |
| **Comunicación** | Se comunica oralmente en su lengua materna | Ciclo II Inicial / Ciclo III Primaria | 04 Vocales animales<br>10 Sonidos del mundo animal |
| **Comunicación** | Escribe diversos tipos de textos en su lengua materna | Ciclo II Inicial / Ciclo III Primaria | 05 Traza las vocales |
| **Ciencia y Tecnología / Personal Social** | Indaga mediante métodos científicos / Construye su identidad | Ciclo II Inicial | 06 Memoria animal<br>08 Patrones animales<br>09 ¿Dónde vive? |

---

## 🔒 3. Panel de Padres y Maestros (`panel.html`)

El **Panel Pedagógico para Adultos** está desacoplado del juego lúdico infantil:
- **Diseño Sobrio y Profesional:** Sin estridencias infantiles, con tipografía clara y modo oscuro disponible.
- **Parental Gate con Control Dual:** Exige resolver un cálculo de dos dígitos (ej. $17 + 26$) o ingresar la contraseña de adulto (por defecto: `1234`).
- **Múltiples Perfiles Anónimos:** Permite alternar entre estudiantes o hijos ("perfil-1", "perfil-2") sin registrar correos ni nombres completos.
- **Reportes Formativos CNEB:** Escala de logro nacional:
  - **AD:** Logro Destacado
  - **A:** Logro Esperado
  - **B:** En Proceso
  - **C:** En Inicio
- **Recomendaciones Pedagógicas Automáticas:** Sugerencias para el hogar (material concreto) y el aula generadas a partir de los aciertos y dificultades del menor.
- **Modo Aula Docente:** Distribución por percentiles (P25, Mediana P50, P75) de la cohorte sin comparaciones nominales ni rankings competitivos.
- **Gestión de Sesión Saludable:** Configuración del límite de tiempo diario (10, 20, 30, 45 min o sin límite).

---

## 🛡️ 4. Privacidad y Seguridad Infantil (Privacy by Design)

- **Ley Peruana N° 29733 (Protección de Datos Personales):** Cero recolección de datos personales identificables (PII). Todos los datos se guardan estrictamente en el almacenamiento local del dispositivo (`localStorage`).
- **COPPA & GDPR-K:** Sin publicidad, sin rastreadores de analítica de terceros y sin venta de datos.
- **Backend Ready:** Arquitectura `ProgressAdapter` preparada para conectar Supabase o Firebase en futuras versiones sin refactorizar el código base.

---

## 🛠️ 5. Arquitectura Técnica

- **TypeScript Estricto:** `strict: true` en toda la base de código.
- **Vite:** Empaquetador ultrarrápido con arquitectura multi-página (`index.html` y `panel.html`).
- **Motor de Trazado:** HTML5 Canvas 2D + muestreo de vectores SVG (`getPointAtLength`), detección de sentido y retroceso, umbral de cobertura al 78% con punto de inicio rojo y guía punteada azul.
- **Audio Nativo:** Web Audio API para síntesis pura de sonido sin librerías externas pesadas.
- **Bundle Ultraligero:** Peso total inferior a 120 KB (~30 KB gzipped), permitiendo ejecución instantánea incluso en tablets de gama de entrada.
- **PWA:** Funcionalidad offline e instalable mediante Service Worker y Web App Manifest.

---

## 🚀 6. Instalación y Ejecución

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo local
npm run dev

# 3. Ejecutar pruebas unitarias (Vitest)
npm test

# 4. Compilar para producción (TypeScript + Vite)
npm run build
```

---

## 📋 7. Registro de Nuevos Juegos

Para añadir una atracción circense adicional:
1. Crear la carpeta `src/games/NN-nombre-juego` con:
   - `config.ts`: Define título, área, personaje y niveles.
   - `styles.css`: Estilos encapsulados del juego.
   - `index.ts`: Implementa la interfaz `MiniGame`.
2. Registrar la instancia en el arreglo `ALL_GAMES` en `src/games/index.ts`.
3. Asignar su emoji en el método `emojiForGame` de `src/ui/MapScreen.ts`.
