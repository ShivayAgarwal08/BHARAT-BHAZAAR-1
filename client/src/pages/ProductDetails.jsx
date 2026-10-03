import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/api/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error('Failed to fetch product', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (!product) return <div className="text-center py-12">Product not found</div>;

  const imageUrl = product.imageUrl 
    ? `http://localhost:5001${product.imageUrl}` 
    : 'https://via.placeholder.com/600?text=No+Image';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button onClick={() => navigate(-1)} className="text-primary hover:underline mb-8 flex items-center gap-2">
        &larr; Back
      </button>
      
      <div className="card p-8 md:p-12">
        <div className="flex flex-col md:flex-row gap-12">
          <div className="md:w-1/2">
            <div className="aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
              <img src={imageUrl} alt={product.title} className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="md:w-1/2 flex flex-col">
            <div className="mb-2">
              <span className="bg-orange-50 text-primary px-3 py-1 rounded-full text-sm font-medium">
                {product.category}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-text mb-4">{product.title}</h1>
            <p className="text-2xl font-bold text-primary mb-6">₹{product.price}</p>
            
            <div className="prose text-text-light mb-8">
              <h3 className="text-lg font-bold text-text mb-2">Description</h3>
              <p>{product.description}</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl mb-8">
              <h3 className="text-lg font-bold text-text mb-4">Artisan Details</h3>
              <p className="mb-1"><span className="font-medium">Crafted by:</span> {product.artisanName}</p>
              {product.location && (
                <p><span className="font-medium">Location:</span> {product.location}, {product.state}</p>
              )}
            </div>

            <div className="mt-auto flex gap-4">
              <button className="btn-primary flex-1 py-3 text-lg" disabled={product.quantity === 0}>
                {product.quantity > 0 ? 'Buy Now' : 'Out of Stock'}
              </button>
              <button className="btn-outline px-6 py-3">
                Contact Artisan
              </button>
            </div>
            {product.quantity > 0 && (
              <p className="text-sm text-text-light mt-4 text-center">
                {product.quantity} items available in stock
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
