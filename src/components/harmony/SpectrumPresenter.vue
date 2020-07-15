<template>
<v-container class='col-12'>
    <v-row align='center' justify='center'>

    <v-card class="mx-auto col-10 mb-5 center">
      <h2>Spectrum</h2>
        <div class='wrapper'
          ref='wrapper-spectrum'
          @mouseover="hover = true"
          @mouseleave="hide" >
          <canvas ref='hover' class ='spectrum'/>
          <canvas ref='spectrum' class='spectrum'>
          </canvas>
        </div>
        <div>
          <v-radio-group v-model="log" row @change="drawSpectrum()">
            <v-radio label="Log" :value="true"></v-radio>
            <v-radio label="Lin" :value="false"></v-radio>
          </v-radio-group>
        </div>
        <div>
          <v-range-slider
            v-model="freqRange"
            :max="maxFreq"
            :min="minFreq"
            hide-details
            class="align-center"
            @change="drawSpectrum()"
          >
            <template v-slot:prepend>
              <v-text-field
                :value="freqRange[0]"
                class="mt-0 pt-0"
                hide-details
                single-line
                type="number"
                style="width: 60px"
                @change="$set(freqRange, 0, $event)"
              ></v-text-field>
            </template>
            <template v-slot:append>
              <v-text-field
                :value="freqRange[1]"
                class="mt-0 pt-0"
                hide-details
                single-line
                type="number"
                style="width: 60px"
                @change="$set(freqRange, 1, $event)"
              ></v-text-field>
            </template>
          </v-range-slider>
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
import { SpectrumPoint } from '../../services/providers/quantizer'
import { Line } from '../../drawables/line'
import { virtualCanvas } from '@/drawables/utils/logUtils'
import { SpectralAnalisis } from '../../services/spectral-extractor/spectral-extractor'
import { find } from 'rxjs/operators'

@Component
export default class SpectrumPresenter extends Vue {
    @inject(REGISTRY.Store) store:Store
    @inject(REGISTRY.DrawToolkit) drawtoolkit:DrawToolkit
    @Ref('spectrum') readonly canvasspec!: HTMLCanvasElement
    @Ref('wrapper-spectrum') readonly wrapperSpectrum!:HTMLDivElement
    @Ref('hover') readonly canvashov!:HTMLCanvasElement

    private sample:AudioBuffer
    private data:Float64Array
    private originalFFT:SpectrumPoint[]
    private filteredFFT:SpectrumPoint[]
    private spectralPeaks:number[]
    private graphicFreq: number[] = [100, 1000, 10000]
    private textFreq:string[] = ['100', '1k', '10k'] // frequency references
    public hover : boolean = true
    private freqBox : FreqBox
    private infoPanel: Panel
    private mainPanel: Panel
    private sampleON:boolean = false // manage mousehover when sample is still loading/offline/not loaded yet
    private minFreq:number = 20
    private maxFreq:number = 20000
    private freqRange:number[] = [40, 10000]
    private log:boolean = true

    mounted () {
      this.mainPanel = this.drawtoolkit.setUp(this.canvasspec, 1)
      this.infoPanel = this.drawtoolkit.setUp(this.canvashov, 0.5)
      this.mouseHandler()

      this.store.sample().subscribe(ab => {
        if (ab) {
          this.mainPanel.reset()
          this.infoPanel.reset()

          this.maxFreq = ab.buffer.sampleRate / 2
          this.freqRange = [40, this.maxFreq]
          this.sample = ab.buffer

          this.store.getFFT().pipe(find(x => x != null)).subscribe(fft => {
            if (fft) {
              this.originalFFT = fft
              this.store.getSpectralPeaks().pipe(find(x => x != null)).subscribe(sp => {
                if (sp) {
                  this.spectralPeaks = sp
                  this.drawSpectrum()
                }
              })
            }
          })
        }
      })
    }

    drawSpectrum () {
      this.mainPanel.reset()
      this.infoPanel.reset()

      this.freqBox = new FreqBox('', '', 0, 0, false)
      this.infoPanel.add(this.freqBox)

      this.filteredFFT = this.originalFFT.filter(x => x.frequency < this.freqRange[1]) // linear works, checked with Matlab
      if (!this.log) {
        this.filteredFFT = this.filteredFFT.filter(x => x.frequency > this.freqRange[0])
      }
      let spectra = new Spectra(this.filteredFFT, this.freqRange[0], this.log)
      this.mainPanel.add(spectra)
      let axis = new Axis(this.textFreq, this.graphicFreq, this.filteredFFT, this.freqRange[1], this.freqRange[0], this.log)
      this.mainPanel.add(axis)
      this.mainPanel.redraw()

      this.spectralPeaks.forEach(peak => {
        // peak is in Hz, convert to log position
        const start = this.filteredFFT.findIndex(x => x.frequency > this.freqRange[0]) // select next bin
        const xbin = this.filteredFFT.findIndex(x => x.frequency > peak)
        const xpos = xbin / this.filteredFFT.length
        if (this.log) {
          const o = new Line('red', 2, xpos, true, start, this.filteredFFT.length)
          this.infoPanel.add(o)
        } else {
          const o = new Line('red', 2, xpos, true)
          this.infoPanel.add(o)
        }

        this.sampleON = true
      })
      this.infoPanel.redraw()
    }

    // mouse event handler
    mouseHandler () {
      if (this.wrapperSpectrum) {
        this.wrapperSpectrum.addEventListener('mousemove', this.onMouseMove)
      }
    }

    onMouseMove (e: MouseEvent) {
      if (this.freqBox && this.hover && this.sampleON) {
        this.freqBox.xpos = e.offsetX * this.canvashov.width / this.canvashov.offsetWidth
        this.freqBox.ypos = e.offsetY
        this.freqBox.visible = true

        if(this.log) {
          const start = this.filteredFFT.findIndex(x => x.frequency > this.freqRange[0])
          const sizing = virtualCanvas(this.canvashov.width, start, this.filteredFFT.length)

          // Inversion of line.ts:35
          let f = Math.exp((this.freqBox.xpos - sizing.width - sizing.offset) * Math.log(sizing.width) / sizing.width) * this.freqRange[1]

          this.freqBox.freq = f.toFixed(2).toString() + ' Hz'
        } else {

          let f = e.offsetX / this.canvashov.offsetWidth * (this.freqRange[1] - this.freqRange[0]) + this.freqRange[0]
          this.freqBox.freq = f.toFixed(2).toString() + ' Hz'
        }

        this.infoPanel.redraw()
      }
    }
    hide () {
      if (this.freqBox) {
        this.freqBox.visible = false
        this.infoPanel.redraw()
      }
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
