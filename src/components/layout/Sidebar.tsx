'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUIStore, useAuthStore } from '@/store';
import { hasPermission, PermissionKey } from '@/lib/permissions';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Users, 
  Building2, 
  BedDouble, 
  RefreshCw, 
  AlertTriangle, 
  Phone, 
  Ambulance, 
  BarChart3, 
  FileText, 
  User, 
  Building, 
  Settings,
  PanelLeftClose,
  PanelLeft,
  LucideIcon,
  Stethoscope,
  ClipboardCheck,
  Activity,
  MapPin
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  permission?: PermissionKey;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Overview', href: '/', icon: LayoutDashboard, permission: 'DASHBOARD' },
      { label: 'Referrals', href: '/referrals', icon: ClipboardList, permission: 'REFERRALS_VIEW' },
      { label: 'Patients', href: '/patients', icon: Users, permission: 'PATIENTS_VIEW' },
      { label: 'Facilities', href: '/facilities', icon: Building2, permission: 'FACILITIES_VIEW' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { label: 'Readiness', href: '/readiness', icon: BedDouble, permission: 'READINESS_VIEW' },
      { label: 'Clinician Workflow', href: '/clinician-workflow', icon: Stethoscope, permission: 'CLINICIAN_WORKFLOW' },
      { label: 'Triage', href: '/triage', icon: AlertTriangle, permission: 'TRIAGE' },
    ],
  },
  {
    title: 'Emergency',
    items: [
      { label: 'Call Centre', href: '/call-centre', icon: Phone, permission: 'CALL_CENTRE' },
      { label: 'Ambulances', href: '/ambulances', icon: Ambulance, permission: 'AMBULANCES' },
    ],
  },
  {
    title: 'Analytics',
    items: [
      { label: 'District Dashboard', href: '/district-dashboard', icon: Activity, permission: 'DISTRICT_DASHBOARD' },
      { label: 'National Dashboard', href: '/national-dashboard', icon: MapPin, permission: 'NATIONAL_DASHBOARD' },
      { label: 'Dashboard', href: '/analytics', icon: BarChart3, permission: 'ANALYTICS' },
      { label: 'Reports', href: '/reports', icon: FileText, permission: 'REPORTS' },
    ],
  },
  {
    title: 'Administration',
    items: [
      { label: 'Users', href: '/admin/users', icon: User, permission: 'ADMIN_USERS' },
      { label: 'Facilities', href: '/admin/facilities', icon: Building, permission: 'ADMIN_FACILITIES' },
      { label: 'Settings', href: '/admin/settings', icon: Settings, permission: 'ADMIN_SETTINGS' },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const { sidebarCollapsed, sidebarMobileOpen, toggleSidebar, setMobileSidebarOpen } = useUIStore();

  const userType = user?.userType;

  // Filter sections and items based on user permissions
  const filteredSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        // National users can only see the national dashboard
        if (userType === 'NATIONAL_USER') {
          return item.href === '/national-dashboard';
        }
        return !item.permission || hasPermission(userType, item.permission);
      }),
    }))
    .filter((section) => section.items.length > 0);

  const closeMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };

  return (
    <>
      <div 
        className={`sidebar-overlay ${sidebarMobileOpen ? 'visible' : ''}`}
        onClick={closeMobileSidebar}
      />

      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${sidebarMobileOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Activity size={22} strokeWidth={2} />
          </div>
          <span className="sidebar-title">RMS</span>
        </div>

        <nav className="sidebar-nav">
          {filteredSections.map((section, sectionIndex) => (
            <div 
              key={section.title} 
              className="nav-section"
              style={{ 
                animationDelay: `${sectionIndex * 50}ms`,
              }}
            >
              <div className="nav-section-title">{section.title}</div>
              {section.items.map((item, itemIndex) => {
                const isActive = pathname === item.href || 
                  (item.href !== '/' && pathname.startsWith(item.href));
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                    onClick={closeMobileSidebar}
                    style={{
                      animationDelay: `${(sectionIndex * 50) + (itemIndex * 25)}ms`,
                    }}
                  >
                    <span className="nav-item-icon">
                      <Icon size={18} strokeWidth={isActive ? 2 : 1.75} />
                    </span>
                    <span className="nav-item-label">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer hide-mobile">
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            {sidebarCollapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
            {/* <span>Collapse</span> */}
          </button>
        </div>
      </aside>
    </>
  );
}
