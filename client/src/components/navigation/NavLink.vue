<template>
  <!-- Link de navegação com suporte a estado ativo, desabilitado e tooltip -->
  <router-link
    v-if="!disabled && !isHashLink"
    :to="to"
    :class="[
      // Base styles
      'group flex items-center transition-all duration-200 outline-none',
      // Variant styles
      variant === 'mobile' ? 'flex-col justify-center text-center py-2 px-1 h-full' : 'py-2 px-3 rounded-md',
      // Active state
      isRouteActive ? 'text-red-500 font-medium' : 'text-slate-800 dark:text-slate-200',
      // Hover & Focus states
      'hover:bg-white/10 focus:bg-white/10 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900'
    ]"
    :aria-current="isRouteActive ? 'page' : undefined"
  >
    <component 
      v-if="icon" 
      :is="resolvedIcon" 
      :class="[
        'w-5 h-5 flex-shrink-0',
        variant === 'mobile' ? 'mb-1' : 'mr-2',
        isRouteActive ? 'text-red-500' : ''
      ]"
      aria-hidden="true"
    />
    <span :class="[variant === 'mobile' ? 'text-xs' : '', isRouteActive ? 'font-medium' : '']">
      {{ label }}
    </span>
  </router-link>

  <a
    v-else-if="!disabled && isHashLink"
    :href="to"
    :class="[
      // Base styles
      'group flex items-center transition-all duration-200 outline-none',
      // Variant styles
      variant === 'mobile' ? 'flex-col justify-center text-center py-2 px-1 h-full' : 'py-2 px-3 rounded-md',
      // Active state
      isRouteActive ? 'text-red-500 font-medium' : 'text-slate-800 dark:text-slate-200',
      // Hover & Focus states
      'hover:bg-white/10 focus:bg-white/10 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900'
    ]"
    :aria-current="isRouteActive ? 'page' : undefined"
  >
    <component 
      v-if="icon" 
      :is="resolvedIcon" 
      :class="[
        'w-5 h-5 flex-shrink-0',
        variant === 'mobile' ? 'mb-1' : 'mr-2',
        isRouteActive ? 'text-red-500' : ''
      ]"
      aria-hidden="true"
    />
    <span :class="[variant === 'mobile' ? 'text-xs' : '', isRouteActive ? 'font-medium' : '']">
      {{ label }}
    </span>
  </a>

  <!-- Link desabilitado com tooltip opcional -->
  <span
    v-else
    :class="[
      // Base styles
      'group flex items-center transition-all duration-200 outline-none cursor-not-allowed opacity-60',
      // Variant styles
      variant === 'mobile' ? 'flex-col justify-center text-center py-2 px-1 h-full' : 'py-2 px-3 rounded-md',
      // Text color
      'text-slate-500 dark:text-slate-400'
    ]"
    aria-disabled="true"
    :title="tooltip"
    :aria-label="`${label} (${tooltip})`"
  >
    <component 
      v-if="icon" 
      :is="resolvedIcon" 
      :class="[
        'w-5 h-5 flex-shrink-0 opacity-75',
        variant === 'mobile' ? 'mb-1' : 'mr-2'
      ]"
      aria-hidden="true"
    />
    <span :class="variant === 'mobile' ? 'text-xs' : ''">
      {{ label }}
    </span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useActiveRoute } from '@/composables/useActiveRoute';
// Importar ícones específicos que serão utilizados
import { Home, Download, HelpCircle } from 'lucide-vue-next';

// Mapeamento dos ícones que podemos usar
const iconMap = {
  'Home': Home,
  'Download': Download,
  'HelpCircle': HelpCircle,
};

interface Props {
  to: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  tooltip?: string;
  variant?: 'default' | 'mobile' | 'desktop';
  active?: boolean; // Caso precise forçar estado ativo
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  variant: 'default',
  active: false
});

const { isActive } = useActiveRoute();

// Determina se o link é uma âncora de hash
const isHashLink = computed(() => props.to.startsWith('#'));

// Determina se a rota atual é ativa
const isRouteActive = computed(() => props.active || isActive.value(props.to));

// Resolve o componente do ícone dinamicamente
const resolvedIcon = computed(() => {
  if (!props.icon) return null;
  // Verifica se o ícone existe no nosso mapeamento
  return iconMap[props.icon as keyof typeof iconMap] || null;
});
</script>
