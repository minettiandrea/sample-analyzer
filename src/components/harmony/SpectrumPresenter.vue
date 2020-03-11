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
import { DummySpectralExtractor } from '@/services/spectral-extractor/spectral-extractor-impl'
import { DrawToolkit, Drawer } from '../../services/providers/draw-toolkit'
import { FreqBox } from '../../drawables/freqBox'
import { Quantizer, LogPoint } from '../../services/providers/quantizer'
import { FFT } from '@/services/providers/fft'

@Component
export default class SpectrumPresenter extends Vue {
    @inject(REGISTRY.SpectralExtractor) spectralExtractor: DummySpectralExtractor;
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
    private infoPanel: Drawer

    mounted () {
      this.store.sample().subscribe(ab => {
        if (ab) {
          this.sample = ab
          const i = ab.numberOfChannels
          var data = ab.getChannelData(0) // first channel in order to initialize channel variable
          for (let j = 1; j < i; j++) {
            var d = ab.getChannelData(j)
            data.map((a, b) => (a + d[b]) / i)
          }

          this.FFT = this.fft.of(data)
          this.drawtoolkit.setUp(this.canvasspec, 1)

          this.infoPanel = this.drawtoolkit.setUp(this.canvashov, 0.5)
          this.freqBox = new FreqBox('', '', 0, 0, false, this.canvashov.offsetWidth)
          this.infoPanel.add(this.freqBox)

          this.mouseHandler()
          this.draw()
        }
      })
    }
    draw () { // 2nd canvas -> plots spectrum
      let ctx = this.canvasspec.getContext('2d')
      if (ctx) {
        ctx.translate(0, this.canvasspec.offsetHeight - 20) // canvas y axis to be on the bottom of the canvas |_|
        let q = this.quantizer.log(this.FFT, 1 / 64, 40, this.sample.sampleRate)
        let yaxis = q.map(x => x.magnitude)
        this.quantizedFFT = q
        // let yaxis = this.quantizer.lin(this.FFT, 8000)
        const maxin = Math.max(...yaxis)
        const minin = Math.min(...yaxis)
        const maxout = 10
        const minout = 1
        yaxis = yaxis.map((a) => {
          return (a - minin) * (maxout - minout) / (maxin - minin) + minout
        })
        const width = Math.ceil(this.canvasspec.offsetWidth / yaxis.length)
        const height = this.canvasspec.offsetHeight
        const padding = 0
        for (let i = 0; i < yaxis.length; i++) {
          let x = i * width
          let y = Math.log10(yaxis[i]) * height - padding
          this.drawLine(ctx, x, y)
        }
        // axis
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(this.canvasspec.offsetWidth - 1, 0)
        ctx.stroke()
        ctx.moveTo(0, 0)
        ctx.lineTo(0, -this.canvasspec.offsetHeight - 1)
        ctx.stroke()
        // frequencies
        for (let j = 0; j < this.graphicFreq.length; j++) {
          if (this.graphicFreq[j] < this.sample.sampleRate) {
            let widthpx = this.canvasspec.offsetWidth // px width

            let minDelta = Math.min(...q.map(x => Math.abs(x.frequency - this.graphicFreq[j])))
            let idx = q.findIndex(x => x.frequency + minDelta === this.graphicFreq[j] || x.frequency - minDelta === this.graphicFreq[j])

            let pos = Math.floor(idx / q.length * widthpx)
            ctx.lineWidth = 3
            ctx.strokeStyle = 'black'
            ctx.beginPath()
            ctx.moveTo(pos, -4)
            ctx.lineTo(pos, 4)
            ctx.stroke()
            ctx.lineWidth = 0.5
            ctx.font = '8px verdana'
            ctx.strokeText(this.textFreq[j], pos - 5, 15)
          }
        }
      }
    }

    redraw () {
      this.infoPanel.redraw()
    }

    drawLine (ctx : CanvasRenderingContext2D, x : number, y : number) {
      ctx.lineWidth = 0.5
      ctx.strokeStyle = '#232c33'
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, -y)
      ctx.stroke()
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
        let idx = Math.ceil(e.offsetX / this.canvashov.offsetWidth * this.quantizedFFT.length)
        let f = this.quantizedFFT[idx].frequency
        this.freqBox.freq = f.toFixed(2).toString() + ' Hz'
        this.freqBox.amplitude = '200'

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
