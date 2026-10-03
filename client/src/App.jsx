import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import ArtisanDashboard from './pages/ArtisanDashboard';
import InternDashboard from './pages/InternDashboard';
import AddProduct from './pages/AddProduct';
import ProductDetails from './pages/ProductDetails';
import CreateRequest from './pages/CreateRequest';
import RequestDetails from './pages/RequestDetails';
import ProjectWorkspace from './pages/ProjectWorkspace';

function App() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-2xl font-bold text-primary">Bharat Bazaar</Link>
            <nav className="flex items-center gap-6">
              <Link to="/" className="text-text hover:text-primary transition-colors font-medium">Marketplace</Link>
              {user ? (
                <>
                  {(user.role === 'ARTISAN' || user.role === 'INTERN') && (
                    <Link to="/dashboard" className="text-text hover:text-primary transition-colors font-medium">Dashboard</Link>
                  )}
                  <span className="text-text-light">Hello, {user.name}</span>
                  <button onClick={handleLogout} className="btn-outline text-sm py-1.5">Logout</button>
                </>
              ) : (
                <Link to="/login" className="btn-primary text-sm py-1.5">Login</Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/dashboard" element={
            user?.role === 'INTERN' ? <InternDashboard /> : <ArtisanDashboard />
          } />
          <Route path="/dashboard/add-product" element={<AddProduct />} />
          <Route path="/dashboard/edit-product/:id" element={<AddProduct />} />
          <Route path="/dashboard/create-request" element={<CreateRequest />} />
          <Route path="/dashboard/requests/:id" element={<RequestDetails />} />
          <Route path="/projects/:id" element={<ProjectWorkspace />} />
        </Routes>
      </main>

      <footer className="bg-white border-t border-gray-100 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-text-light">
          <p>&copy; 2026 Bharat Bazaar. Local craft. Limitless possibilities.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
