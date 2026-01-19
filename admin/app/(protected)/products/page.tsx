import dynamic from 'next/dynamic';

const ProductManager = dynamic(() => import('./ProductManager'), {
  ssr: false,
  loading: () => <p>Loading Products...</p>,
});

export default function ProductsPage() {
  return <ProductManager />;
}
