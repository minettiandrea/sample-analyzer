<template>
<v-container class='col-12'>
    <v-row align='center' justify='center'>

    <v-card class="mx-auto col-10 mb-5 center">
        <div class='wrapper'
          ref='wrapper-spectrum'>
          <canvas ref='spectrum' class='spectrum'> </canvas>
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
import { FFTR } from 'kissfft-js'

@Component
export default class SpectrumPresenter extends Vue {
    @inject(REGISTRY.SpectralExtractor) spectralExtractor: DummySpectralExtractor;
    @inject(REGISTRY.Store) store:Store

    @Ref('spectrum') readonly canvasspec!: HTMLCanvasElement

    private sample:AudioBuffer
    private data:Float64Array
    private FFT:number[]

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
          const fftr = new FFTR(data.length)
          this.FFT = fftr.forward(Array.from(data))
          this.setUp(this.canvasspec, 1)
          this.draw()
        }
      })
    }

    filterData (FFT: number[]) {
      const bars = 1024 // number of bars to plot
      const blocksize = Math.floor(this.FFT.length / bars) // how many samples in each block
      var dataf : number [] = [] // initialize the output

      for (let i = 0; i < bars; i++) { // for each bar
        let blockbegins = blocksize * i
        let sum = 0

        for (let j = 0; j < blocksize; j++) { // in each bar I sum up the values of each sample
          sum = sum + Math.abs(FFT[blockbegins + j])
        // sum
        }
        dataf.push(sum / blocksize) // pushes the average of each block into an array
      }
      const factor = Math.max(...dataf)
      dataf = dataf.map(n => n * (1 / factor)) // average respect to the max

      return { yaxis: dataf, xaxis: bars }
    }

    draw () {
      let ctx = this.canvasspec.getContext('2d')

      if (ctx) {
        ctx.translate(0, this.canvasspec.offsetHeight) // canvas y axis to be on the bottom of the canvas |_|
        let { yaxis, xaxis } = this.filterData(this.FFT)
        const width = Math.ceil(this.canvasspec.offsetWidth / xaxis)
        const height = this.canvasspec.offsetHeight
        const padding = 5

        for (let i = 0; i < yaxis.length; i++) {
          let x = i * width
          let y = yaxis[i] * height - padding
          this.drawLine(ctx, x, y)
        }
      }
    }
    drawLine (ctx : CanvasRenderingContext2D, x : number, y : number) {
      ctx.lineWidth = 0.5
      ctx.strokeStyle = 'blue'
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, -y)
      ctx.stroke()
    }

    setUp (canvas : HTMLCanvasElement, alpha : number) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        const dpr = window.devicePixelRatio || 1
        canvas.width = canvas.offsetWidth * dpr
        canvas.height = (canvas.offsetHeight) * dpr
        ctx.scale(dpr, dpr)
        ctx.globalAlpha = alpha
      }
    }
}
</script>

<style lang="scss" scoped>
  .wrapper {
   height: 275px;
}

.spectrum{
  width:100%;
  height:275px;
}
</style>
