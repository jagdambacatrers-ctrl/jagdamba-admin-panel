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
import { AdminSidebar } from '@/components/layout/AdminSidebar';

interface DashboardStats {
  totalReviews: number;
  averageRating: number;
  totalContacts: number;
  totalMenuItems: number;
  availableItems: number;
  totalAdmins: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalReviews: 0,
    averageRating: 0,
    totalContacts: 0,
    totalMenuItems: 0,
    availableItems: 0,
    totalAdmins: 0,
  });
  const [recentContacts, setRecentContacts] = useState<any[]>([]);
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
        contactsResult,
        menuItemsResult,
        adminsResult,
        recentContactsResult
      ] = await Promise.all([
        supabase.from('reviews').select('rating'),
        supabase.from('contacts').select('id'),
        supabase.from('menu_items').select('id, available'),
        supabase.from('admin').select('id'),
        supabase.from('contacts').select('*').order('created_at', { ascending: false }).limit(5)
      ]);

      // Process reviews
      const reviews = reviewsResult.data || [];
      const totalReviews = reviews.length;
      const averageRating = reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
        : 0;

      // Process menu items
      const menuItems = menuItemsResult.data || [];
      const availableItems = menuItems.filter(item => item.available).length;

      setStats({
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        totalContacts: contactsResult.data?.length || 0,
        totalMenuItems: menuItems.length,
        availableItems,
        totalAdmins: adminsResult.data?.length || 0,
      });

      setRecentContacts(recentContactsResult.data || []);
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
      title: 'Total Contacts',
      value: stats.totalContacts,
      icon: MessageSquare,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Menu Items',
      value: `${stats.availableItems}/${stats.totalMenuItems}`,
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
    },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      
      <main className="flex-1 lg:ml-72 xl:ml-72">
        <div className="p-6 space-y-8">
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
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {statCards.map((stat, index) => (
              <Card key={stat.title} className="admin-card animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Contacts */}
          <Card className="admin-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <span>Recent Contacts</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : recentContacts.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No contacts yet</p>
              ) : (
                <div className="space-y-4">
                  {recentContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{contact.name}</h4>
                        <p className="text-sm text-muted-foreground">{contact.email}</p>
                        {contact.message && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {contact.message}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {contact.phone && (
                          <a
                            href={`tel:${contact.phone}`}
                            className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                          >
                            <Phone className="w-4 h-4" />
                          </a>
                        )}
                        <a
                          href={`mailto:${contact.email}`}
                          className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors"
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;