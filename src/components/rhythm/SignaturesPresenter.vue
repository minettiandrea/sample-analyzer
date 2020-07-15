<template>
<v-container class='col-12' >
  <v-row align='center' justify='center'>
    <v-card class='mx-auto col-10 mt-5 space-around'>
      <v-simple-table>
        <template v-slot:default>
          <thead>
            <tr>
              <th class="text-left">BPM</th>
              <th class="text-left">Swing</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(signature,i) in signatures" :key="i">
              <td>{{signature.bpm}}</td>
              <td>{{signature.swing.toFixed(2)}}</td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
  </v-card>
  </v-row>
</v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import { inject } from 'inversify-props'
import { REGISTRY } from '@/ioc/registry'
import { Store } from '@/services/store/store'
import { max } from 'rxjs/operators'

interface TimeSignature{
  bpm:number,
  swing: number
}

@Component
export default class SignaturePresenter extends Vue {
  @inject(REGISTRY.Store) store:Store

  minBpm = 40
  maxBpm = 320

  swing = 0.05
  peaks:number[] = []

  signatures:TimeSignature[] = []

  calculateSignatures () {
    if (this.peaks.length > 1) {
      const base = this.peaks[0]
      for (let bpm = this.minBpm; bpm < this.maxBpm; bpm += 0.5) {
        const quarter = 60 / bpm // quarter length in seconds
        const swingAmount = quarter * this.swing
        const swings = this.peaks.map((time, i) => time - (base + i * quarter))
        const maxSwing = Math.max(...swings.map(x => Math.abs(x)))
        if (maxSwing < swingAmount) {
          this.signatures.push({
            bpm: bpm,
            swing: maxSwing
          })
        }
      }
    }
  }

  created () {
    this.store.timeAnalysis().subscribe(ta => {
      this.signatures = []
      if (ta) {
        this.peaks = ta.peaks
        this.calculateSignatures()
      }
    })
  }

}
</script>
