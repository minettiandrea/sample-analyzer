<template>
<v-container class='col-12'>
    <v-row align='center' justify='center'>

    <v-card class="mx-auto col-10 mb-5 center">
        <div class='wrapper'
          ref='wrapper-spectrum'
          @mouseover="hover = true"
          @mouseleave="hide" >
          <canvas ref='hover' class ='spectrum'/>
          <canvas ref='spectrum' class='spectrum'>
          </canvas>
        </div>
    </v-card>
  </v-row>
</v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Ref } from 'vue-property-decorator'
import { Store } from '@/services/store/store'
import { AudioContextProvider } from '../../services/providers/context-provider'
import { inject } from 'inversify-props'
import { REGISTRY } from '@/ioc/registry'
import { EssentiaSpectralExtractor } from '@/services/spectral-extractor/essentia-spectral-extractor'
import { DrawToolkit, Panel } from '../../services/providers/draw-toolkit'
import { FreqBox } from '../../drawables/freqBox'
import { Spectra } from '../../drawables/spectra'
import { Axis } from '../../drawables/axis'
import { Quantizer, LogPoint } from '../../services/providers/quantizer'
import { FFT } from '@/services/providers/fft'
import { Line } from '../../drawables/line'

@Component
export default class SpectrumPresenter extends Vue {
    @inject(REGISTRY.SpectralExtractor) spectralExtractor: EssentiaSpectralExtractor;
    @inject(REGISTRY.Store) store:Store
    @inject(REGISTRY.DrawToolkit) drawtoolkit:DrawToolkit
    @inject(REGISTRY.Quantizer) quantizer:Quantizer
    @inject(REGISTRY.FFT) fft:FFT
    @Ref('spectrum') readonly canvasspec!: HTMLCanvasElement
    @Ref('wrapper-spectrum') readonly wrapperSpectrum!:HTMLDivElement
    @Ref('hover') readonly canvashov!:HTMLCanvasElement

    private sample:AudioBuffer
    private data:Float64Array
    private quantizedFFT:LogPoint[]
    private graphicFreq: number[] = [100, 1000, 10000]
    private textFreq:string[] = ['100', '1k', '10k'] // frequency references
    private freqbounds:number[] = [20, 20000]
    public hover : boolean = true
    private freqBox : FreqBox
    private infoPanel: Panel
    private mainPanel: Panel
    private sampleON:boolean = false // manage mousehover when sample is still loading/offline/not loaded yet

    mounted () {
      this.mainPanel = this.drawtoolkit.setUp(this.canvasspec, 1)
      this.infoPanel = this.drawtoolkit.setUp(this.canvashov, 0.5)

      this.store.sample().subscribe(ab => {
        if (ab) {
          this.mainPanel.reset()
          this.infoPanel.reset()
          this.mainPanel.redraw()
          this.infoPanel.redraw()

          this.freqBox = new FreqBox('', '', 0, 0, false)
          this.infoPanel.add(this.freqBox)
          this.mouseHandler()

          this.sample = ab
          const i = ab.numberOfChannels
          var data = ab.getChannelData(0) // first channel in order to initialize channel variable
          for (let j = 1; j < i; j++) {
            var d = ab.getChannelData(j)
            data.map((a, b) => (a + d[b]) / i)
          }
          this.fft.of(data).then((spectrum:{log:number[], linear:number[]}) => {
            // this.quantizedFFT = spectrum.log.map((x, i) => {
            //   // i must me between 0Hz and sampleRate/2 Hz logarithmically distributed, that means i=256 => frequency 22050
            //   const max = this.sample.sampleRate / 2;
            //   if(i == 0 ) return {magnitude: 0, frequency: 0}
            //   const freq = Math.pow(max,i/spectrum.log.length)
            //   console.log(freq)
            //   return { magnitude: x, frequency: freq }
            // }).filter(x => x.frequency > 20); // ignore lower part of the spectrum, not intresting
            //this.quantizedFFT =  this.quantizer.log(spectrum.linear,2048,this.sample.sampleRate).filter(x => x.frequency > 20);
            this.quantizedFFT = spectrum.linear.map((x,i) => {
              return { magnitude: x, frequency: i * ((this.sample.sampleRate / 2)/spectrum.linear.length) }
            }).filter(x => x.frequency > 50 && x.frequency < 5000); //linear works, checked with Matlab
            let spectra = new Spectra(this.quantizedFFT.map(x => x.magnitude), this.quantizedFFT.map(x => x.frequency))
            this.mainPanel.add(spectra)
            let axis = new Axis(this.textFreq, this.graphicFreq, this.quantizedFFT, this.sample.sampleRate)
            this.freqbounds = [this.quantizedFFT[0].frequency,this.quantizedFFT[this.quantizedFFT.length-1].frequency]
            this.mainPanel.add(axis)
            this.mainPanel.redraw()

            // if spectrum has been computed, analyze it
            this.spectralExtractor.analyze(spectrum.linear).then(se => {
              se.peaks.frequencies.forEach(peak => {
                // peak is in Hz, convert to log position
                const xbin = this.quantizedFFT.findIndex(x => x.frequency > peak) //select next bin
                const xpos  = xbin / this.quantizedFFT.length
                const o = new Line('red', 2, xpos, true)
                this.infoPanel.add(o)
                this.sampleON = true
              })
              this.infoPanel.redraw()              
            })
          }
          )
        }
      })

      
    }

    redraw () {
      this.infoPanel.redraw()
    }

    // mouse event handler
    mouseHandler () {
      if (this.wrapperSpectrum) {
        this.wrapperSpectrum.addEventListener('mousemove', this.onMouseMove)
      }
    }

    onMouseMove (e: MouseEvent) {
      if (this.hover && this.sampleON) {
        this.freqBox.xpos = e.offsetX
        this.freqBox.ypos = e.offsetY
        this.freqBox.visible = true
        let idx = Math.ceil(e.offsetX / this.canvashov.offsetWidth * this.quantizedFFT.length)
        // console.log('canvas width: ' + this.canvashov.offsetWidth + ' mouse:' + e.offsetX + ' id:' + idx)
        let f = this.quantizedFFT[idx].frequency
        this.freqBox.freq = f.toFixed(2).toString() + ' Hz'

        this.redraw()
      }
    }
    hide () {
      this.freqBox.visible = false
      this.redraw()
    }
}
</script>

<style lang="scss" scoped>
  .wrapper {
   height: 285px;
    position: relative; /* add */

}
.spectrum{
 width:100%;
  height:285px;
  position:absolute;
  left: 0;
  top: 0;}

img {
  max-width:100%;
  max-height:100%;
}
</style>
