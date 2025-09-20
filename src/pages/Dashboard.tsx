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
  BarChart4
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { TopNavbar } from '@/components/layout/TopNavbar';
import { useAuth } from '@/contexts/AuthContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardStats {
  totalReviews: number;
  averageRating: number;
  totalContacts: number;
  totalMenuItems: number;
  totalAdmins: number;
}

interface ChartData {
  ratingDistribution: {
    labels: string[];
    data: number[];
  };
  categoryDistribution: {
    labels: string[];
    data: number[];
  };
}

const Dashboard = () => {
  const { admin } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalReviews: 0,
    averageRating: 0,
    totalContacts: 0,
    totalMenuItems: 0,
    totalAdmins: 0,
  });
  const [chartData, setChartData] = useState<ChartData>({
    ratingDistribution: {
      labels: ['1★', '2★', '3★', '4★', '5★'],
      data: [0, 0, 0, 0, 0],
    },
    categoryDistribution: {
      labels: [],
      data: [],
    }
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
        supabase.from('contact_form').select('id'), 
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
        totalContacts: contactFormResult.data?.length || 0,
        totalMenuItems: menuItems.length,
        totalAdmins: adminsResult.data?.length || 0,
      });

      // Process rating distribution
      const ratingCounts = [0, 0, 0, 0, 0]; // For ratings 1-5
      
      reviews.forEach(review => {
        const rating = Math.round(review.rating);
        if (rating >= 1 && rating <= 5) {
          ratingCounts[rating - 1]++;
        }
      });

      // Process menu item categories
      const categoryMap = new Map();
      
      menuItems.forEach(item => {
        const category = item.category || 'Uncategorized';
        categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
      });
      
      const categoryLabels = Array.from(categoryMap.keys());
      const categoryData = Array.from(categoryMap.values());
      
      // Update chart data
      setChartData({
        ratingDistribution: {
          labels: ['1★', '2★', '3★', '4★', '5★'],
          data: ratingCounts
        },
        categoryDistribution: {
          labels: categoryLabels,
          data: categoryData
        }
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
      title: 'Potential Clients',
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

  // Chart configuration for category distribution
  const categoryDistributionConfig = {
    data: {
      labels: chartData.categoryDistribution.labels,
      datasets: [
        {
          label: 'Menu Items',
          data: chartData.categoryDistribution.data,
          backgroundColor: [
            'rgba(243, 196, 73, 0.7)',
            'rgba(107, 31, 31, 0.7)',
            'rgba(46, 204, 113, 0.7)',
            'rgba(231, 76, 60, 0.7)',
            'rgba(52, 152, 219, 0.7)',
            'rgba(142, 68, 173, 0.7)',
            'rgba(41, 128, 185, 0.7)',
            'rgba(39, 174, 96, 0.7)',
            'rgba(211, 84, 0, 0.7)',
            'rgba(192, 57, 43, 0.7)',
          ],
          borderColor: 'rgba(15, 14, 14, 0.6)',
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right' as const,
          labels: {
            color: '#FFF9F2'
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(255, 255, 255, 0.05)'
          },
          ticks: {
            color: '#BDB3A3'
          }
        },
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.05)'
          },
          ticks: {
            color: '#BDB3A3'
          }
        }
      }
    }
  };

  const ratingDistributionConfig = {
    data: {
      labels: chartData.ratingDistribution.labels,
      datasets: [
        {
          label: 'Ratings',
          data: chartData.ratingDistribution.data,
          backgroundColor: [
            'rgba(231, 76, 60, 0.7)',
            'rgba(230, 126, 34, 0.7)',
            'rgba(241, 196, 15, 0.7)',
            'rgba(46, 204, 113, 0.7)',
            'rgba(52, 152, 219, 0.7)'
          ],
          borderWidth: 2,
          borderColor: 'rgba(15, 14, 14, 0.6)'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right' as const,
          labels: {
            color: '#FFF9F2'
          }
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNavbar />
      <main className="flex-1">
        <div className="p-4 space-y-6 max-w-5xl mx-auto w-full">
          {/* Dashboard Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground text-sm">Overview and analytics</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

          {/* Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Rating Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full overflow-x-auto">
                  <Bar data={categoryDistributionConfig.data} options={categoryDistributionConfig.options} />
                </div>
              </CardContent>
            </Card>
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full overflow-x-auto">
                  <Doughnut data={ratingDistributionConfig.data} options={ratingDistributionConfig.options} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;