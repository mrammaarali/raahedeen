import dynamic from 'next/dynamic';

const ProductManager = dynamic(() => import('./ProductManager'), { ssr: false });

export default function ProductsPage() {
  return <ProductManager />;
}
