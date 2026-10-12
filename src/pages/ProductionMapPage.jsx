import React from 'react';
import { useApp } from '../context/AppContext';
import ProductionMap from '../components/charts/ProductionMap';

export default function ProductionMapPage() {
  const { getVisible } = useApp();
  const production = getVisible('prod');
  const nurseries = getVisible('nur');

  return (
    <div className="h-[calc(100vh-3.5rem)] w-full">
      <ProductionMap className="h-full w-full border-0" production={production} nurseries={nurseries} />
    </div>
  );
}
