<template>
      <v-card flat class='col-10 mt-5' style='text-align: center'>
          <v-row>
              <v-progress-linear
                v-model='sampletime'
                color="dark orange"
                height="20"
                >
            </v-progress-linear>
          </v-row>
          <v-row align='center' justify='center' class='col-12'>
            <v-col cols="2">
                <v-btn text icon color="orange" @click.native='playing ? pause() : play()'>
                <v-icon v-if='!playing || paused'>fas fa-play</v-icon>
                <v-icon v-else>fas fa-pause</v-icon>
                </v-btn>
            </v-col>

            <v-col cols="2">
                <v-btn text icon color="orange" @click.native='stop()'>
                <v-icon>fas fa-stop</v-icon>
                </v-btn>
            </v-col>

            <v-col cols="2">
                <v-btn text icon color="orange" @click.native='restart()'>
                <v-icon>fas fa-backward</v-icon>
                </v-btn>
            </v-col>

            <v-col cols="4">
              <v-slider dark
              v-model='volume'
              color='orange'
              class='mt-2'
              ></v-slider>
            </v-col>

          </v-row>
    </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component } from 'vue-property-decorator'

@Component
export default class AudioPlayer extends Vue {
    playing: boolean = false
    paused: boolean = true
    volume: number = 0
    sampletime: number = 5 // is going to change according to sample length (in ms?)

    play () {
      this.paused = false
      this.playing = true // then it will also play the audio file
    }

    pause () {
      this.paused = !this.paused
    }

    stop () {
      this.paused = this.playing = false
    }

    restart () {
      this.paused = false
      this.sampletime = 0
      this.playing = true // changes the model, need to trigger audio
    }
}
</script>
