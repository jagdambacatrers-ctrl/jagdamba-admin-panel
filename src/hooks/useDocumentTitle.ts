import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * A custom hook that updates the document title based on the current route
 */
export const useDocumentTitle = () => {
  const location = useLocation();
  
  useEffect(() => {
    const path = location.pathname;
    let title = 'Jagdamba Caterers - Admin Panel';
    
    // Set specific page titles based on the route
    if (path.includes('dashboard')) {
      title = 'Dashboard | Jagdamba Caterers - Admin Panel';
    } else if (path.includes('reviews')) {
      title = 'Reviews | Jagdamba Caterers - Admin Panel';
    } else if (path.includes('contacts')) {
      title = 'Potential Clients | Jagdamba Caterers - Admin Panel';
    } else if (path.includes('menu')) {
      title = 'Menu Items | Jagdamba Caterers - Admin Panel';
    } else if (path.includes('admins')) {
      title = 'Admins | Jagdamba Caterers - Admin Panel';
    } else if (path.includes('login')) {
      title = 'Login | Jagdamba Caterers - Admin Panel';
    }
    
    // Update the document title
    document.title = title;
  }, [location]);
};