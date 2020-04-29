<template>
  <v-card class='mx-auto col-12 mt-5 space-around'>
    <v-simple-table>
      <template v-slot:default>
        <thead>
          <tr>
            <th class="text-left">BPM</th>
            <th class="text-left">Time signature</th>
          </tr>
        </thead>
        <tbody>
        </tbody>
      </template>
    </v-simple-table>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import { inject } from 'inversify-props'
import { REGISTRY } from '@/ioc/registry'
import { Store } from '@/services/store/store'
import { TimeExtractor } from '@/services/time-extractor/time-extractor'

@Component
export default class SignaturePresenter extends Vue {
  @inject(REGISTRY.Store) store:Store
  @inject(REGISTRY.TimeExtractor) extractor:TimeExtractor

  created () {
    this.store.sample().subscribe(s => {
      //this.extractor.analyze()
    })
  }

}
</script>
