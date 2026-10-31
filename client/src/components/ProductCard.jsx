import { Link } from 'react-router-dom';
import { Tag } from 'lucide-react';

export default function ProductCard({ product }) {
  const imageUrl = product.imageUrl 
    ? product.imageUrl.startsWith('http')
      ? product.imageUrl
      : `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${product.imageUrl}` 
    : null;

  return (
    <Link to={`/product/${product.id}`} className="group block h-full">
      <div className="card card-hover h-full flex flex-col justify-between overflow-hidden">
        <div>
          <div className="aspect-square w-full overflow-hidden bg-[#f4efe6] relative">
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt={product.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#f4efe6] text-[#0b634e] font-bold text-sm px-4 text-center font-display">
                {product.title}
              </div>
            )}
            {product.category && (
              <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[#06372b] px-2.5 py-1 rounded-full text-[10px] font-bold border border-[#e8e2d8] shadow-sm flex items-center gap-1">
                <Tag className="w-3 h-3 text-[#0b634e]" />
                {product.category}
              </span>
            )}
          </div>

          <div className="p-4 space-y-2">
            <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0b634e] transition-colors line-clamp-1 font-display">
              {product.title}
            </h3>
            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          </div>
        </div>

        <div className="p-4 pt-2 border-t border-[#f0ebe1] flex items-center justify-between">
          <span className="text-base font-extrabold text-slate-900 font-display">
            ₹{product.price}
          </span>
          {product.artisanName && (
            <span className="text-[11px] text-slate-500 font-medium truncate max-w-[120px]">
              By {product.artisanName}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
