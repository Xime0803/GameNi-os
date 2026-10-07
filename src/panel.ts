import { PanelApp } from './panel/PanelApp';
import { ParentalGate } from './panel/parentalGate';
import { AuthSession } from './core/types';
import './panel/styles.css';

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('panel-app');
  if (!root) return;

  // 1. Mostrar Portal de Acceso (Código de 6 Dígitos para Familias o Clave Administrador)
  const gate = new ParentalGate((session: AuthSession) => {
    // 2. Iniciar el panel pedagógico con el rol y perfil autenticados
    const app = new PanelApp(root, session);
    app.init(session);
  });

  gate.render(document.body);
});
