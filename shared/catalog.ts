/** Demo men's catalogue. Images and prices are illustrative; checkout is not connected. */
export interface Product {
  id: number;
  name: string;
  category: 'Shirts' | 'T-shirts' | 'Jackets' | 'Denim';
  price: number;
  image: string;
  color: string;
  swatches: string[];
  tag: string;
  desc: string;
  prompt: string;
  // Normalized texture cut lines for torso and articulated sleeve rendering.
  overlay: {
    torsoLeft: number;
    torsoRight: number;
    sleeve: 'long' | 'short' | 'three-quarter';
    sleeveBottom: number;
  };
}

export const products: Product[] = [
  {
    id: 1,
    name: 'The Check Oxford',
    category: 'Shirts',
    price: 1890,
    image: '/images/check-shirt.png',
    color: 'Blue & charcoal',
    swatches: ['#5c7d9d'],
    tag: 'BESTSELLER',
    desc: 'A crisp check. A relaxed kind of confidence.',
    prompt: "a men's blue, charcoal and white checked long-sleeve button-up shirt",
    overlay: {
      torsoLeft: 0.2,
      torsoRight: 0.8,
      sleeve: 'long',
      sleeveBottom: 0.88,
    },
  },
  {
    id: 2,
    name: 'The Graphic Crew',
    category: 'T-shirts',
    price: 1290,
    image: '/images/graphic-tee.png',
    color: 'Cloud white',
    swatches: ['#eeede7'],
    tag: 'NEW ARRIVAL',
    desc: 'Easy cotton. A graphic with a little attitude.',
    prompt: "a men's white short-sleeve crewneck T-shirt with a black bird graphic",
    overlay: {
      torsoLeft: 0.2,
      torsoRight: 0.8,
      sleeve: 'short',
      sleeveBottom: 0.4,
    },
  },
  {
    id: 3,
    name: 'The Everyday Henley',
    category: 'T-shirts',
    price: 1490,
    image: '/images/henley.png',
    color: 'Stone & charcoal',
    swatches: ['#b8b7b1'],
    tag: 'ESSENTIAL',
    desc: 'The everyday tee, with a better neckline.',
    prompt:
      "a men's grey three-quarter-sleeve henley T-shirt with charcoal raglan sleeves",
    overlay: {
      torsoLeft: 0.2,
      torsoRight: 0.8,
      sleeve: 'three-quarter',
      sleeveBottom: 0.73,
    },
  },
  {
    id: 4,
    name: 'The Field Jacket',
    category: 'Jackets',
    price: 3290,
    image: '/images/cotton-jacket.png',
    color: 'Desert tan',
    swatches: ['#8b8064'],
    tag: 'THE EDIT',
    desc: 'A considered layer for wherever the day goes.',
    prompt: "a men's tan cotton field jacket with a front zip and flap pockets",
    overlay: {
      torsoLeft: 0.2,
      torsoRight: 0.8,
      sleeve: 'long',
      sleeveBottom: 0.98,
    },
  },
  {
    id: 5,
    name: 'The Denim Trucker',
    category: 'Denim',
    price: 3490,
    image: '/images/denim-jacket.png',
    color: 'Washed indigo',
    swatches: ['#6b8fa6'],
    tag: 'TIMELESS',
    desc: 'The blue layer that earns its place in every wardrobe.',
    prompt:
      "a men's blue washed denim trucker jacket with metal buttons and chest pockets",
    overlay: {
      torsoLeft: 0.2,
      torsoRight: 0.8,
      sleeve: 'long',
      sleeveBottom: 0.98,
    },
  },
  {
    id: 6,
    name: 'The Weekend Plaid',
    category: 'Shirts',
    price: 1990,
    image: '/images/plaid-shirt.png',
    color: 'Red plaid',
    swatches: ['#aa5447'],
    tag: 'OFF DUTY',
    desc: 'A soft plaid shirt for your unhurried days.',
    prompt: "a men's red plaid long-sleeve button-up casual shirt",
    overlay: {
      torsoLeft: 0.2,
      torsoRight: 0.8,
      sleeve: 'long',
      sleeveBottom: 0.97,
    },
  },
  {
    id: 7,
    name: 'The Summer Shirt',
    category: 'Shirts',
    price: 1690,
    image: '/images/summer-shirt.png',
    color: 'Everyday blue',
    swatches: ['#738794'],
    tag: 'EASY WEAR',
    desc: 'Short sleeves. Long weekends. A lighter way to dress.',
    prompt: "a men's blue short-sleeve collared casual shirt",
    overlay: {
      torsoLeft: 0.2,
      torsoRight: 0.8,
      sleeve: 'short',
      sleeveBottom: 0.48,
    },
  },
];

export type BagItem = { product: Product; size: string; qty: number };
export const money = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;
