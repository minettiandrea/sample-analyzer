<template>
  <div class="text-center">
    <v-dialog
      v-model="dialog"
    >
      <template v-slot:activator="{ on }">
        <v-btn
          color="orange accent-2"
          dark
          v-on="on"
        >
         Legend
        </v-btn>
      </template>

      <v-card>
        <v-card-title
          class="headline grey lighten-2"
          primary-title
        >
          Legend
        </v-card-title>

        <v-card-text>
            <v-list-item color='blue'>
              <v-icon color='blue' class='fas fa-square-full'></v-icon>
              <v-list-item-title>  Peaks </v-list-item-title>
              <v-icon color='red' class='fas fa-square-full'></v-icon>
              <v-list-item-title>  Actual Sample </v-list-item-title>

            </v-list-item>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="yellow"
            text
            @click="dialog = false"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>s

<script lang="ts">
import Vue from 'vue'
import { Component } from 'vue-property-decorator'

@Component
export default class Legend extends Vue {
    private dialog:boolean = false
}

</script>
