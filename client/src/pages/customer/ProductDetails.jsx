import React from 'react';
import { useParams } from 'react-router-dom';

const ProductDetails = () => {
  const { id } = useParams();
  
  return (
    <div className="page product-details-page">
      <h2>Product Details</h2>
      <p>Placeholder for product description, image slides, specs, and renting booking form for ID {id}.</p>
    </div>
  );
};

export default ProductDetails;
