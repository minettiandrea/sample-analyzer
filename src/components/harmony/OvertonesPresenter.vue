<template>
<v-card class='mx-auto col-12'>
    <v-card-title>
      <v-icon large left color='orange darken-2'>fab fa-itunes-note</v-icon>
      <span class="title font-weight-light">Overtones presenter</span>
    </v-card-title>
    <v-card-text>This is going to draw a pentagram with the overtones of the sound loaded.</v-card-text>
    <div style="background-color:white" ref="scoreh"></div>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import * as Vex from 'vexflow'
import { Component, Ref } from 'vue-property-decorator'

@Component
export default class OvertonesPresenter extends Vue {
    @Ref('scoreh') score!:HTMLDivElement

    mounted () {
      const renderer = new Vex.Flow.Renderer(this.score, Vex.Flow.Renderer.Backends.SVG)
      renderer.resize(1400, 300)
      const context = renderer.getContext()
      const stavetreble = new Vex.Flow.Stave(10, 40, 800)
      stavetreble.addClef('treble')
      stavetreble.setContext(context).draw()
      const stavealto = new Vex.Flow.Stave(10, 120, 800)
      stavealto.addClef('alto')
      stavealto.setContext(context).draw()
      const stavebass = new Vex.Flow.Stave(10, 200, 800)
      stavebass.addClef('bass')
      stavebass.setContext(context).draw()
    }
}
</script>
