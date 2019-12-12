<template>
  <v-card class='mx-auto col-10 mt-5 space-around'>
    <v-card-title>
      <v-icon large left></v-icon>
      <span class="title font-weight-light">Show waveform</span>
    </v-card-title>
    <canvas ref='waveform'> </canvas>
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
  @inject(REGISTRY.AudioContextProvider) ctx:AudioContextProvider
  @Ref() readonly canvasdom!: HTMLCanvasElement

  private sourceNode : AudioBufferSourceNode = this.ctx.context().createBufferSource() // for audio
  private dataArray : Uint8Array
  private drawing : CanvasRenderingContext2D | null

  created () {
    this.store.sample().subscribe(s => {
      if (s) {
        this.filterData(s)
      }
    })  }
  
  filterData(audiobuffer : AudioBuffer) : number[]{ //something like sampling again
    
    const data = audiobuffer.getChannelData(0) //left channel? maybe taking the average
    const bars = 50 //number of bars to plot
    const blocksize = Math.floor(data.length/bars) // how many samples in each block
    const filteredData = [] //initialize the output
    
    for (let i=0;i<bars; i++){ //for each bar
      let blockbegins = blocksize * i
      let sum = 0

      for(let j=0; j < blocksize; j++){ // in each bar I sum up the values of each sample
        sum = sum + Math.abs(data[blockbegins+j]) //sum
      }
      filteredData.push(sum / blocksize) // pushes the average of each block into an array
    }
      const factor = Math.max(...filteredData);
      filteredData.map(n => n * 1/factor); // average respect to the max 
      return filteredData

  }

  mounted () {

   if (this.canvasdom.getContext('2d')){
     this.drawing = this.canvasdom.getContext('2d')
   }


    
  }
}
}
</script>
