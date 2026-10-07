import { ProgressEntry } from '../core/types';

export type CNEBLevel = 'AD' | 'A' | 'B' | 'C';

export interface CNEBAreaReport {
  competency: string;
  cnebCycle: string;
  masteryPercentage: number;
  level: CNEBLevel;
  levelDescription: string;
  totalActivities: number;
  accuracy: number;
}

export interface PedagogicalRecommendation {
  id: string;
  area: string;
  priority: 'alta' | 'media' | 'positiva';
  title: string;
  observation: string;
  homeActivity: string;
  classroomTip: string;
}

export interface ClassroomCohortMetrics {
  totalStudents: number;
  medianMastery: number;
  percentile25: number;
  percentile75: number;
  distribution: {
    inicio: number; // C
    proceso: number; // B
    logrado: number; // A
    destacado: number; // AD
  };
}

export class ReportsService {
  public static calculateCNEBReports(entries: ProgressEntry[]): Record<string, CNEBAreaReport> {
    const areas = {
      cantidad: {
        competency: 'Resuelve problemas de cantidad (Conteo y sumas)',
        cycle: 'Ciclo II (3-6 años) y Ciclo III (7-8 años)',
        games: ['01-cuenta-con-pomni', '02-numeros-del-bosque', '07-sumas-de-la-selva'],
      },
      forma: {
        competency: 'Resuelve problemas de forma y localización (Trazado numérico)',
        cycle: 'Ciclo II Inicial',
        games: ['03-traza-los-numeros'],
      },
      comunicacion: {
        competency: 'Se comunica oralmente y escribe diversos tipos de textos (Vocales y trazo)',
        cycle: 'Ciclo II Inicial y Ciclo III Primaria',
        games: ['04-vocales-animales', '05-traza-las-vocales', '10-sonidos-animales'],
      },
      logicaCiencia: {
        competency: 'Indaga mediante métodos científicos y pensamiento lógico (Hábitats y patrones)',
        cycle: 'Ciclo II Inicial',
        games: ['06-memoria-animal', '08-patrones-animales', '09-donde-vive'],
      },
    };

    const results: Record<string, CNEBAreaReport> = {};

    for (const [key, meta] of Object.entries(areas)) {
      const areaEntries = entries.filter((e) => meta.games.includes(e.gameId));
      if (areaEntries.length === 0) {
        results[key] = {
          competency: meta.competency,
          cnebCycle: meta.cycle,
          masteryPercentage: 0,
          level: 'C',
          levelDescription: 'En Inicio (Aún sin actividades registradas)',
          totalActivities: 0,
          accuracy: 0,
        };
        continue;
      }

      let totalHits = 0;
      let totalMisses = 0;
      let sumLevels = 0;

      areaEntries.forEach((e) => {
        totalHits += e.hits;
        totalMisses += e.misses;
        sumLevels += e.level;
      });

      const totalAttempts = totalHits + totalMisses;
      const accuracy = totalAttempts > 0 ? (totalHits / totalAttempts) * 100 : 0;
      const avgLevel = sumLevels / areaEntries.length; // 1 a 5

      // Cálculo ponderado: 60% precisión, 40% progresión de nivel
      const mastery = Math.min(100, Math.round(accuracy * 0.6 + (avgLevel / 5) * 40));

      let level: CNEBLevel = 'C';
      let desc = 'En Inicio';
      if (mastery >= 85) {
        level = 'AD';
        desc = 'Logro Destacado';
      } else if (mastery >= 65) {
        level = 'A';
        desc = 'Logro Esperado';
      } else if (mastery >= 40) {
        level = 'B';
        desc = 'En Proceso';
      }

      results[key] = {
        competency: meta.competency,
        cnebCycle: meta.cycle,
        masteryPercentage: mastery,
        level,
        levelDescription: desc,
        totalActivities: areaEntries.length,
        accuracy: Math.round(accuracy),
      };
    }

    return results;
  }

  public static generatePedagogicalRecommendations(entries: ProgressEntry[]): PedagogicalRecommendation[] {
    const recs: PedagogicalRecommendation[] = [];

    // 1. Dificultad en trazado
    const tracingEntries = entries.filter((e) => ['03-traza-los-numeros', '05-traza-las-vocales'].includes(e.gameId));
    const tracingMisses = tracingEntries.reduce((acc, curr) => acc + curr.misses, 0);
    const tracingHits = tracingEntries.reduce((acc, curr) => acc + curr.hits, 0);

    if (tracingEntries.length > 0 && (tracingMisses / Math.max(1, tracingHits + tracingMisses)) > 0.3) {
      recs.push({
        id: 'rec-trazado',
        area: 'Escritura y Grafomotricidad',
        priority: 'alta',
        title: 'Refuerzo de direccionalidad y motricidad fina',
        observation: 'Se detectaron retrocesos o desvíos frecuentes en la trayectoria guiada del dedo.',
        homeActivity: 'Practicar trazos con el dedo índice sobre bandejas con harina o sémola antes de la pantalla.',
        classroomTip: 'Brindar ejercicios vivenciales en el suelo caminando sobre líneas curvas y rectas con tiza.',
      });
    }

    // 2. Conteo y sumas
    const sumEntries = entries.filter((e) => e.gameId === '07-sumas-de-la-selva');
    const sumMisses = sumEntries.reduce((acc, curr) => acc + curr.misses, 0);
    if (sumEntries.length > 0 && sumMisses >= 3) {
      recs.push({
        id: 'rec-sumas',
        area: 'Matemática (Cantidad)',
        priority: 'alta',
        title: 'Consolidación del conteo concreto (Enfoque CPA)',
        observation: 'Presenta dificultad al combinar dos conjuntos numéricos simultáneamente.',
        homeActivity: 'Utilizar semillas, botones o tapitas para juntar grupos de 3 y 4 elementos en platos separados.',
        classroomTip: 'Trabajar con material concreto estructurado (regletas de Cuisenaire o fichas de dos colores).',
      });
    }

    // 3. Vocales y fonología
    const vowelEntries = entries.filter((e) => e.gameId === '04-vocales-animales');
    if (vowelEntries.length > 0 && vowelEntries.some((e) => e.misses > 2)) {
      recs.push({
        id: 'rec-vocales',
        area: 'Comunicación Oral',
        priority: 'media',
        title: 'Estimulación de discriminación auditiva fonológica',
        observation: 'Confusión ocasional entre sonidos vocálicos iniciales abiertos y cerrados.',
        homeActivity: 'Jugar a "Veo veo una cosita que empieza con..." exagerando la boca frente a un espejo.',
        classroomTip: 'Rimas cortas infantiles y palmadas fonémicas al inicio de palabras cotidianas.',
      });
    }

    // 4. Reconocimiento positivo general
    if (recs.length === 0) {
      recs.push({
        id: 'rec-positiva',
        area: 'Desarrollo Integral',
        priority: 'positiva',
        title: '¡Excelente progreso y constancia lúdica!',
        observation: 'El estudiante demuestra alta atención, persistencia y fluidez en todas las áreas exploradas.',
        homeActivity: 'Celebrar los logros alcanzados e invitar a contar objetos durante las compras o paseos.',
        classroomTip: 'Proponerle retos de mayor autonomía o ser guía de sus pares en actividades grupales.',
      });
    }

    return recs;
  }

  public static calculateClassroomMetrics(allEntries: ProgressEntry[], studentCount: number = 24): ClassroomCohortMetrics {
    // Estimación percentilar docente sobria y anónima
    const scores = allEntries.length > 0
      ? allEntries.map((e) => Math.min(100, Math.round((e.hits / Math.max(1, e.hits + e.misses)) * 100)))
      : [45, 60, 72, 85, 90, 68, 75, 82]; // Distribución de muestra pedagógica

    scores.sort((a, b) => a - b);
    const p25 = scores[Math.floor(scores.length * 0.25)] || 50;
    const median = scores[Math.floor(scores.length * 0.5)] || 70;
    const p75 = scores[Math.floor(scores.length * 0.75)] || 85;

    let inicio = 0;
    let proceso = 0;
    let logrado = 0;
    let destacado = 0;

    scores.forEach((s) => {
      if (s >= 85) destacado++;
      else if (s >= 65) logrado++;
      else if (s >= 40) proceso++;
      else inicio++;
    });

    return {
      totalStudents: studentCount,
      medianMastery: median,
      percentile25: p25,
      percentile75: p75,
      distribution: {
        inicio: Math.round((inicio / scores.length) * 100),
        proceso: Math.round((proceso / scores.length) * 100),
        logrado: Math.round((logrado / scores.length) * 100),
        destacado: Math.round((destacado / scores.length) * 100),
      },
    };
  }
}
