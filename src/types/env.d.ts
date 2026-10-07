/// <reference types="vite/client" />

interface Window {
  speechSynthesis: SpeechSynthesis;
  webkitAudioContext: typeof AudioContext;
}
