import { PanelApp } from './panel/PanelApp';
import { ParentalGate } from './panel/parentalGate';
import './panel/styles.css';

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('panel-app');
  if (!root) return;

  // 1. Mostrar Parental Gate de protección para adultos
  const gate = new ParentalGate(() => {
    // 2. Una vez resuelto el desafío, iniciar el panel pedagógico
    const app = new PanelApp(root);
    app.init();
  });

  gate.render(document.body);
});
