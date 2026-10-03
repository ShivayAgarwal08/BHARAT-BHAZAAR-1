import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function ArtisanDashboard() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role !== 'ARTISAN') {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        const [prodRes, reqRes, projRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/products/my/products`),
          axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/requests/my/requests`),
          axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/projects`)
        ]);
        setProducts(prodRes.data);
        setRequests(reqRes.data);
        setProjects(projRes.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user, navigate]);

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/products/${id}`);
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  const handleCancelRequest = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this request?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/requests/${id}`);
      setRequests(requests.map(r => r.id === id ? { ...r, status: 'CANCELLED' } : r));
    } catch (err) {
      alert('Failed to cancel request');
    }
  };

  if (loading) return <div className="text-center py-12">Loading dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-text">Artisan Dashboard</h1>
          <p className="text-text-light mt-1">Manage your digital storefront and growth</p>
        </div>
      </div>

      {/* Growth Requests Section */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-xl font-bold text-text">My Growth Requests</h2>
          <Link to="/dashboard/create-request" className="btn-outline text-sm py-2 px-4">
            + Create Request
          </Link>
        </div>
        
        {requests.length === 0 ? (
          <div className="text-center py-8 text-text-light">
            You haven't created any growth requests yet. Ask for an Intern's help!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map(req => (
              <div key={req.id} className="border rounded-xl p-5 hover:shadow-md transition bg-white flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <span className="bg-orange-50 text-primary px-2 py-1 rounded text-xs font-semibold">
                    {req.category}
                  </span>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    req.status === 'OPEN' ? 'bg-green-100 text-green-700' :
                    req.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {req.status}
                  </span>
                </div>
                <h3 className="font-bold text-lg text-text mb-2 line-clamp-1">{req.title}</h3>
                <p className="text-sm text-text-light mb-4 line-clamp-2">{req.description}</p>
                <div className="mt-auto pt-4 border-t flex items-center justify-between">
                  <span className="text-sm font-medium text-text-light">
                    {req._count?.applications || 0} Applicants
                  </span>
                  <div className="space-x-3">
                    <Link to={`/dashboard/requests/${req.id}`} className="text-primary hover:underline text-sm font-medium">View</Link>
                    {req.status === 'OPEN' && (
                      <button onClick={() => handleCancelRequest(req.id)} className="text-red-500 hover:underline text-sm font-medium">Cancel</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Projects Section */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-xl font-bold text-text">My Projects</h2>
        </div>
        
        {projects.length === 0 ? (
          <div className="text-center py-8 text-text-light">
            You don't have any active projects yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(proj => (
              <Link key={proj.id} to={`/projects/${proj.id}`} className="border rounded-xl p-5 hover:shadow-md transition bg-white flex flex-col group block cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <span className="bg-orange-50 text-primary px-2 py-1 rounded text-xs font-semibold">
                    {proj.request?.category}
                  </span>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    proj.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                    proj.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {proj.status.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="font-bold text-lg text-text mb-2 line-clamp-1 group-hover:text-primary transition-colors">{proj.request?.title}</h3>
                <p className="text-sm text-text-light mb-4">Growth Manager: {proj.intern?.user?.name}</p>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Products Section */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-xl font-bold">My Products</h2>
          <Link to="/dashboard/add-product" className="btn-primary py-2 px-4 text-sm">
            + Add New Product
          </Link>
        </div>
        
        {products.length === 0 ? (
          <div className="text-center py-8 text-text-light">
            You haven't added any products yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-gray-50 text-text-light text-sm">
                  <th className="p-4 rounded-tl-lg font-medium">Product</th>
                  <th className="p-4 font-medium">Price</th>
                  <th className="p-4 font-medium">Stock</th>
                  <th className="p-4 font-medium">Category</th>
                  <th className="p-4 rounded-tr-lg font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded bg-gray-200 overflow-hidden shrink-0">
                          {product.imageUrl ? (
                            <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${product.imageUrl}`} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Img</div>
                          )}
                        </div>
                        <span className="font-medium text-text">{product.title}</span>
                      </div>
                    </td>
                    <td className="p-4 text-primary font-medium">₹{product.price}</td>
                    <td className="p-4">{product.quantity}</td>
                    <td className="p-4"><span className="bg-orange-50 text-primary px-2 py-1 rounded text-xs">{product.category}</span></td>
                    <td className="p-4 text-right space-x-3">
                      <Link to={`/dashboard/edit-product/${product.id}`} className="text-blue-500 hover:underline text-sm font-medium">Edit</Link>
                      <button onClick={() => handleDeleteProduct(product.id)} className="text-red-500 hover:underline text-sm font-medium">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
