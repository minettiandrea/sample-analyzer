# Sample Analyzer

This joint-project was developed for the Advanced Coding Tools & Methodologies and Computer Music- Representation and Models courses at the Politecnico of Milan.

## Introduction
When we were thinking about an idea for this project, we first asked ourselves "what could help producers or musicians?" and we came up with this: a smart system for dealing with samples.
We started from the idea that, even tidy people, will have loads of samples but no chance to filter them. The first approach was working with big datasets locally, but this wasn't the best option to implement on a web-based application. 
We therefore moved to a sample analyzer, that could allow the user to upload a sample and look for some useful information.

## Tools
The project exploits Typescript language, using the Vue framework. 

* ![Vexflow](https://github.com/0xfe/vexflow) API to render music notations, sheets, guitar tabs.​

* ![Inversify](https://github.com/inversify/InversifyJS) IOC -> Inversion of control. Classes helpful to have SOLID code properties, especially dependency inversion principle.​ In other words: it helps to have classes that are easily testable and isolated.​
* ![Vuetify](https://vuetifyjs.com/en/)​ Material design for Vue framework​.

* ![RxJS](https://rxjs-dev.firebaseapp.com/)​ Reactive programming using Observables for asynchronous calls.​

​* ![Chart.js](https://www.chartjs.org/)​ Open source library for plotting charts.​

​* ![Essentia.js](https://mtg.github.io/essentia.js/) Open source library developed by MTG, with state-of-the-art algorithms written in C++.

## GUI

The interface is divided into two main tabs, one for rhythmical analysis and one for harmonic analysis.
In the sidebar, a sample loader is provided with a few offline examples (two drum breaks and two one-shot samples).
The user will have to decided what to do with the sample. Obviously looking for chord suggestion when a kick drum sample has been loaded will lead to some strange results.

## Harmonic analysis

### Spectrum presenter

Whenever producers or musicians use a sample, often they do not know much about its spectral content. Our tool provides a spectrum plot, both with logarithmic or linear axis.
A peak detection algorithm also tries to predict the pitch of the sample and plots the first harmonics.
![spectrum](/screenshots/spectrum.png)

### HPCP

Harmonic Pitch Class Profile (HPCP) is mostly used to detect the harmonic evolution in time of a polyphonic signal, mainly in chord detection systems. In our case, we considered the coefficients for representing the contribution of each semitone to the total sound. We plotted it in a bar chart using chart.js
![hpcp](/screenshots/hpcp.png)

### Overtones presenter

Vexflow is a powerful library for music notation. We converted the frequency maxima found in the spectrum into musical notes and reported them onto a three stacks stave ranging into three clefs: bass, alto and treble.
![spectrum](/screenshots/overtones.png)


### Voicing suggestion

Voicings is the art of creating chords. 
Why should a keyboard player choose a chord over another? There are many reasons. The melodic direction of the piece, the personal taste, the music ensemble he's playing with (leave the space for the bass and avoid bass notes for example).
We created a simple engine based not on this factors but only on the harmonic content of the sample. This process is done for major, minor and dominant chords.
The resulting chords are then plotted again on a stave using VexFlow.

## Rhythmic analysis

### Audio player

Whenever we deal with a sample, we might want to listen to it. We provide a custom audio player with all the basic features.
![audioplayer](/screenshots/audioplayer.png)

### Beat detection & polyrhythms

The green lines that you can see above are the result of a beat tracking algorithm.
A visual help to detect nested rhythms is provided as well. 
Through a simple form, the user can select a subdivisions (ex. 4 against 3 - where 4 is the main pattern and 3 is the nested rhythm).
Yellow lines will subdivided the beat to help the user visually detect if a polyrhythm is present or not.
![poly1](/screenshots/poly.png)

### Alternate view of polyrhythms & BPM

Polyrhythms can be easily represented using a rule that fits perfectly visual representation.
To be considered such, polyrhythms shouldn't be derived one from the other. Also, don't try to use too complicated numbers...
(unless you're some crazy jazz man)
In the picture below, you can see a representation of a 5 against 4.
![poly2](/screenshots/poly2.png)

## Conclusions

If you want to try it, we are running a github page. Click here!
