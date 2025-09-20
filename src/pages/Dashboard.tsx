import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  MessageSquare, 
  ChefHat, 
  Users, 
  TrendingUp,
  Calendar,
  Phone,
  Mail
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { TopNavbar } from '@/components/layout/TopNavbar';

interface DashboardStats {
  totalReviews: number;
  averageRating: number;
  totalContacts: number;
  totalMenuItems: number;
  totalAdmins: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalReviews: 0,
    averageRating: 0,
    totalContacts: 0,
    totalMenuItems: 0,
    totalAdmins: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch statistics
      const [
        reviewsResult,
        contactFormResult,
        menuItemsResult,
        adminsResult
      ] = await Promise.all([
        supabase.from('reviews').select('rating'),
        supabase.from('contact_form').select('id'), // Updated to contact_form table
        supabase.from('menu_items').select('*'),
        supabase.from('admin').select('id')
      ]);

      // Process reviews
      const reviews = reviewsResult.data || [];
      const totalReviews = reviews.length;
      const averageRating = reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
        : 0;

      // Process menu items
      const menuItems = menuItemsResult.data || [];
      
      setStats({
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        totalContacts: contactFormResult.data?.length || 0, // Using data from contact_form
        totalMenuItems: menuItems.length,
        totalAdmins: adminsResult.data?.length || 0,
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Reviews',
      value: stats.totalReviews,
      icon: Star,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      title: 'Average Rating',
      value: `${stats.averageRating}/5`,
      icon: TrendingUp,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Contact Form',
      value: stats.totalContacts,
      icon: MessageSquare,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Menu Items',
      value: stats.totalMenuItems,
      icon: ChefHat,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Admins',
      value: stats.totalAdmins,
      icon: Users,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <TopNavbar />
      
      <main className="flex-1">
        <div className="p-4 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">Welcome to Jagdamba Caterers Admin Panel</p>
            </div>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              <Calendar className="w-4 h-4 mr-2" />
              {new Date().toLocaleDateString()}
            </Badge>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {statCards.map((stat, index) => (
              <Card 
                key={stat.title} 
                className="admin-card animate-slide-up flex flex-col items-center justify-center text-center" 
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-3 flex flex-col items-center justify-center w-full">
                  <div className={`p-2 rounded-full ${stat.bgColor} mb-2`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <p className="text-sm font-medium mb-1">{stat.title}</p>
                  <p className="text-xl font-bold">{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* You can add additional dashboard content here if needed */}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;