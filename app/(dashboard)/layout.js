import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#09090b', color: '#fafafa', fontFamily: 'Inter, sans-serif' }}>
      <Sidebar />
      <div className="md:ml-[240px] flex flex-col min-h-screen">
        <TopBar />
        <div className="flex-1 pb-16 md:pb-0">
          {children}
        </div>
      </div>
    </div>
  );
}
