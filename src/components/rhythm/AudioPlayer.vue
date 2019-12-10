<template>
      <v-card flat class='col-8 mt-5' style='text-align: center'>
          <v-row>
              <v-progress-linear
                v-model="power"
                color="dark orange"
                height="25"
                reactive
                >
            </v-progress-linear>
          </v-row>
          <v-row align='center' justify='center'>
            <v-col cols="10" sm="2">
                <v-btn text icon color="orange" @click.native='playing ? pause() : play()'>
                <v-icon v-if='!playing || paused'>fas fa-play</v-icon>
                <v-icon v-else>fas fa-pause</v-icon>
                </v-btn>
            </v-col>

            <v-col cols="12" sm="2">
                <v-btn text icon color="orange" @click.native='stop()'>
                <v-icon>fas fa-stop</v-icon>
                </v-btn>
            </v-col>

            <v-col cols="12" sm="2">
                <v-btn text icon color="orange">
                <v-icon>fas fa-backward</v-icon>
                </v-btn>
            </v-col>
                  <v-col cols="6">
        <v-slider dark
          v-model="volume"
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
    volume: 0
    isMuted: false

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
}
</script>
