export interface CircusCharacter {
  id: string;
  name: string;
  role: string;
  species: string;
  soundEffect: string; // onomatopoeia
  synthesizedFreq: number; // frequency for web audio sound
  primaryColor: string;
  avatarEmoji: string;
  bio: string;
}

export const CIRCUS_CAST: Record<string, CircusCharacter> = {
  pomni: {
    id: 'pomni',
    name: 'Pomni',
    role: 'Bufón ansiosa y protagonista',
    species: 'Mono',
    soundEffect: '¡Uh-uh ah-ah!',
    synthesizedFreq: 480,
    primaryColor: '#00C4B4',
    avatarEmoji: '🐒',
    bio: 'Ágil y expresiva, aprende a calmarse contando objetos del circo.',
  },
  jax: {
    id: 'jax',
    name: 'Jax',
    role: 'Conejo malabarista y travieso',
    species: 'Conejo',
    soundEffect: '¡Boing!',
    synthesizedFreq: 620,
    primaryColor: '#A855F7',
    avatarEmoji: '🐰',
    bio: 'Alto y veloz, le fascina jugar con números y esconderse entre las ramas.',
  },
  ragatha: {
    id: 'ragatha',
    name: 'Ragatha',
    role: 'Muñeca de trapo optimista',
    species: 'Leona',
    soundEffect: '¡Grrr dulce!',
    synthesizedFreq: 330,
    primaryColor: '#F97316',
    avatarEmoji: '🦁',
    bio: 'Cariñosa y paciente, ayuda con las primeras vocales y rimas.',
  },
  gangle: {
    id: 'gangle',
    name: 'Gangle',
    role: 'Acróbata sensible con máscaras',
    species: 'Rana',
    soundEffect: '¡Croac!',
    synthesizedFreq: 260,
    primaryColor: '#22C55E',
    avatarEmoji: '🐸',
    bio: 'Tímida pero muy alegre cuando salta sobre nenúfares y letras.',
  },
  kinger: {
    id: 'kinger',
    name: 'Kinger',
    role: 'Pieza de ajedrez rey sabio',
    species: 'Elefante',
    soundEffect: '¡Fruuuut!',
    synthesizedFreq: 190,
    primaryColor: '#EAB308',
    avatarEmoji: '🐘',
    bio: 'Guarda tesoros de memoria y ayuda a recordar amigos y formas.',
  },
  zooble: {
    id: 'zooble',
    name: 'Zooble',
    role: 'Constructora geométrica',
    species: 'Abeja',
    soundEffect: '¡Bzzzz!',
    synthesizedFreq: 520,
    primaryColor: '#EC4899',
    avatarEmoji: '🐝',
    bio: 'Arma secuencias y patrones lógicos con bloques de colores.',
  },
  caine: {
    id: 'caine',
    name: 'Caine',
    role: 'Maestro de ceremonias excéntrico',
    species: 'Tucán',
    soundEffect: '¡Cua-cua!',
    synthesizedFreq: 750,
    primaryColor: '#EF4444',
    avatarEmoji: '🦜',
    bio: 'Presenta el gran show y reconoce los más asombrosos sonidos de la naturaleza.',
  },
  bubble: {
    id: 'bubble',
    name: 'Bubble',
    role: 'Asistente de burbujas',
    species: 'Tortuga',
    soundEffect: '¡Glup!',
    synthesizedFreq: 400,
    primaryColor: '#06B6D4',
    avatarEmoji: '🐢',
    bio: 'Llena la pista de burbujas sonoras que explotan de alegría.',
  },
  kaufmo: {
    id: 'kaufmo',
    name: 'Kaufmo',
    role: 'Payaso de las risas sorpresas',
    species: 'Oso',
    soundEffect: '¡Grrr jojo!',
    synthesizedFreq: 220,
    primaryColor: '#F59E0B',
    avatarEmoji: '🐻',
    bio: 'Desbloqueable especial que premia la constancia.',
  },
  queenie: {
    id: 'queenie',
    name: 'Queenie',
    role: 'Reina de las estrellas',
    species: 'Cisne',
    soundEffect: '¡Flap flap!',
    synthesizedFreq: 680,
    primaryColor: '#8B5CF6',
    avatarEmoji: '🦢',
    bio: 'Guarda la constelación de medallas del gran circo.',
  },
};
