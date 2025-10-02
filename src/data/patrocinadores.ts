// Informações extras dos patrocinadores (editar aqui)
// Use o id derivado do nome do arquivo (ex.: "acme-corp.png" -> "acme-corp")

export type Socials = {
  instagram?: string | null;
  twitter?: string | null;
  facebook?: string | null;
  youtube?: string | null;
  linkedin?: string | null;
  whatsapp?: string | null;
};

export type SponsorOverride = {
  website?: string | null;
  description?: string | null;
  socials?: Socials;
  services?: string[] | null;
};

export const sponsorOverrides: Record<string, SponsorOverride> = {
  // IDs gerados a partir dos arquivos em src/assets/patrocinadores
  // Edite os textos abaixo conforme necessário

  aeesi: {
    description:
      "Artes marciais, funcional, musculação, HIT, Muay Thai. Nossa Essência sempre será Evolutiva: Aqui Cuidamos de pessoas! Amor ao trato humano, nossa essência;",
    services: ["Academia", "Esporte", "Saúde", "Lazer"],
    // website: "exemplo.com",
    // socials: { instagram: "instagram.com/exemplo" },
  },

  "eletro-solution": {
    description:
      "A Eletro-Solution oferece soluções completas em eletricidade e automação para residências, edifícios e indústrias. Nossos serviços incluem desde a instalação e manutenção de sistemas elétricos e de iluminação até projetos avançados de automação residencial e industrial, com foco em segurança, eficiência e tecnologia.",
    services: [
      "Instalações e manutenção elétrica (residencial e predial)",
      "Automação residencial e industrial",
      "Sistemas de segurança e controle",
      "Projetos e dimensionamento elétrico"
    ],
    socials: {
      instagram: "https://www.instagram.com/eletro_solutions/",
      whatsapp: "https://wa.me/75998209295"
    }
  },

  "posto-saocaetano": {
    "description": "O Posto São Caetano é o seu destino principal para abastecimento e conveniência. Oferecemos combustíveis de alta qualidade, uma loja de conveniência completa e serviços de manutenção automotiva, tudo para garantir uma parada rápida e eficiente para você e seu veículo.",
    "services": [
      "Combustíveis BR de alta qualidade (gasolina, etanol, diesel)",
      "Loja de conveniência BR Mania",
      "Serviços de calibração de pneus e troca de óleo",
      "Lavagem de carros",
      "Pagamento com cartão de crédito e débito"
    ]
  },

  star: {
    description: "Descrição do patrocinador Star. Edite com a proposta de valor e como colabora com o projeto.",
    services: ["Patrocínio", "Divulgação"],
  },

  velejar: {
    description: "Descrição do patrocinador Velejar. Conte sobre os serviços/produtos e o apoio ao esporte.",
    services: ["Artigos esportivos", "Eventos"],
  },
};
