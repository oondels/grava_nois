import { useRoute } from 'vue-router';
import { computed } from 'vue';

/**
 * Composable para verificar se uma rota está ativa
 * Suporta comparações por path completo ou por hash
 */
export function useActiveRoute() {
  const route = useRoute();
  
  /**
   * Verifica se uma rota é a ativa atual
   * @param to - Path ou hash para comparação
   * @returns boolean indicando se é a rota ativa
   */
  const isActive = computed(() => (to: string): boolean => {
    // Verifica se é um link de hash
    if (to.startsWith('#')) {
      // Compara com o hash atual (se existir)
      return route.hash === to;
    }
    
    // Para links normais de rota, compara com o path atual
    return route.path === to;
  });
  
  return {
    isActive
  };
}
