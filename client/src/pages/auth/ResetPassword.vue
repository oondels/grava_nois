<template>
  <div>
    <input type="password" v-model="newPassword" placeholder="Nova Senha" />
    <button @click="submitLogin" :disabled="loadingAuth">Mudar Senha</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "@/store/auth";

const auth = useAuthStore();


const loadingAuth = ref(false);
const showPassword = ref(false);
const newPassword = ref("");

const submitLogin = async () => {
  loadingAuth.value = true;
  try {
    await auth.updatePassword(newPassword.value);
  } catch (error: any) {
    console.error('signIn error:', error)
  } finally {
    loadingAuth.value = false;
  }
};
</script>

<style scoped></style>
