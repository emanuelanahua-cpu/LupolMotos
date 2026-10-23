import { useNavigate } from 'react-router-dom';
import AdminPanel from '../components/AdminPanel';

export default function AdminPage() {
  const navigate = useNavigate();
  return <AdminPanel alSalir={() => navigate('/')} alEntrarPanel={() => navigate('/admin', {replace: true})} />;
}
