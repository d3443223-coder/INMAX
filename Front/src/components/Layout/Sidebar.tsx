import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Megaphone, 
  BarChart3, 
  Settings, 
  Users,
  MapPin,
  FileText
} from 'lucide-react';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  
  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: t('navigation.dashboard') },
    { path: '/campaigns', icon: Megaphone, label: t('navigation.campaigns') },
    { path: '/indicators', icon: BarChart3, label: 'Indicadores' },
    { path: '/reports', icon: FileText, label: 'Reportes' },
    { path: '/settings', icon: Settings, label: t('navigation.settings') },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>INMAX AVISADORES</h2>
        <p>Módulo de Campañas</p>
      </div>
      
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path} className="nav-item">
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'active' : ''}`
                  }
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
