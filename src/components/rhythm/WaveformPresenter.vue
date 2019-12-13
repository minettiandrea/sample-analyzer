<template>
<v-container class='col-12' >
  <v-row align='center' justify='center'>
  <v-card class='mx-auto col-10 mt-5 space-around'>
    <div class='wrapper'>
      <canvas ref='waveform' class='waveform'>
      </canvas>
      <canvas ref='waveformchild' class='waveform'> </canvas>
    </div>
  </v-card>
  </v-row>
  <v-row align='center' justify='center'>
      <AudioPlayer  v-on:isPlaying='drawPlaying' />
  </v-row>
</v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import AudioPlayer from './AudioPlayer.vue'

import { Component, Ref } from 'vue-property-decorator'
import { inject } from 'inversify-props'
import { REGISTRY } from '@/ioc/registry'
import { Store } from '@/services/store/store'
import { AudioContextProvider } from '../../services/providers/context-provider'

@Component({
  components: { AudioPlayer
  }

})
export default class WaveformPresenter extends Vue {
  @inject(REGISTRY.Store) store:Store
  @Ref('waveform') readonly canvasdom!: HTMLCanvasElement
  @Ref('waveformchild') readonly canvasalpha!: HTMLCanvasElement

  private dataArray : Uint8Array
  private data : number[]
  private context : CanvasRenderingContext2D | null
  private xpos : number
  private ypos : number

  mounted () {
    let canvas : HTMLCanvasElement = this.canvasdom
    let ctx : CanvasRenderingContext2D | null = canvas.getContext('2d')
    this.store.sample().subscribe(s => {
      if (s) {
        this.data = this.filterData(s)
        if (ctx) {
          this.context = ctx
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
    this.setUp(canvas, ctx)
    ctx.translate(0, canvas.offsetHeight / 2) // Set Y = 0 to be in the middle of the canvas

    const width = canvas.offsetWidth / this.data.length
    const height = canvas.offsetHeight
    const padding = 10
    for (let i = 0; i < this.data.length; i++) {
      let x = i * width
      let y = this.data[i] * (height / 2) - padding

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

  drawPlaying (length : number, current : number, fs : number) { // emitted, check in audioplayer play() function
    let ctx = this.canvasalpha.getContext('2d')
    var width = this.canvasalpha.offsetWidth
    let height = this.canvasalpha.offsetHeight

    const blocksize = Math.floor(width / 100)
    var previousblock : number = 0

    if (ctx) {
      this.setUp(this.canvasalpha, ctx)
      ctx.globalAlpha = 0.2
    }

    let it = setInterval(() => {
      if (ctx && previousblock < width) {
        ctx.fillStyle = 'orange'
        ctx.beginPath()
        ctx.fillRect(previousblock, 0, blocksize, height)

        if (previousblock > 0) {
          ctx.clearRect(previousblock - blocksize, 0, blocksize, height)
        }
        previousblock += blocksize
      } else if (ctx && previousblock >= width) {
        ctx.clearRect(0, 0, width, height)
        clearInterval(it)
      }
    }, Math.ceil(length * 1000 / (this.canvasalpha.offsetWidth / Math.floor(this.canvasalpha.offsetWidth / 100))))
  }

  setUp (canvas : HTMLCanvasElement, ctx : CanvasRenderingContext2D) {
    const dpr = window.devicePixelRatio || 1
    canvas.width = canvas.offsetWidth * dpr
    canvas.height = (canvas.offsetHeight) * dpr
    ctx.scale(dpr, dpr)
  }
}

</script>

<style lang="scss" scoped>

  .wrapper {
    height: 275px;
   position: relative; /* add */
}
.waveform{

  width:100%;
  height:275px;
  position:absolute;
   left: 0;
   top: 0;
}
</style>
