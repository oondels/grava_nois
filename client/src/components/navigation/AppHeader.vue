<template>
  <!-- Link de acessibilidade para pular para o conteúdo principal -->
  <a
    href="#main"
    class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-red-500 text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
  >
    Pular para o conteúdo
  </a>

  <!-- Header desktop com fundo translúcido -->
  <header
    ref="headerRef"
    class="fixed top-0 left-0 right-0 z-40 transition-all duration-300"
    :class="[
      'backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-900/10 dark:border-white/10',
      { 'shadow-sm': isScrolled }
    ]"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div 
        class="flex items-center justify-between transition-all duration-300"
        :class="[isScrolled ? 'h-16' : 'h-20']"
      >
        <!-- Logo -->
        <div class="flex-shrink-0">
          <router-link to="/" class="flex items-center">
            <img 
              :src="LogoGravaNois" 
              alt="Grava Nóis" 
              class="transition-all duration-300"
              :class="[isScrolled ? 'h-8' : 'h-10']"
            />
          </router-link>
        </div>

        <!-- Navegação principal -->
        <nav class="flex items-center" role="navigation" aria-label="Navegação principal">
          <div class="flex space-x-1">
            <NavLink 
              v-for="item in navigationItems" 
              :key="item.to"
              :to="item.to"
              :label="item.label"
              variant="desktop"
              :disabled="item.disabled"
              :tooltip="item.tooltip"
            />
          </div>
        </nav>
      </div>
    </div>
  </header>

  <!-- Espaçador para compensar o header fixo -->
  <div :class="[isScrolled ? 'h-16' : 'h-20']"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import NavLink from './NavLink.vue';
import LogoGravaNois from '@/assets/icons/grava-nois.png';

// Estado para controlar a aparência do header durante o scroll
const isScrolled = ref(false);
const headerRef = ref<HTMLElement | null>(null);
const lastScrollTop = ref(0);
const headerVisible = ref(true);

// Items de navegação
const navigationItems = [
  { label: 'Clipes', to: '#how' },
  { label: 'Sobre', to: '#security' },
  { label: 'Ajuda', to: '#faq' },
  { label: 'Instalar no meu campo', to: '/contato' },
  { 
    label: 'Login', 
    to: '#login', 
    disabled: true, 
    tooltip: 'Em desenvolvimento' 
  }
];

// Função para controlar a aparência do header durante o scroll
const handleScroll = () => {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  
  // Verifica se o usuário rolou abaixo de um determinado limiar para ativar o efeito "shrink"
  isScrolled.value = scrollTop > 20;
  
  // Implementação básica de "headroom" (esconde/mostra o header baseado na direção do scroll)
  if (scrollTop > lastScrollTop.value && scrollTop > 200) {
    // Rolando para baixo & além de 200px = esconde o header
    headerVisible.value = false;
  } else {
    // Rolando para cima ou próximo do topo = mostra o header
    headerVisible.value = true;
  }
  
  // Atualiza a referência para a posição atual do scroll
  lastScrollTop.value = scrollTop;
  
  // Aplica a visibilidade
  if (headerRef.value) {
    headerRef.value.style.transform = headerVisible.value 
      ? 'translateY(0)' 
      : 'translateY(-100%)';
  }
};

// Configura o listener de scroll ao montar o componente
onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true });
});

// Remove o listener ao desmontar o componente
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>
