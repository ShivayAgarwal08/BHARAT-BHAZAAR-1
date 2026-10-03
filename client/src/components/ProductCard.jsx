import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  const imageUrl = product.imageUrl 
    ? `http://localhost:5001${product.imageUrl}` 
    : 'https://via.placeholder.com/400?text=No+Image';

  return (
    <Link to={`/product/${product.id}`} className="group">
      <div className="card h-full transition-transform hover:-translate-y-1 hover:shadow-md">
        <div className="aspect-square w-full overflow-hidden bg-gray-100">
          <img 
            src={imageUrl} 
            alt={product.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-5">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold text-text line-clamp-1">{product.title}</h3>
            <span className="text-primary font-bold">₹{product.price}</span>
          </div>
          <p className="text-sm text-text-light mb-3 line-clamp-2">{product.description}</p>
          <div className="flex items-center justify-between text-xs text-text-light">
            <span className="bg-orange-50 text-primary px-2 py-1 rounded-md">{product.category}</span>
            {product.artisanName && <span>By {product.artisanName}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}
