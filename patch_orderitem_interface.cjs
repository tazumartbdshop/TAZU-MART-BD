const fs = require('fs');
let code = fs.readFileSync('src/store/useOrderStore.ts', 'utf8');

code = code.replace(
`export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  variant: string;
  image?: string;`,
`export interface OrderItem {
  productId: string;
  slug?: string;
  name: string;
  price: number;
  quantity: number;
  variant: string;
  image?: string;`
);

fs.writeFileSync('src/store/useOrderStore.ts', code);
console.log('done');
