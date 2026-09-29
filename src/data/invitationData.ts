/**
 * Dados oficiais do convite XV da Duda
 * Extraídos com fidelidade máxima da arte do Canva
 */

export interface GiftItem {
  id: string;
  category: string;
  description: string;
  note?: string;
}

export interface RuleItem {
  id: string;
  text: string;
  subtext?: string;
  highlight?: boolean;
}

export const INVITATION_DATA = {
  girlName: "Duda",
  fullTitle: "XV da Duda",
  edition: "15 Anos",
  subheading: "Você está convidado a participar desse momento especial comigo!",
  dateFormatted: "12 de Dezembro",
  timeFormatted: "13hrs às 21hrs",
  targetDateISO: "2026-12-12T13:00:00",
  
  location: {
    name: "PlanoB EVENTOS",
    address: "R. Guian, 238 - Jd Campestre",
    city: "São Paulo - SP, 04330-090",
    mapsUrl: "https://maps.app.goo.gl/8H5zkmYbiJxnaWgQ7",
    wazeUrl: "https://waze.com/ul?q=R.%20Guian%2C%20238%20-%20Jd%20Campestre%2C%20São%20Paulo%20-%20SP%2C%2004330-090&navigate=yes",
    uberDestination: "R. Guian, 238 - Jd Campestre, São Paulo - SP, 04330-090"
  },

  pix: {
    key: "536.774.568-78",
    keyType: "CPF",
    recipient: "Maria Eduarda (Duda)",
    bank: "Nubank"
  },

  contactPhone: "5511987654321", // Telefone padrão para RSVP WhatsApp

  giftSuggestions: [
    {
      id: "acessorios",
      title: "Colares, brincos, braceletes, acessórios em geral.",
      detail: "(Dourados, não uso prata.)"
    },
    {
      id: "roupas",
      title: "Roupas tamanho G/M, 46/48"
    },
    {
      id: "calcados",
      title: "Calçados tamanho 39/40"
    },
    {
      id: "livros",
      title: "Livros (Romance, terror, suspense, drama.)"
    },
    {
      id: "vinis",
      title: "Vinis de MPB"
    },
    {
      id: "perfumes",
      title: "Perfumes e cremes",
      detail: "(Gosto de perfumes doces, principalmente com notas de cereja)"
    },
    {
      id: "dinheiro",
      title: "Dinheiro (Qualquer quantia é de bom tamanho ❤️)"
    },
    {
      id: "cabelo",
      title: "Produtos de cabelo (óleos, cremes, leave-ins, etc.)"
    }
  ],

  rules: [
    {
      id: "dresscode",
      title: "Venha com sua melhor roupa anos 2000’s",
      subtitle: "(É o dresscode da festa)"
    },
    {
      id: "cores",
      title: "Não venha vestido de vermelho ou oncinha",
      subtitle: "(São as cores da aniversariante.)",
      highlight: true
    },
    {
      id: "menores",
      title: "É PROIBIDO que menores de 18 anos ingiram álcool, drogas ou usem cigarros eletrônicos",
      subtitle: "(pod/vape)",
      highlight: true
    },
    {
      id: "piscina",
      title: "Adolescentes e crianças, tragam suas roupas de banho!"
    },
    {
      id: "bebidas",
      title: "Maiores de 18 anos, tragam sua própria bebida alcoólica."
    },
    {
      id: "convidados",
      title: "Convidado não convida."
    },
    {
      id: "decoracao",
      title: "Quem tiver crianças, favor não deixar mexer na decoração."
    },
    {
      id: "dedicatoria",
      title: "Não fazer barulho na hora da dedicatória."
    }
  ]
};
