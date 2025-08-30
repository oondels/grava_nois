// Informações extras dos patrocinadores (editar aqui)
// Use o id derivado do nome do arquivo (ex.: "acme-corp.png" -> "acme-corp")

export type Socials = {
  instagram?: string | null;
  twitter?: string | null;
  facebook?: string | null;
  youtube?: string | null;
  linkedin?: string | null;
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
      "Descrição do patrocinador Eletro Solution. Edite este texto com os principais serviços/produtos e o papel no apoio ao projeto.",
    services: ["Serviços elétricos", "Manutenção", "Consultoria"],
  },

  "posto-saocaetano": {
    description:
      "Descrição do Posto São Caetano. Informe diferenciais, localização e benefícios oferecidos aos atletas/torcedores.",
    services: ["Abastecimento", "Troca de óleo", "Loja de conveniência"],
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
