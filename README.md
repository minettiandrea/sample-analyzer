# Sample Analyzer

This joint-project was developed for the Advanced Coding Tools & Methodologies and Computer Music- Representation and Models courses at the Politecnico of Milan.

## Introduction
We've been thinking about a possible idea for this project. We asked ourselves "what could help producers or musicians?" and we came up with this: dealing with samples.
We started from the idea that, even tidy people, will have loads of samples but no chance to filter them. The first approach was working with big datasets locally, but this wasn't the best option to implement on a web-based application. 
We therefore moved to a sample analyzer, that could allow the user to upload a sample and look for some useful information.

##Tools
The project exploits Typescript language, using the Vue framework. Music notation rendering is based on SVG created with VexFlow library.
The basic GUI components are provided by Vuetify.

##GUI
The interface is divided into two main tabs, one for rhythmical analysis and the other one for harmonic.
In the sidebar, a sample loader is provided with a few offline examples (two drum breaks and two one-shot samples).

