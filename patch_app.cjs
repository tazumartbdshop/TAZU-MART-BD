const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes("import AllProducts")) {
  code = code.replace(
    `import CategoryPage from './pages/CategoryPage';`,
    `import CategoryPage from './pages/CategoryPage';\nimport AllProducts from './pages/AllProducts';`
  );
  code = code.replace(
    `<Route path="offers" element={<Offers />} />`,
    `<Route path="offers" element={<Offers />} />\n          <Route path="products" element={<AllProducts />} />`
  );
  fs.writeFileSync('src/App.tsx', code);
}
console.log('done');
