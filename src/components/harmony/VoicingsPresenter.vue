<template>
  <v-card class='mx-auto col-10 mt-5 space-around'>
    <v-card-title>
      <v-icon large left></v-icon>
      <span class="title font-weight-light">Suggested voicing</span>
    </v-card-title>
    <v-card-text>
      Suggested voicing for specific sound loaded
      <ul>
        <li v-for="(voicing,i) in voicings" :key="i">{{voicing.group}} - {{voicing.name}} - {{voicing.chord}}</li>
      </ul>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import { inject } from 'inversify-props'
import { REGISTRY } from '@/ioc/registry'
import { Store } from '@/services/store/store'

export interface VoicingDefinition{
  group:string
  chord: number[]
  name: string
}

@Component
export default class VoicingsPresenter extends Vue {

  @inject(REGISTRY.Store) store:Store

  public voicings:VoicingDefinition[] = []

  private definitions = [
    {group: "min", chord: [0, 3, 10], name: "1 - b3 - b7 (no fifth)"},
    {group: "min", chord: [-9, -2, 0], name: "1st inversion (b3 as bass)"},
    {group: "min", chord: [-5, 0, 3, 10], name: "2nd inversion (5th as bass)"},
    {group: "min", chord: [-2, 0, 3], name: "3rd inversion (7th as bass)"},
    {group: "maj", chord: [0, 4, 10], name: "1 - 3 - 7 (no fifth)"},
    {group: "maj", chord: [-8, -1, 0], name: "1st inversion (3 as bass)"},
    {group: "maj", chord: [-5, 0, 4, 11], name: " 2nd inversion (5th as bass)"},
    {group: "maj", chord: [-1, 0, 4], name: "3rd inversion (7th as bass)"},
    {group: "dom", chord: [0, 4, 10], name: "1 - 3 - b7 (no fifth)"},
    {group: "dom", chord: [-8, -2, 0], name: "1st inversion (3 as bass)"},
    {group: "dom", chord: [-5, 0, 4, 10], name: "2nd inversion (5th as bass)"},
    {group: "dom", chord: [-2, 0, 4], name: "3rd inversion (7th as bass)"},
  ]



  mounted() {
    this.store.getHCPC().subscribe(hcpc => {
      if(hcpc) {
        const foundamental = hcpc.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0) //find the max index
        const voicings = this.definitions.map(x => {
          return {chord: x, score: x.chord.map(y => hcpc[(y+12+foundamental) % 12] ).reduce((x,y) => x + y)}
        }).sort((x,y) =>  y.score - x.score).slice(0,3)
        console.log(voicings)
        this.voicings = voicings.map(x => x.chord)
      }
    })
  }

}
</script>
