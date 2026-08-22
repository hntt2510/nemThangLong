async function verify() {
  const home = await (await fetch('http://localhost:3333/')).text();
  console.log('Homepage prices match:', home.match(/class="product-card-price">([^<]+)</g));
  console.log('Homepage has showcase badge:', home.includes('UI Preview'));

  const catalog = await (await fetch('http://localhost:3333/nem')).text();
  console.log('Catalog products count match:', (catalog.match(/class="home-product-card/g) || []).length);
  console.log('Catalog has America:', catalog.includes('Nệm Thăng Long America'));

  const pdp = await (await fetch('http://localhost:3333/nem/america')).text();
  console.log('PDP America has pdp-pill:', pdp.includes('pdp-pill'));
  console.log('PDP America has price:', pdp.includes('4.900.000'));

  const luxury = await (await fetch('http://localhost:3333/nem/luxury')).text();
  console.log('PDP Luxury has pdp-pill:', luxury.includes('pdp-pill'));
  console.log('PDP Luxury has price:', luxury.includes('18.900.000'));

  const compare = await (await fetch('http://localhost:3333/so-sanh')).text();
  console.log('Compare has table:', compare.includes('compare-matrix'));
  console.log('Compare has preselected items:', compare.includes('Nệm Thăng Long America') && compare.includes('Nệm Thăng Long Luxury'));

  const cart = await (await fetch('http://localhost:3333/gio-hang')).text();
  console.log('Cart page status: length =', cart.length);
  console.log('Cart page has CartPage component:', cart.includes('GIỎ HÀNG'));

  const checkout = await (await fetch('http://localhost:3333/checkout')).text();
  console.log('Checkout has form:', checkout.includes('checkout-form'));
  console.log('Checkout has preview value:', checkout.includes('Nguyễn Minh Anh'));

  const account = await (await fetch('http://localhost:3333/tai-khoan')).text();
  console.log('Account has Nguyễn Minh Anh:', account.includes('Nguyễn Minh Anh'));

  const orders = await (await fetch('http://localhost:3333/tai-khoan/don-hang')).text();
  console.log('Orders page has showcase order:', orders.includes('TL-2026-8942'));

  const address = await (await fetch('http://localhost:3333/tai-khoan/dia-chi')).text();
  console.log('Address page has showcase address:', address.includes('123 Đường Minh Họa'));

  const profile = await (await fetch('http://localhost:3333/tai-khoan/ho-so')).text();
  console.log('Profile page has showcase name:', profile.includes('Nguyễn Minh Anh'));

  const support = await (await fetch('http://localhost:3333/tai-khoan/ho-tro')).text();
  console.log('Support page has showcase case:', support.includes('TL-2026-4190'));
}

verify().catch(console.error);
