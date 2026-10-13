import { MiniGame } from '../core/types';
import { CuentaConPomniGame } from './01-cuenta-con-pomni';
import { NumerosDelBosqueGame } from './02-numeros-del-bosque';
import { TrazaLosNumerosGame } from './03-traza-los-numeros';
import { VocalesAnimalesGame } from './04-vocales-animales';
import { TrazaLasVocalesGame } from './05-traza-las-vocales';
import { MemoriaAnimalGame } from './06-memoria-animal';
import { SumasDeLaSelvaGame } from './07-sumas-de-la-selva';
import { PatronesAnimalesGame } from './08-patrones-animales';
import { DondeViveGame } from './09-donde-vive';
import { SonidosAnimalesGame } from './10-sonidos-animales';
import { ConectaNumerosGame } from './11-conecta-numeros';
import { SumasInicialGame } from './12-sumas-inicial';

/**
 * Registro Central Flexible de Juegos
 * Añadir un juego nuevo requiere únicamente:
 * 1. Crear la carpeta src/games/NN-nombre-juego con config.ts, styles.css e index.ts
 * 2. Instanciarlo en el arreglo ALL
 * 3. Asignar su emoji en MapScreen.ts
 */
export const ALL_GAMES: MiniGame[] = [
  new CuentaConPomniGame(),
  new NumerosDelBosqueGame(),
  new TrazaLosNumerosGame(),
  new VocalesAnimalesGame(),
  new TrazaLasVocalesGame(),
  new MemoriaAnimalGame(),
  new SumasDeLaSelvaGame(),
  new PatronesAnimalesGame(),
  new DondeViveGame(),
  new SonidosAnimalesGame(),
  new ConectaNumerosGame(),
  new SumasInicialGame(),
];

