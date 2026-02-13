export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  
  if (minutes > 0) {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }
  return `${seconds}s`
}

export const formatPrice = (cents: number): string => {
  const reais = cents / 100
  return reais.toFixed(2).replace('.', ',')
}

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  
  const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60)
  
  if (diffInHours < 24) {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }
  
  return date.toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatLastModified(dateString: any) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return `${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")} - ${date.getDate()} ${months[date.getMonth()]} - ${date.getFullYear()}`;
}

export const getSportColor = (sport: string): string => {
  const colors = {
    futebol: 'green',
    basquete: 'orange',
    volei: 'blue',
    futevolei: 'purple'
  }
  return colors[sport as keyof typeof colors] || 'grey'
}


import { customIcons } from './icons'
export const getSportIcon = (sport: string): string => {
  const icons = {
    futebol: customIcons.soccer,
    basquete: customIcons.basketball,
    volei: customIcons.volleyball,
    futevolei: customIcons.volleyball,
  }
  return (icons as any)[sport] || customIcons.information

}

export const getSportLabel = (sport: string): string => {
  const labels = {
    futebol: 'Futebol',
    basquete: 'Basquete',
    volei: 'Vôlei',
    futevolei: 'Futevôlei'
  }
  return labels[sport as keyof typeof labels] || sport
}

export const getStatusLabel = (status: string): string => {
  const labels = {
    disponivel: 'Disponível p/ compra',
    processando: 'Processando',
    pago: 'Pago'
  }
  return labels[status as keyof typeof labels] || status
}
