import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { MessageSquare, Phone, Mail, Trash2, Loader2, ExternalLink } from 'lucide-react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { supabase, Contact } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const Contacts = () => {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch contacts",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Customer inquiry deleted successfully" });
      fetchContacts();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete contact",
      });
    }
  };

  const openWhatsApp = (phone: string, name: string) => {
    const message = encodeURIComponent(`Hello ${name}, thank you for contacting Jagdamba Caterers! How can we assist you today?`);
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  const openPhone = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const openEmail = (email: string, name: string) => {
    const subject = encodeURIComponent('Re: Your inquiry - Jagdamba Caterers');
    const body = encodeURIComponent(`Dear ${name},\n\nThank you for contacting Jagdamba Caterers. We have received your message and will get back to you soon.\n\nBest regards,\nJagdamba Caterers Team`);
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_self');
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      
      <main className="flex-1 lg:ml-72 xl:ml-72">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Potential Clients</h1>
              <p className="text-muted-foreground">Manage customer inquiries from website contact forms</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Website Inquiries</p>
                <p className="text-2xl font-bold text-primary">{contacts.length}</p>
              </div>
            </div>
          </div>

          {/* Contacts Table */}
          <Card className="admin-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <span>Customer Inquiries from Website</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-muted-foreground">Loading customer inquiries...</p>
                </div>
              ) : contacts.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No customer inquiries yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contacts.map((contact) => (
                        <TableRow key={contact.id}>
                          <TableCell className="font-medium">{contact.name}</TableCell>
                          <TableCell>{contact.email}</TableCell>
                          <TableCell>{contact.phone || 'N/A'}</TableCell>
                          <TableCell className="max-w-xs">
                            {contact.message ? (
                              <p className="line-clamp-2">{contact.message}</p>
                            ) : (
                              <span className="text-muted-foreground">No message</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(contact.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex space-x-2 justify-end">
                              {/* WhatsApp Button */}
                              {contact.phone && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openWhatsApp(contact.phone!, contact.name)}
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  title="Open WhatsApp"
                                >
                                  <MessageSquare className="w-4 h-4" />
                                </Button>
                              )}
                              
                              {/* Phone Button */}
                              {contact.phone && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openPhone(contact.phone!)}
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  title="Call"
                                >
                                  <Phone className="w-4 h-4" />
                                </Button>
                              )}
                              
                              {/* Email Button */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEmail(contact.email, contact.name)}
                                className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                title="Send Email"
                              >
                                <Mail className="w-4 h-4" />
                              </Button>
                              
                              {/* Delete Button */}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    title="Delete Contact"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Customer Inquiry</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete the inquiry from {contact.name}? 
                                      This action cannot be undone and you will lose this potential client information.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(contact.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
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

          {/* Quick Actions Card */}
          <Card className="admin-card">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <MessageSquare className="w-8 h-8 text-green-600" />
                  <div>
                    <h3 className="font-medium">WhatsApp</h3>
                    <p className="text-sm text-muted-foreground">Quick chat with customers</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <Phone className="w-8 h-8 text-blue-600" />
                  <div>
                    <h3 className="font-medium">Phone Call</h3>
                    <p className="text-sm text-muted-foreground">Direct customer calls</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <Mail className="w-8 h-8 text-purple-600" />
                  <div>
                    <h3 className="font-medium">Email</h3>
                    <p className="text-sm text-muted-foreground">Professional email responses</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Contacts;