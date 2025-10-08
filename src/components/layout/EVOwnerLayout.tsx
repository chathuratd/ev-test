import { Outlet } from 'react-router-dom';
import EVOwnerSidebar from './EVOwnerSidebar';

const EVOwnerLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-black">
      <EVOwnerSidebar />
      <div className="ml-64">
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default EVOwnerLayout;