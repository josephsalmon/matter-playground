import MatterTools from "matter-tools";
import { Example } from "./galton.js";

MatterTools.Demo.create({
  fullPage: true,
  preventZoom: true,
  startExample: true,
  appendTo: document.body,

  toolbar: {
    title: 'matter-tools',
    url: 'https://github.com/liabru/matter-tools',
    reset: true,
    source: true,
    inspector: true,
    tools: true,
    fullscreen: true,
    exampleSelect: true
  },

  tools: {
    inspector: true,
    gui: true
  },
  
  examples: [
    {
      name: 'Galton Board',
      id: 'galton',
      init: Example.galton,
      sourceLink: './galton.js'
    }]
});

