<template>
  <v-card class='mx-auto col-10 mt-5 space-around'>
    <canvas ref='waveform' style='width:inherit'> </canvas>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Ref } from 'vue-property-decorator'
import { inject } from 'inversify-props'
import { REGISTRY } from '@/ioc/registry'
import { Store } from '@/services/store/store'
import { AudioContextProvider } from '../../services/providers/context-provider'

@Component
export default class WaveformPresenter extends Vue {
  @inject(REGISTRY.Store) store:Store
  @Ref('waveform') readonly canvasdom!: HTMLCanvasElement

  private dataArray : Uint8Array
  private data : number[]

  mounted () {
    let canvas : HTMLCanvasElement = this.canvasdom
    let ctx : CanvasRenderingContext2D | null = canvas.getContext('2d')
    this.store.sample().subscribe(s => {
      if (s) {
        this.data = this.filterData(s)
        if (ctx) {
          this.strokeCanvas(ctx)
        }
      }
    })
  }

  filterData (audiobuffer : AudioBuffer) : number[] { // something like sampling again
    const data = audiobuffer.getChannelData(0) // left channel? maybe taking the average
    const bars = 16000 // number of bars to plot
    const blocksize = Math.floor(data.length / bars) // how many samples in each block
    var dataf : number [] = [] // initialize the output

    for (let i = 0; i < bars; i++) { // for each bar
      let blockbegins = blocksize * i
      let sum = 0

      for (let j = 0; j < blocksize; j++) { // in each bar I sum up the values of each sample
        sum = sum + Math.abs(data[blockbegins + j])
        // sum
      }
      dataf.push(sum / blocksize) // pushes the average of each block into an array
    }
    const factor = Math.max(...dataf)
    dataf = dataf.map(n => n * (1 / factor)) // average respect to the max
    return dataf
  }

  strokeCanvas (ctx : CanvasRenderingContext2D) {
    let canvas : HTMLCanvasElement = this.canvasdom
    const dpr = window.devicePixelRatio || 1
    canvas.width = canvas.offsetWidth * dpr
    canvas.height = (canvas.offsetHeight) * dpr
    ctx.scale(dpr, dpr)
    ctx.translate(0, canvas.offsetHeight / 2) // Set Y = 0 to be in the middle of the canvas

    const width = canvas.offsetWidth / this.data.length
    const padding = 10
    for (let i = 0; i < this.data.length; i++) {
      let x = i * width
      let y = this.data[i] * (canvas.offsetHeight / 2) - padding

      this.drawLine(ctx, x, y)
    }
  }

  drawLine (ctx : CanvasRenderingContext2D, x : number, y : number) {
    ctx.lineWidth = 0.5
    ctx.strokeStyle = 'orange'
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, -y)

    ctx.lineTo(x, y)

    ctx.stroke()
  }
}

</script>
