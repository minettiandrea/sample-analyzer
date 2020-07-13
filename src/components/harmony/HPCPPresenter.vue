<template>
<v-container class='col-12'>
    <v-row align='center' justify='center'>

    <v-card class="mx-auto col-10 mb-5 center">
      <h2>HPCP</h2>
      <canvas height="285" ref='chart' class ='chart'/>
    </v-card>
  </v-row>
</v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Ref } from 'vue-property-decorator'
import { inject } from 'inversify-props'
import { REGISTRY } from '@/ioc/registry'
import { Store } from '@/services/store/store'
import { Chart } from 'chart.js'



@Component
export default class HPCPPresenter extends Vue  {

    @Ref('chart') readonly canvasChart!: HTMLCanvasElement

    @inject(REGISTRY.Store) store:Store

    mounted() {
        this.store.getHCPC().subscribe(hcpc => {

        var ctx = this.canvasChart.getContext('2d');
            if(ctx) {
                var myChart = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'],
                        datasets: [{
                            label: 'Note',
                            data: hcpc || [],
                            backgroundColor: 'rgba(54, 162, 235, 0.2)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        scales: {
                            yAxes: [{
                                ticks: {
                                    beginAtZero: true
                                }
                            }]
                        }
                    }
                });
            }

        })
    }

}
</script>

<style lang="scss" scoped>
.chart{
    width:100%;
}
</style>
