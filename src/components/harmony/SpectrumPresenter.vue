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
    private FFT:number[]
    private quantizedFFT:LogPoint[]
    private graphicFreq: number[] = [100, 1000, 10000]
    private textFreq:string[] = ['100', '1k', '10k'] // frequency references
    private freqbounds:number[] = [20, 20000]
    public hover : boolean
    private freqBox : FreqBox
    private infoPanel: Panel
    private mainPanel: Panel

    mounted () {
      this.mainPanel = this.drawtoolkit.setUp(this.canvasspec, 1)
      this.store.sample().subscribe(ab => {
        if (ab) {
          this.mainPanel.reset()

          this.sample = ab
          const i = ab.numberOfChannels
          var data = ab.getChannelData(0) // first channel in order to initialize channel variable
          for (let j = 1; j < i; j++) {
            var d = ab.getChannelData(j)
            data = data.map((a, b) => (a + d[b]) / i)
          }

          this.FFT = this.fft.of(data)
          this.quantizedFFT = this.quantizer.log(this.FFT, 1 / 64, 40, ab.sampleRate)
          let spectra = new Spectra(this.quantizedFFT.map(x => x.magnitude), this.quantizedFFT.map(x => x.frequency))
          this.mainPanel.add(spectra)
          let axis = new Axis(this.textFreq, this.graphicFreq, this.quantizedFFT, this.sample.sampleRate)
          this.mainPanel.add(axis)
          this.spectralExtractor.analyze(data).then(se => {
            se.peaks.forEach(peak => {
              let xpos = Math.log10(2 * peak) / Math.log10(this.sample.sampleRate)
              let o = new Line('red', 2, xpos, true)
              this.infoPanel.add(o)
            })
          }
          )
          this.infoPanel.redraw()
        }
      })
      this.mainPanel.redraw()

      this.infoPanel = this.drawtoolkit.setUp(this.canvashov, 0.5)
      this.freqBox = new FreqBox('', '', 0, 0, false)
      this.infoPanel.add(this.freqBox)
      this.mouseHandler()
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
      if (this.hover) {
        this.freqBox.xpos = e.offsetX
        this.freqBox.ypos = e.offsetY
        this.freqBox.visible = true
        let idx = Math.ceil(e.offsetX / this.canvashov.width * this.quantizedFFT.length)
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
