import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Users, Plus, Edit, Trash2, Loader2, Shield, User } from 'lucide-react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { supabase, Admin } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Admins = () => {
  const { toast } = useToast();
  const { admin: currentAdmin } = useAuth();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    profile_picture: '',
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('admin')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAdmins(data || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch admins",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingAdmin) {
        // Update existing admin (don't update password if empty)
        const updateData = {
          username: formData.username,
          email: formData.email,
          profile_picture: formData.profile_picture,
          ...(formData.password && { password: formData.password })
        };

        const { error } = await supabase
          .from('admin')
          .update(updateData)
          .eq('id', editingAdmin.id);

        if (error) throw error;
        toast({ title: "Admin updated successfully" });
      } else {
        // Create new admin
        if (!formData.password) {
          throw new Error('Password is required for new admin');
        }

        const { error } = await supabase
          .from('admin')
          .insert([formData]);

        if (error) throw error;
        toast({ title: "Admin created successfully" });
      }

      setDialogOpen(false);
      resetForm();
      fetchAdmins();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save admin",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    // Prevent deleting current admin
    if (id === currentAdmin?.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You cannot delete your own account",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('admin')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Admin deleted successfully" });
      fetchAdmins();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete admin",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      profile_picture: '',
    });
    setEditingAdmin(null);
  };

  const openEditDialog = (admin: Admin) => {
    setEditingAdmin(admin);
    setFormData({
      username: admin.username,
      email: admin.email,
      password: '', // Don't pre-fill password for security
      profile_picture: admin.profile_picture || '',
    });
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      
      <main className="flex-1 lg:ml-72 xl:ml-72">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Admin Management</h1>
              <p className="text-muted-foreground">Manage admin accounts and permissions</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Admins</p>
                <p className="text-2xl font-bold text-primary">{admins.length}</p>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openCreateDialog} className="admin-button-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Admin
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {editingAdmin ? 'Edit Admin' : 'Add New Admin'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="username">Username *</Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="admin-input"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="admin-input"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">
                        Password {editingAdmin ? '(leave blank to keep current)' : '*'}
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="admin-input"
                        required={!editingAdmin}
                        placeholder={editingAdmin ? "Enter new password" : "Enter password"}
                      />
                    </div>
                    <div>
                      <Label htmlFor="profile_picture">Profile Picture URL</Label>
                      <Input
                        id="profile_picture"
                        type="url"
                        value={formData.profile_picture}
                        onChange={(e) => setFormData({ ...formData, profile_picture: e.target.value })}
                        className="admin-input"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    <div className="flex space-x-2 pt-4">
                      <Button type="submit" disabled={saving} className="flex-1">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        {editingAdmin ? 'Update' : 'Create'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setDialogOpen(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Current Admin Profile */}
          <Card className="admin-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-primary" />
                <span>Your Profile</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={currentAdmin?.profile_picture} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                    {currentAdmin?.username?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{currentAdmin?.username}</h3>
                  <p className="text-muted-foreground">{currentAdmin?.email}</p>
                  <p className="text-sm text-primary font-medium">Current Admin</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admins Table */}
          <Card className="admin-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>All Admins ({admins.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-muted-foreground">Loading admins...</p>
                </div>
              ) : admins.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No admins found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Admin</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {admins.map((admin) => (
                        <TableRow key={admin.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={admin.profile_picture} />
                                <AvatarFallback className="bg-secondary">
                                  {admin.username[0]?.toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{admin.username}</p>
                                {admin.id === currentAdmin?.id && (
                                  <p className="text-xs text-primary">You</p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{admin.email}</TableCell>
                          <TableCell>
                            {new Date(admin.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-sm text-green-600">Active</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex space-x-2 justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(admin)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              {admin.id !== currentAdmin?.id && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Admin</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete admin "{admin.username}"? 
                                        This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDelete(admin.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security Notice */}
          <Card className="admin-card border-amber-500/20 bg-amber-500/5">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-amber-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800 dark:text-amber-200">Security Notice</h4>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                    For production use, implement proper password hashing (bcrypt) and additional 
                    security measures. Current implementation is for demonstration purposes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Admins;