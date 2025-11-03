export type Product = {
  id: string;
  code: string;
  name: string;
  price: number;
  description: string;
  fullDescription: string;
  fragranceNotes: string[];
  fragranceDetails?: {
    family: string;
    topNotes: string[];
    middleNotes: string[];
    baseNotes: string[];
    projection: string;
  };
  composition: string;
  care: string;
  images: string[];
  heroImage: string;
  secondaryImage?: string;
  whatsappLink?: string;
};

export const products: Product[] = [
  {
    id: 'n5-energia',
    code: 'N.5',
    name: 'Energia',
    price: 169.9,
    description:
      'Uma vela vibrante que combina notas de café tostado, caramelo e âmbar para despertar os sentidos e revigorar ambientes.',
    fullDescription:
      'A energia necessária para começar o dia depois de um gole de café. Com um aroma doce e envolvente, a vela N.5 é a sua parceira ideal durante dias intensos que exigem uma dose extra de ânimo, ou em intervalos mais tranquilos, como um café da tarde, inspirando uma maior conexão e apreciação do tempo presente.',
    fragranceNotes: ['Café tostado', 'Caramelo salgado', 'Âmbar quente'],
    fragranceDetails: {
      family: 'Oriental Gourmand',
      topNotes: ['Cereja', 'Baunilha', 'Caramelo'],
      middleNotes: ['Café Cremoso', 'Frutas vermelhas'],
      baseNotes: ['Fava Tonka', 'Caramelo', 'Musk'],
      projection: 'Forte',
    },
    composition:
      'Blend de ceras vegetais (coco, arroz e palma) 100% livre de parafina\nFragrâncias Premium\nPavio 100% algodão\nPeso líquido 200g\nTempo de queima: 30 – 40 horas\nProduto vegano e biodegradável produzida à mão\nEmbalagem de vidro reutilizável e reciclável com dimensões 8x8cm',
    care: `A vela Logani, assim como você, merece atenção e cuidados.

Retire-a da caixa e acenda em uma superfície plana longe de correntes de ar. Deixe-a queimar por cerca de uma hora, até que a cera derreta alcançando as bordas. Mantenha a vela acesa por um período máximo de 3 horas e longe do alcance de crianças, animais, produtos ou objetos inflamáveis.

Ao apagar, evite assoprar; abafe a chama ou use um utensílio para mergulhar os pavios na cera e endireite-os logo em seguida. Apare os pavios com a cera sólida para evitar que a chama fique muito alta, evitando acidentes. Use sua vela de maneira segura e consciente, não a deixe sem supervisão.

Devido aos ingredientes naturais, a vela pode sofrer alteração de cor após ser acesa, mas isso não interfere na qualidade do produto.`,
    images: [
      '/images/products/energia-1.png',
      '/images/products/energia-2.png',
      '/images/products/energia-3.png',
    ],
    heroImage: '/images/products/energia-1.png',
    secondaryImage: '/images/products/energia-2.png',
    whatsappLink: 'https://w.app/logani_n5',
  },
  {
    id: 'n7-equilibrio',
    code: 'N.7',
    name: 'Equilíbrio',
    price: 169.9,
    description:
      'Inspirada em rituais de autocuidado, revela acordes verdes, bambu e musgo delicado para reconectar corpo e mente.',
    fullDescription:
      'Inspirada em rituais de autocuidado, a vela N.7 revela acordes verdes, bambu e musgo delicado para reconectar corpo e mente. Perfeita para momentos de meditação e relaxamento, ela cria um ambiente harmonioso e equilibrado.',
    fragranceNotes: ['Folhas verdes', 'Bambu fresco', 'Musgo'],
    fragranceDetails: {
      family: 'Verde Floral',
      topNotes: ['Folhas de eucalipto', 'Erva-cidreira'],
      middleNotes: ['Bambu', 'Jasmim'],
      baseNotes: ['Musgo', 'Sândalo'],
      projection: 'Média',
    },
    composition:
      'Blend de ceras vegetais (coco, arroz e palma) 100% livre de parafina\nFragrâncias Premium\nPavio 100% algodão\nPeso líquido 200g\nTempo de queima: 30 – 40 horas\nProduto vegano e biodegradável produzida à mão\nEmbalagem de vidro reutilizável e reciclável com dimensões 8x8cm',
    care: `A vela Logani, assim como você, merece atenção e cuidados.

Retire-a da caixa e acenda em uma superfície plana longe de correntes de ar. Deixe-a queimar por cerca de uma hora, até que a cera derreta alcançando as bordas. Mantenha a vela acesa por um período máximo de 3 horas e longe do alcance de crianças, animais, produtos ou objetos inflamáveis.

Ao apagar, evite assoprar; abafe a chama ou use um utensílio para mergulhar os pavios na cera e endireite-os logo em seguida. Apare os pavios com a cera sólida para evitar que a chama fique muito alta, evitando acidentes. Use sua vela de maneira segura e consciente, não a deixe sem supervisão.

Devido aos ingredientes naturais, a vela pode sofrer alteração de cor após ser acesa, mas isso não interfere na qualidade do produto.`,
    images: [
      '/images/products/equilibrio-1.png',
      '/images/products/equilibrio-2.png',
      '/images/products/equilibrio-3.png',
    ],
    heroImage: '/images/products/equilibrio-1.png',
    secondaryImage: '/images/products/equilibrio-2.png',
    whatsappLink: 'https://w.app/logani_n7',
  },
  {
    id: 'n9-euforia',
    code: 'N.9',
    name: 'Euforia',
    price: 169.9,
    description:
      'Notas suculentas de cereja, fava tonka e baunilha criam uma atmosfera acolhedora, perfeita para noites especiais.',
    fullDescription:
      'Notas suculentas de cereja, fava tonka e baunilha criam uma atmosfera acolhedora, perfeita para noites especiais. A vela N.9 transforma qualquer ambiente em um refúgio de conforto e alegria.',
    fragranceNotes: ['Cereja madura', 'Fava tonka', 'Baunilha cremosa'],
    fragranceDetails: {
      family: 'Doce Floral',
      topNotes: ['Cereja', 'Framboesa'],
      middleNotes: ['Rosa', 'Lírio'],
      baseNotes: ['Baunilha', 'Fava Tonka', 'Musk'],
      projection: 'Média a Forte',
    },
    composition:
      'Blend de ceras vegetais (coco, arroz e palma) 100% livre de parafina\nFragrâncias Premium\nPavio 100% algodão\nPeso líquido 200g\nTempo de queima: 30 – 40 horas\nProduto vegano e biodegradável produzida à mão\nEmbalagem de vidro reutilizável e reciclável com dimensões 8x8cm',
    care: `A vela Logani, assim como você, merece atenção e cuidados.

Retire-a da caixa e acenda em uma superfície plana longe de correntes de ar. Deixe-a queimar por cerca de uma hora, até que a cera derreta alcançando as bordas. Mantenha a vela acesa por um período máximo de 3 horas e longe do alcance de crianças, animais, produtos ou objetos inflamáveis.

Ao apagar, evite assoprar; abafe a chama ou use um utensílio para mergulhar os pavios na cera e endireite-os logo em seguida. Apare os pavios com a cera sólida para evitar que a chama fique muito alta, evitando acidentes. Use sua vela de maneira segura e consciente, não a deixe sem supervisão.

Devido aos ingredientes naturais, a vela pode sofrer alteração de cor após ser acesa, mas isso não interfere na qualidade do produto.`,
    images: [
      '/images/products/euforia-1.png',
      '/images/products/euforia-2.png',
      '/images/products/euforia-3.png',
    ],
    heroImage: '/images/products/euforia-1.png',
    secondaryImage: '/images/products/euforia-2.png',
    whatsappLink: 'https://w.app/logani_n9',
  },
];
