// Persistent audio instances to avoid recreation and enable preloading
export const mainAudio = new Audio();
export const preloadAudio = new Audio();

// Configure instances
mainAudio.preload = 'auto';
preloadAudio.preload = 'auto';
