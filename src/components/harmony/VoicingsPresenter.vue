<template>
  <v-card class='mx-auto col-10 mt-5 space-around'>
    <v-card-title>
      <v-icon large left></v-icon>
      <span class="title font-weight-light">Suggested voicing</span>
    </v-card-title>
    <v-card-text>Suggested voicing for specific sound loaded</v-card-text>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import { inject } from 'inversify-props'

@Component
export default class VoicingsPresenter extends Vue {
  private min7:number[][] = [[0, 3, 10], // 1 - b3 - b7 (no fifth)
    [-9, -2, 0], // 1st inversion (b3 as bass)
    [-5, 0, 3, 10], // 2nd inversion (5th as bass)
    [-2, 0, 3] // 3rd inversion (7th as bass)
  ]

    private maj7:number[][] = [[0, 4, 10], // 1 - 3 - 7 (no fifth)
      [-8, -1, 0], // 1st inversion (3 as bass)
      [-5, 0, 4, 11], // 2nd inversion (5th as bass)
      [-1, 0, 4] // 3rd inversion (7th as bass)
    ]

      private dom7:number[][] = [[0, 4, 10], // 1 - 3 - b7 (no fifth)
        [-8, -2, 0], // 1st inversion (3 as bass)
        [-5, 0, 4, 10], // 2nd inversion (5th as bass)
        [-2, 0, 4] // 3rd inversion (7th as bass)
      ]
}
</script>
