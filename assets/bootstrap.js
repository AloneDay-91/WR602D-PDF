import { startStimulusApp } from '@symfony/stimulus-bridge';
import { registerReactControllerComponents } from '@symfony/ux-react';

// 1. Initialise Stimulus normalement
export const app = startStimulusApp(require.context(
    '@symfony/stimulus-bridge/lazy-controller-loader!./controllers',
    true,
    /\.[jt]sx?$/
));

// 2. FORCE l'enregistrement des composants React
// Attention : vérifie que le chemin './react/controllers' est bien correct
// par rapport à l'emplacement de ce fichier bootstrap.js
registerReactControllerComponents(require.context('./react/controllers', true, /\.(j|t)sx?$/));
