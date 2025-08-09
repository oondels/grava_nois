import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface SportClip {
  id: string
  sport: 'futebol' | 'basquete' | 'volei' | 'futevolei'
  durationSec: number
  priceCents: number
  purchased: boolean
  status: 'disponivel' | 'processando' | 'pago'
  recordedAt: string
  camera: string
  venue: string
  thumbUrl: string
  videoUrl: string
  downloadProgress?: number
  downloading?: boolean
  downloadComplete?: boolean
}

export interface ClipFilters {
  search: string
  sports: string[]
  dateRange: [string, string] | null
  status: string[]
}

// Mock data
const mockClips: SportClip[] = [
  {
    id: 'abc123',
    sport: 'futebol',
    durationSec: 13,
    priceCents: 490,
    purchased: false,
    status: 'disponivel',
    recordedAt: '2025-01-08T21:14:32Z',
    camera: 'Cam-01',
    venue: 'Quadra Cond. Primavera',
    thumbUrl: 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=400',
    videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4'
  },
  {
    id: 'def456',
    sport: 'basquete',
    durationSec: 8,
    priceCents: 390,
    purchased: true,
    status: 'pago',
    recordedAt: '2025-01-08T20:45:18Z',
    camera: 'Cam-02',
    venue: 'Academia Central',
    thumbUrl: 'https://images.pexels.com/photos/358042/pexels-photo-358042.jpeg?auto=compress&cs=tinysrgb&w=400',
    videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    downloadComplete: true
  },
  {
    id: 'ghi789',
    sport: 'volei',
    durationSec: 15,
    priceCents: 590,
    purchased: false,
    status: 'disponivel',
    recordedAt: '2025-01-08T19:30:45Z',
    camera: 'Cam-03',
    venue: 'Club Atlético',
    thumbUrl: 'https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?auto=compress&cs=tinysrgb&w=400',
    videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4'
  },
  {
    id: 'jkl012',
    sport: 'futevolei',
    durationSec: 11,
    priceCents: 450,
    purchased: true,
    status: 'pago',
    recordedAt: '2025-01-08T18:22:10Z',
    camera: 'Cam-04',
    venue: 'Praia do Flamengo',
    thumbUrl: 'https://images.pexels.com/photos/163452/basketball-dunk-blue-game-163452.jpeg?auto=compress&cs=tinysrgb&w=400',
    videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4'
  },
  {
    id: 'mno345',
    sport: 'futebol',
    durationSec: 9,
    priceCents: 420,
    purchased: false,
    status: 'processando',
    recordedAt: '2025-01-08T17:15:33Z',
    camera: 'Cam-01',
    venue: 'Campo do Botafogo',
    thumbUrl: 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&w=400',
    videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4'
  },
  {
    id: 'pqr678',
    sport: 'basquete',
    durationSec: 12,
    priceCents: 510,
    purchased: true,
    status: 'pago',
    recordedAt: '2025-01-08T16:08:27Z',
    camera: 'Cam-02',
    venue: 'Ginásio Municipal',
    thumbUrl: 'https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg?auto=compress&cs=tinysrgb&w=400',
    videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    downloadProgress: 65,
    downloading: true
  }
]

export const useClipsStore = defineStore('clips', () => {
  const clips = ref<SportClip[]>([...mockClips])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const filters = ref<ClipFilters>({
    search: '',
    sports: [],
    dateRange: null,
    status: []
  })

  const filteredClips = computed(() => {
    let result = [...clips.value]

    // Busca por texto
    if (filters.value.search) {
      const search = filters.value.search.toLowerCase()
      result = result.filter(clip => 
        clip.venue.toLowerCase().includes(search) ||
        clip.sport.toLowerCase().includes(search) ||
        clip.camera.toLowerCase().includes(search)
      )
    }

    // Filtro por esporte
    if (filters.value.sports.length > 0) {
      result = result.filter(clip => filters.value.sports.includes(clip.sport))
    }

    // Filtro por status
    if (filters.value.status.length > 0) {
      result = result.filter(clip => filters.value.status.includes(clip.status))
    }

    // Filtro por data (simplificado)
    if (filters.value.dateRange && filters.value.dateRange[0] && filters.value.dateRange[1]) {
      const [startDate, endDate] = filters.value.dateRange
      result = result.filter(clip => {
        const clipDate = new Date(clip.recordedAt).toISOString().split('T')[0]
        return clipDate >= startDate && clipDate <= endDate
      })
    }

    return result.sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())
  })

  const purchasedClips = computed(() => 
    clips.value.filter(clip => clip.purchased)
  )

  const getClipById = (id: string) => 
    clips.value.find(clip => clip.id === id)

  const updateFilters = (newFilters: Partial<ClipFilters>) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const clearFilters = () => {
    filters.value = {
      search: '',
      sports: [],
      dateRange: null,
      status: []
    }
  }

  const purchase = async (clipId: string): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))

      const clipIndex = clips.value.findIndex(c => c.id === clipId)
      if (clipIndex !== -1) {
        clips.value[clipIndex] = {
          ...clips.value[clipIndex],
          purchased: true,
          status: 'pago'
        }
        return true
      }
      return false
    } catch (err) {
      error.value = 'Erro ao processar compra'
      return false
    } finally {
      loading.value = false
    }
  }

  const startDownload = async (clipId: string): Promise<void> => {
    const clipIndex = clips.value.findIndex(c => c.id === clipId)
    if (clipIndex === -1) return

    clips.value[clipIndex] = {
      ...clips.value[clipIndex],
      downloading: true,
      downloadProgress: 0,
      downloadComplete: false
    }

    // Simular progresso de download
    const interval = setInterval(() => {
      const clip = clips.value[clipIndex]
      if (!clip.downloading) {
        clearInterval(interval)
        return
      }

      const newProgress = (clip.downloadProgress || 0) + Math.random() * 15
      
      if (newProgress >= 100) {
        clips.value[clipIndex] = {
          ...clip,
          downloadProgress: 100,
          downloading: false,
          downloadComplete: true
        }
        clearInterval(interval)
      } else {
        clips.value[clipIndex] = {
          ...clip,
          downloadProgress: Math.min(newProgress, 100)
        }
      }
    }, 500)
  }

  const pauseDownload = (clipId: string): void => {
    const clipIndex = clips.value.findIndex(c => c.id === clipId)
    if (clipIndex !== -1) {
      clips.value[clipIndex] = {
        ...clips.value[clipIndex],
        downloading: false
      }
    }
  }

  const resumeDownload = (clipId: string): void => {
    startDownload(clipId)
  }

  const retryDownload = (clipId: string): void => {
    const clipIndex = clips.value.findIndex(c => c.id === clipId)
    if (clipIndex !== -1) {
      clips.value[clipIndex] = {
        ...clips.value[clipIndex],
        downloadProgress: 0,
        downloading: false,
        downloadComplete: false
      }
    }
    startDownload(clipId)
  }

  return {
    clips: computed(() => clips.value),
    filteredClips,
    purchasedClips,
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    filters: computed(() => filters.value),
    getClipById,
    updateFilters,
    clearFilters,
    purchase,
    startDownload,
    pauseDownload,
    resumeDownload,
    retryDownload
  }
})