import { useNavigate } from 'react-router-dom';
import PanelAdministracion from '../components/PanelAdministracion';

export default function PaginaAdmin() {
  const navigate = useNavigate();
  return <PanelAdministracion alSalir={() => navigate('/')} alEntrarPanel={() => navigate('/admin', {replace: true})} />;
}
