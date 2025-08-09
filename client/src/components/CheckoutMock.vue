<template>
  <v-dialog 
    v-model="isOpen" 
    max-width="500"
    persistent
    scrollable
  >
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <span class="text-h6">Finalizar Compra</span>
        <v-btn 
          @click="handleClose"
          :icon="customIcons.close"
          variant="text"
          size="small"
        />
      </v-card-title>
      
      <v-divider />
      
      <v-card-text class="pa-6">
        <!-- Item Details -->
        <div class="mb-4">
          <h3 class="text-subtitle-1 font-weight-medium mb-2">Item selecionado</h3>
          
          <v-card variant="outlined" class="mb-4">
            <div class="d-flex pa-3">
              <v-img
                :src="clip?.thumbUrl"
                width="80"
                height="60"
                class="flex-shrink-0 rounded"
                cover
              />
              <div class="ms-3 flex-grow-1">
                <h4 class="text-body-1 font-weight-medium">{{ clip?.venue }}</h4>
                <p class="text-caption text-medium-emphasis">
                  {{ getSportLabel(clip?.sport || '') }} • {{ formatDuration(clip?.durationSec || 0) }}
                </p>
                <p class="text-h6 text-primary font-weight-bold mt-1">
                  R$ {{ formatPrice(clip?.priceCents || 0) }}
                </p>
              </div>
            </div>
          </v-card>
        </div>

        <!-- Payment Form -->
        <div class="payment-form">
          <h3 class="text-subtitle-1 font-weight-medium mb-3">
            <v-icon :icon="customIcons.creditCard" class="me-2" />
            Informações de pagamento
          </h3>
          
          <v-text-field
            v-model="paymentForm.cardNumber"
            label="Número do cartão"
            placeholder="**** **** **** ****"
            variant="outlined"
            :rules="[rules.required, rules.cardNumber]"
            class="mb-3"
          />
          
          <v-row>
            <v-col cols="8">
              <v-text-field
                v-model="paymentForm.expiryDate"
                label="Validade"
                placeholder="MM/AA"
                variant="outlined"
                :rules="[rules.required, rules.expiryDate]"
              />
            </v-col>
            <v-col cols="4">
              <v-text-field
                v-model="paymentForm.cvv"
                label="CVV"
                placeholder="***"
                variant="outlined"
                :rules="[rules.required, rules.cvv]"
                type="password"
              />
            </v-col>
          </v-row>
          
          <v-text-field
            v-model="paymentForm.cardholderName"
            label="Nome no cartão"
            variant="outlined"
            :rules="[rules.required]"
            class="mb-3"
          />
        </div>

        <!-- Summary -->
        <v-divider class="my-4" />
        
        <div class="d-flex justify-space-between align-center mb-2">
          <span class="text-body-1">Subtotal:</span>
          <span class="text-body-1">R$ {{ formatPrice(clip?.priceCents || 0) }}</span>
        </div>
        
        <div class="d-flex justify-space-between align-center mb-2">
          <span class="text-body-1">Taxa de processamento:</span>
          <span class="text-body-1">R$ 0,00</span>
        </div>
        
        <v-divider class="my-2" />
        
        <div class="d-flex justify-space-between align-center">
          <span class="text-h6 font-weight-bold">Total:</span>
          <span class="text-h6 font-weight-bold text-primary">
            R$ {{ formatPrice(clip?.priceCents || 0) }}
          </span>
        </div>
      </v-card-text>
      
      <v-divider />
      
      <v-card-actions class="pa-4">
        <v-btn
          @click="handleClose"
          variant="outlined"
          class="flex-grow-1"
          :disabled="processing"
        >
          Cancelar
        </v-btn>
        
        <v-btn
          @click="handleConfirmPurchase"
          color="primary"
          variant="flat"
          class="flex-grow-1 ms-2"
          :loading="processing"
          :disabled="!isFormValid"
        >
          <v-icon :icon="customIcons.check" class="me-1" />
          Confirmar Compra
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { SportClip } from '@/store/clips'
import { customIcons } from '@/utils/icons'
import { formatPrice, formatDuration, getSportLabel } from '@/utils/formatters'

interface Props {
  modelValue: boolean
  clip?: SportClip | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'purchase', clipId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const processing = ref(false)

const paymentForm = ref({
  cardNumber: '',
  expiryDate: '',
  cvv: '',
  cardholderName: ''
})

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const rules = {
  required: (value: string) => !!value || 'Campo obrigatório',
  cardNumber: (value: string) => {
    const cleaned = value.replace(/\s/g, '')
    return cleaned.length === 16 || 'Número do cartão inválido'
  },
  expiryDate: (value: string) => {
    const regex = /^(0[1-9]|1[0-2])\/\d{2}$/
    return regex.test(value) || 'Data inválida (MM/AA)'
  },
  cvv: (value: string) => {
    return (value.length === 3 || value.length === 4) || 'CVV inválido'
  }
}

const isFormValid = computed(() => {
  const form = paymentForm.value
  return !!(
    form.cardNumber && 
    form.expiryDate && 
    form.cvv && 
    form.cardholderName &&
    rules.cardNumber(form.cardNumber) === true &&
    rules.expiryDate(form.expiryDate) === true &&
    rules.cvv(form.cvv) === true
  )
})

const handleClose = () => {
  if (!processing.value) {
    isOpen.value = false
  }
}

const handleConfirmPurchase = async () => {
  if (!props.clip || !isFormValid.value) return
  
  processing.value = true
  
  try {
    // Simular processamento
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    emit('purchase', props.clip.id)
    isOpen.value = false
    
    // Reset form
    paymentForm.value = {
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: ''
    }
  } catch (error) {
    console.error('Purchase error:', error)
  } finally {
    processing.value = false
  }
}

// Auto-format card number
watch(() => paymentForm.value.cardNumber, (newValue) => {
  if (newValue) {
    const cleaned = newValue.replace(/\s/g, '')
    const formatted = cleaned.replace(/(.{4})/g, '$1 ').trim()
    if (formatted !== newValue) {
      paymentForm.value.cardNumber = formatted.slice(0, 19) // 16 digits + 3 spaces
    }
  }
})

// Auto-format expiry date
watch(() => paymentForm.value.expiryDate, (newValue) => {
  if (newValue && !newValue.includes('/') && newValue.length === 2) {
    paymentForm.value.expiryDate = newValue + '/'
  }
})
</script>

<style scoped>
.payment-form {
  background: rgba(var(--v-theme-surface), 0.5);
  border-radius: 8px;
  padding: 16px;
}
</style>