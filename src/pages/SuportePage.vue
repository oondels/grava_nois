<template>
  <v-container class="py-4" fluid>
    <!-- Page Header -->
    <div class="text-center mb-6">
      <h1 class="text-h4 font-weight-bold mb-2">
        Central de Suporte
      </h1>
      <p class="text-h6 text-medium-emphasis">
        Tire suas dúvidas sobre como comprar e baixar seus lances
      </p>
    </div>

    <v-row justify="center">
      <v-col cols="12" lg="8">
        <!-- Search -->
        <v-card class="mb-6" elevation="1">
          <v-card-text>
            <v-text-field
              v-model="searchQuery"
              :prepend-inner-icon="customIcons.magnify"
              placeholder="Busque por uma dúvida..."
              variant="outlined"
              hide-details
              clearable
            />
          </v-card-text>
        </v-card>

        <!-- FAQ Sections -->
        <div class="faq-sections">
          <!-- Quick Actions -->
          <v-card class="mb-6" elevation="2">
            <v-card-title class="text-h6 bg-primary text-white">
              <v-icon :icon="customIcons.information" class="me-2" />
              Ações Rápidas
            </v-card-title>
            
            <v-card-text class="pa-0">
              <v-list>
                <v-list-item
                  @click="handleQuickAction('purchase')"
                  :prepend-icon="customIcons.cart"
                  title="Como comprar um lance?"
                  subtitle="Aprenda o processo de compra passo a passo"
                />
                
                <v-list-item
                  @click="handleQuickAction('download')"
                  :prepend-icon="customIcons.download"
                  title="Como baixar meus lances?"
                  subtitle="Gerencie seus downloads facilmente"
                />
                
                <v-list-item
                  @click="handleQuickAction('account')"
                  :prepend-icon="customIcons.account"
                  title="Problemas com minha conta"
                  subtitle="Resolva questões de login e acesso"
                />
              </v-list>
            </v-card-text>
          </v-card>

          <!-- FAQ Items -->
          <div
            v-for="section in filteredFaqSections"
            :key="section.title"
            class="mb-4"
          >
            <h2 class="text-h6 font-weight-medium mb-3">
              <v-icon :icon="section.icon" class="me-2" />
              {{ section.title }}
            </h2>

            <v-expansion-panels
              v-model="expandedPanels[section.title]"
              multiple
              variant="accordion"
            >
              <v-expansion-panel
                v-for="faq in section.items"
                :key="faq.question"
                :title="faq.question"
              >
                <v-expansion-panel-text>
                  <div class="text-body-1" v-html="faq.answer" />
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </div>
        </div>

        <!-- Contact Support -->
        <v-card class="mt-6" elevation="2" color="surface-variant">
          <v-card-text class="text-center py-6">
            <v-icon :icon="customIcons.help" size="48" color="primary" class="mb-3" />
            
            <h3 class="text-h6 font-weight-medium mb-2">
              Não encontrou sua resposta?
            </h3>
            
            <p class="text-body-1 text-medium-emphasis mb-4">
              Nossa equipe está aqui para ajudar você com qualquer dúvida.
            </p>
            
            <div class="d-flex justify-center flex-wrap ga-3">
              <v-btn
                color="primary"
                variant="flat"
                size="large"
              >
                <v-icon :icon="customIcons.help" class="me-2" />
                Contato por Email
              </v-btn>
              
              <v-btn
                variant="outlined"
                size="large"
              >
                Chat Online
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { customIcons } from '@/utils/icons'
import { useSnackbar } from '@/composables/useSnackbar'

const { showSnackbar } = useSnackbar()
const searchQuery = ref('')
const expandedPanels = reactive<Record<string, number[]>>({})

const faqSections = [
  {
    title: 'Comprando Lances',
    icon: customIcons.cart,
    items: [
      {
        question: 'Como posso comprar um lance?',
        answer: `
          <p>Para comprar um lance, siga estes passos:</p>
          <ol>
            <li>Navegue pela página "Meus Lances" e encontre o lance desejado</li>
            <li>Clique no botão "Comprar" no card do lance</li>
            <li>Preencha os dados do cartão de crédito no formulário</li>
            <li>Confirme a compra clicando em "Confirmar Compra"</li>
            <li>Após o pagamento, o lance estará disponível para download</li>
          </ol>
        `
      },
      {
        question: 'Quais formas de pagamento são aceitas?',
        answer: `
          <p>Atualmente aceitamos:</p>
          <ul>
            <li>Cartões de crédito (Visa, Mastercard, American Express)</li>
            <li>Cartões de débito</li>
            <li>PIX (em breve)</li>
          </ul>
          <p>Todos os pagamentos são processados de forma segura com criptografia SSL.</p>
        `
      },
      {
        question: 'Posso cancelar uma compra?',
        answer: `
          <p>Sim, você pode cancelar uma compra dentro de 24 horas após a confirmação, desde que:</p>
          <ul>
            <li>O download ainda não tenha sido iniciado</li>
            <li>O lance não tenha sido visualizado por mais de 5 minutos</li>
          </ul>
          <p>Para cancelar, entre em contato com nosso suporte através do email ou chat.</p>
        `
      }
    ]
  },
  {
    title: 'Downloads',
    icon: customIcons.download,
    items: [
      {
        question: 'Como baixar um lance que comprei?',
        answer: `
          <p>Após comprar um lance, você pode baixá-lo de várias formas:</p>
          <ol>
            <li>Na página "Downloads", clique em "Baixar" no lance desejado</li>
            <li>Na página de detalhes do lance, use o botão de download</li>
            <li>No card do lance na página principal, clique em "Baixar"</li>
          </ol>
          <p>O download será iniciado automaticamente e você poderá acompanhar o progresso.</p>
        `
      },
      {
        question: 'Posso pausar e retomar um download?',
        answer: `
          <p>Sim! Nosso sistema permite que você:</p>
          <ul>
            <li>Pause um download em andamento a qualquer momento</li>
            <li>Retome downloads pausados de onde pararam</li>
            <li>Reinicie downloads em caso de problemas</li>
          </ul>
          <p>Use os botões de controle na página de Downloads para gerenciar seus arquivos.</p>
        `
      },
      {
        question: 'Em que formato são os vídeos?',
        answer: `
          <p>Todos os lances são disponibilizados em:</p>
          <ul>
            <li><strong>Formato:</strong> MP4 (H.264)</li>
            <li><strong>Resolução:</strong> 1080p (Full HD)</li>
            <li><strong>Taxa de quadros:</strong> 60fps</li>
            <li><strong>Áudio:</strong> AAC estéreo</li>
          </ul>
          <p>Os arquivos são compatíveis com a maioria dos players de vídeo modernos.</p>
        `
      }
    ]
  },
  {
    title: 'Conta e Acesso',
    icon: customIcons.account,
    items: [
      {
        question: 'Como fazer login na plataforma?',
        answer: `
          <p>Para acessar sua conta:</p>
          <ol>
            <li>Vá para a página de login</li>
            <li>Digite seu email e senha</li>
            <li>Clique em "Entrar"</li>
          </ol>
          <p>Se não tem uma conta ainda, você pode usar o modo demonstração clicando em "Ver Demonstração".</p>
        `
      },
      {
        question: 'Esqueci minha senha, o que fazer?',
        answer: `
          <p>Para recuperar sua senha:</p>
          <ol>
            <li>Clique em "Esqueci minha senha" na página de login</li>
            <li>Digite seu email cadastrado</li>
            <li>Verifique sua caixa de entrada para o link de recuperação</li>
            <li>Siga as instruções do email para criar uma nova senha</li>
          </ol>
          <p>Se não receber o email, verifique sua pasta de spam ou entre em contato conosco.</p>
        `
      },
      {
        question: 'Como alterar meus dados pessoais?',
        answer: `
          <p>Para atualizar suas informações:</p>
          <ol>
            <li>Faça login na sua conta</li>
            <li>Clique no ícone do usuário no canto superior direito</li>
            <li>Selecione "Minha Conta" no menu</li>
            <li>Edite os campos desejados e salve as alterações</li>
          </ol>
          <p>Mudanças no email podem requerer confirmação por segurança.</p>
        `
      }
    ]
  },
  {
    title: 'Problemas Técnicos',
    icon: customIcons.alert,
    items: [
      {
        question: 'O vídeo não está carregando, o que fazer?',
        answer: `
          <p>Se o vídeo não carrega, tente:</p>
          <ol>
            <li>Recarregue a página (F5)</li>
            <li>Verifique sua conexão com a internet</li>
            <li>Limpe o cache do navegador</li>
            <li>Tente usar outro navegador</li>
            <li>Desative extensões que bloqueiam conteúdo</li>
          </ol>
          <p>Se o problema persistir, entre em contato conosco com detalhes sobre seu dispositivo e navegador.</p>
        `
      },
      {
        question: 'O download está muito lento',
        answer: `
          <p>Para melhorar a velocidade de download:</p>
          <ul>
            <li>Pause outros downloads ou streaming em sua rede</li>
            <li>Use uma conexão Wi-Fi estável</li>
            <li>Feche aplicativos desnecessários</li>
            <li>Tente baixar em horários de menor tráfego</li>
          </ul>
          <p>Nossos servidores são otimizados para alta velocidade, mas a qualidade da sua internet influencia o desempenho.</p>
        `
      },
      {
        question: 'Erro no pagamento, como resolver?',
        answer: `
          <p>Se seu pagamento não foi processado:</p>
          <ol>
            <li>Verifique se os dados do cartão estão corretos</li>
            <li>Confirme se o cartão tem limite disponível</li>
            <li>Entre em contato com seu banco</li>
            <li>Tente outro cartão ou método de pagamento</li>
          </ol>
          <p>Se o erro persistir, nosso suporte pode ajudar a identificar o problema específico.</p>
        `
      }
    ]
  }
]

const filteredFaqSections = computed(() => {
  if (!searchQuery.value) return faqSections
  
  const query = searchQuery.value.toLowerCase()
  
  return faqSections
    .map(section => ({
      ...section,
      items: section.items.filter(item =>
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query)
      )
    }))
    .filter(section => section.items.length > 0)
})

const handleQuickAction = (action: string) => {
  let message = ''
  let sectionTitle = ''
  
  switch (action) {
    case 'purchase':
      message = 'Veja a seção "Comprando Lances" abaixo para aprender como comprar.'
      sectionTitle = 'Comprando Lances'
      break
    case 'download':
      message = 'Confira a seção "Downloads" para gerenciar seus arquivos.'
      sectionTitle = 'Downloads'
      break
    case 'account':
      message = 'A seção "Conta e Acesso" tem informações sobre login e configurações.'
      sectionTitle = 'Conta e Acesso'
      break
  }
  
  showSnackbar(message, 'info')
  
  // Auto-expand the relevant section
  if (sectionTitle && !expandedPanels[sectionTitle]) {
    expandedPanels[sectionTitle] = [0] // Expand first item
  }
}
</script>

<style scoped>
.faq-sections {
  max-width: 100%;
}

:deep(.v-expansion-panel-text__wrapper) {
  padding: 16px 24px;
}

:deep(.v-expansion-panel-text ul),
:deep(.v-expansion-panel-text ol) {
  padding-left: 24px;
}

:deep(.v-expansion-panel-text li) {
  margin-bottom: 8px;
}

:deep(.v-expansion-panel-text p) {
  margin-bottom: 16px;
}

:deep(.v-expansion-panel-text p:last-child) {
  margin-bottom: 0;
}
</style>