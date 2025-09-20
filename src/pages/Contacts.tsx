import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { MessageSquare, Phone, Mail, Trash2, Loader2, ExternalLink } from 'lucide-react';
import { TopNavbar } from '@/components/layout/TopNavbar';
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
    <div className="min-h-screen bg-background flex flex-col">
      <TopNavbar />
      <main className="flex-1 w-full">
        <div className="p-2 sm:p-4 space-y-6 max-w-5xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Potential Clients</h1>
              <p className="text-muted-foreground text-sm sm:text-base">Manage inquiries from potential clients</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-xs sm:text-sm text-muted-foreground">Website Inquiries</p>
                <p className="text-xl sm:text-2xl font-bold text-primary">{contacts.length}</p>
              </div>
            </div>
          </div>

          {/* Contacts Table */}
          <Card className="admin-card w-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
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
                  <Table className="min-w-[700px]">
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
                              <p className="font-medium text-sm sm:text-base">{contact.name}</p>
                              <p className="text-xs sm:text-sm text-muted-foreground">{contact.email}</p>
                              <p className="text-xs sm:text-sm text-muted-foreground">{contact.phone}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium capitalize text-sm sm:text-base">{contact.event_type}</p>
                              {contact.event_date && (
                                <p className="text-xs sm:text-sm text-muted-foreground">📅 {contact.event_date}</p>
                              )}
                              {contact.guest_count && (
                                <p className="text-xs sm:text-sm text-muted-foreground">👥 {contact.guest_count} guests</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="text-xs sm:text-sm">{contact.email}</p>
                              <p className="text-xs sm:text-sm">{contact.phone}</p>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            {contact.message ? (
                              <p className="line-clamp-2 text-xs sm:text-sm">{contact.message}</p>
                            ) : (
                              <span className="text-muted-foreground text-xs sm:text-sm">No message</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="text-xs sm:text-sm">{new Date(contact.submitted_at).toLocaleDateString()}</span>
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
                                <MessageSquare className="w-4 h-4" />
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
        </div>
      </main>
    </div>
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


        </div>
      </main>
    </div>
  );
};

export default Contacts;