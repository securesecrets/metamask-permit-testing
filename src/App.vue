<script setup lang="ts">
import { 
  signAminoPermitWithMetamask$,
  requestMetamaskAccounts$,
 } from '@/metamask';
import { createSignDoc, createAccountPermit } from '@/permit';
import { ref } from 'vue';
import { AccountPermit, PermitSignature } from "./types";
import { permitQuery$ } from "./services";
const signature = ref({})

function approve() {
  requestMetamaskAccounts$().subscribe();
}

function sign() {
  const signDoc = createSignDoc('shade-master-permit', 'pulsar-2')
  signAminoPermitWithMetamask$(signDoc).subscribe({
    next: (response) => {
      console.log(response)
      signature.value = response.signature;
    }
  }
  )
}

const accountPermit = ref({});

function formPermit() {
  accountPermit.value = createAccountPermit(
    signature.value as unknown as PermitSignature,
    'shade-master-permit', 
    'pulsar-2'
    )
}

// MODIFY the message structure in ./services.ts

function queryContract() {
  permitQuery$({
    permit: accountPermit.value as AccountPermit,
    contractAddress: 'TBD', // CHANGE THIS
  }).subscribe({
    next: (response) => {
      console.log(response)
    }
  })
}

</script>
<template>
<div class="container">
  <button @click="approve" class="btn">
    approve metamask connection (1 time setup)
  </button>
  <button @click="sign" class="btn">
    Sign Permit
  </button>  
  <div class="permit">
    {{  signature }}
  </div>
  <button @click="formPermit" class="btn">
    Form Permit
  </button>  
  <div class="permit">
    {{  accountPermit }}
  </div>
  <button @click="queryContract" class="btn">
    Query Contract
  </button> 
</div>
</template>
<style lang='scss'>
  .container {
    display: flex;
    flex-direction: column;
  }
  .btn {
    width: 200px;
    margin-bottom: 10px;
  }
</style>


