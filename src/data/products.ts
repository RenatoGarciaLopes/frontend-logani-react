export type Product = {
  id: string;
  code: string;
  name: string;
  price: number;
  description: string;
  fragranceNotes: string[];
  heroImage: string;
  secondaryImage?: string;
};

export const products: Product[] = [
  {
    id: 'n5-energia',
    code: 'N.5',
    name: 'Energia',
    price: 169.9,
    description:
      'Uma vela vibrante que combina notas de café tostado, caramelo e âmbar para despertar os sentidos e revigorar ambientes.',
    fragranceNotes: ['Café tostado', 'Caramelo salgado', 'Âmbar quente'],
    heroImage: '/images/energia-1.png',
    secondaryImage: '/images/energia-2.png',
  },
  {
    id: 'n7-equilibrio',
    code: 'N.7',
    name: 'Equilíbrio',
    price: 169.9,
    description:
      'Inspirada em rituais de autocuidado, revela acordes verdes, bambu e musgo delicado para reconectar corpo e mente.',
    fragranceNotes: ['Folhas verdes', 'Bambu fresco', 'Musgo'],
    heroImage: '/images/equilibrio-1.png',
    secondaryImage: '/images/equilibrio-2.png',
  },
  {
    id: 'n9-euforia',
    code: 'N.9',
    name: 'Euforia',
    price: 169.9,
    description:
      'Notas suculentas de cereja, fava tonka e baunilha criam uma atmosfera acolhedora, perfeita para noites especiais.',
    fragranceNotes: ['Cereja madura', 'Fava tonka', 'Baunilha cremosa'],
    heroImage: '/images/euforia-1.png',
    secondaryImage: '/images/euforia-2.png',
  },
];
