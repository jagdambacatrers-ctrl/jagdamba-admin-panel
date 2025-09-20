import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { MessageSquare, Phone, Mail, Trash2, Loader2 } from 'lucide-react';
import WhatsAppIcon from '@/components/icons/WhatsAppIcon';
import { TopNavbar } from '@/components/layout/TopNavbar';
import { supabase, Contact } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const PotentialClients = () => {
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
        .from('contact_form')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch potential client data",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contact_form')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Potential client deleted successfully" });
      fetchContacts();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete potential client",
      });
    }
  };

  const openWhatsApp = (phone: string, name: string, eventType: string) => {
    const message = encodeURIComponent(`Hello ${name}, thank you for your ${eventType} inquiry with Jagdamba Caterers! How can we assist you today?`);
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  const openPhone = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const openEmail = (email: string, name: string, eventType: string, eventDate?: string) => {
    const subject = encodeURIComponent(`Re: Your ${eventType} inquiry - Jagdamba Caterers`);
    const dateInfo = eventDate ? `\n\nEvent Date: ${eventDate}` : '';
    const body = encodeURIComponent(`Dear ${name},\n\nThank you for your ${eventType} inquiry with Jagdamba Caterers. We have received your request and will get back to you soon.${dateInfo}\n\nBest regards,\nJagdamba Caterers Team`);
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_self');
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNavbar />
      
      <main className="flex-1">
        <div className="p-4 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Potential Clients</h1>
              <p className="text-muted-foreground">Manage inquiries from potential clients</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Potential Clients</p>
                <p className="text-2xl font-bold text-primary">{contacts.length}</p>
              </div>
            </div>
          </div>

          {/* Potential Clients Table */}
          <Card className="admin-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <span>Potential Client Inquiries</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-muted-foreground">Loading potential client inquiries...</p>
                </div>
              ) : contacts.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No potential client inquiries yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client Info</TableHead>
                        <TableHead>Event Details</TableHead>
                        <TableHead>Contact Info</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Date Submitted</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contacts.map((contact) => (
                        <TableRow key={contact.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{contact.name}</p>
                              <p className="text-sm text-muted-foreground">{contact.email}</p>
                              <p className="text-sm text-muted-foreground">{contact.phone}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium capitalize">{contact.event_type}</p>
                              {contact.event_date && (
                                <p className="text-sm text-muted-foreground">📅 {contact.event_date}</p>
                              )}
                              {contact.guest_count && (
                                <p className="text-sm text-muted-foreground">👥 {contact.guest_count} guests</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="text-sm">{contact.email}</p>
                              <p className="text-sm">{contact.phone}</p>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            {contact.message ? (
                              <p className="line-clamp-2">{contact.message}</p>
                            ) : (
                              <span className="text-muted-foreground">No message</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(contact.submitted_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex space-x-2 justify-end">
                              {/* WhatsApp Button */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openWhatsApp(contact.phone, contact.name, contact.event_type)}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                title="Open WhatsApp"
                              >
                                <WhatsAppIcon className="w-4 h-4" />
                              </Button>
                              
                              {/* Phone Button */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openPhone(contact.phone)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                title="Call"
                              >
                                <Phone className="w-4 h-4" />
                              </Button>
                              
                              {/* Email Button */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEmail(contact.email, contact.name, contact.event_type, contact.event_date)}
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
                                    title="Delete Potential Client"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Potential Client</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete the potential client inquiry from {contact.name}? 
                                      This action cannot be undone and you will lose this client information.
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


        </div>
      </main>
    </div>
  );
};

export default PotentialClients;