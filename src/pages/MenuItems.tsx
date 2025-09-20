import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ChefHat, Plus, Edit, Trash2, Loader2, Image as ImageIcon, DollarSign, Upload } from 'lucide-react';
import { TopNavbar } from '@/components/layout/TopNavbar';
import { supabase, MenuItem } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';


const MenuItems = () => {
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    hindi_name: '',
    english_name: '',
    description: '',
    price: '',
    category: '',
    image: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');



  // Filtered menu items
  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch =
      searchTerm.trim() === '' ||
      item.hindi_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.english_name && item.english_name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('date_added', { ascending: false });

      if (error) throw error;
      setMenuItems(data || []);
      
      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(
          data
            ?.filter(item => item.category && item.category.trim() !== '')
            .map(item => item.category) || []
        )
      ).sort() as string[];
      
      setCategories(uniqueCategories);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch menu items",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let imageUrl = formData.image;
      
      // If there's a new image file, upload it first
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      // Process the form data
      const itemData = {
        ...formData,
        price: formData.price ? parseFloat(formData.price) : 0,
        image: imageUrl || null,
      };

      if (editingItem) {
        // Update existing item
        const { error } = await supabase
          .from('menu_items')
          .update(itemData)
          .eq('id', editingItem.id);

        if (error) throw error;
        toast({ title: "Menu item updated successfully" });
      } else {
        // Create new item
        const { error } = await supabase
          .from('menu_items')
          .insert([itemData]);

        if (error) throw error;
        toast({ title: "Menu item created successfully" });
      }

      setDialogOpen(false);
      resetForm();
      fetchMenuItems();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save menu item",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Menu item deleted successfully" });
      fetchMenuItems();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete menu item",
      });
    }
  };

  // Remove this function since there's no 'available' field in the actual schema

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const uploadImage = async (file: File): Promise<string> => {
    try {
      setUploading(true);
      
      // Validate file before upload
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file');
      }
      
      // Size validation (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size should be less than 5MB');
      }
      
      // Create a unique filename using timestamp and original name
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
      
      // Upload to the menu-images bucket
      const { data, error } = await supabase.storage
        .from('menu-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true, // Overwrite any existing file with the same name
          contentType: file.type // Set the correct content type
        });
        
      if (error) {
        console.error('Upload error:', error);
        throw error;
      }
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('menu-images')
        .getPublicUrl(fileName);
      
      console.log('Image uploaded successfully:', publicUrl);  
      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        variant: "destructive",
        title: "Image Upload Failed",
        description: "Could not upload the image. Please try again.",
      });
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      hindi_name: '',
      english_name: '',
      description: '',
      price: '',
      category: '',
      image: '',
    });
    setImageFile(null);
    setImagePreview(null);
    setEditingItem(null);
  };

  const openEditDialog = (item: MenuItem) => {
    // Ensure the item is properly defined and has all required properties
    if (!item || typeof item !== 'object') {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid menu item data",
      });
      return;
    }
    
    setEditingItem(item);
    
    try {
      setFormData({
        hindi_name: item.hindi_name || '',
        english_name: item.english_name || '',
        description: item.description || '',
        price: typeof item.price === 'number' ? item.price.toString() : '',
        category: item.category || '',
        image: item.image || '',
      });
      
      // Set image preview if item has image
      setImagePreview(item.image || null);
      setDialogOpen(true);
    } catch (error) {
      console.error("Error in openEditDialog:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not open edit dialog. Please try again.",
      });
    }
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const formatPrice = (price: number | null | undefined) => {
    if (price === null || price === undefined) {
      return 'Price not set';
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(price);
  };

  const totalItems = menuItems.length;

  return (
    <div className="min-h-screen bg-background">
      <TopNavbar />
      <main className="flex-1">
        <div className="p-4 space-y-6 max-w-4xl mx-auto w-full">
          {/* Header and Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="w-full">
              <h1 className="text-2xl sm:text-3xl font-bold">Menu Items</h1>
              <p className="text-muted-foreground text-sm">Manage and update your menu items</p>
            </div>
            <div className="flex flex-col sm:flex-row items-end sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <Input
                className="w-full sm:w-64"
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openCreateDialog} className="w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg w-full">
                  <DialogHeader className="pb-2">
                    <DialogTitle>
                      {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="hindi_name" className="text-sm">Hindi Name *</Label>
                        <Input
                          id="hindi_name"
                          value={formData.hindi_name}
                          onChange={(e) => setFormData({ ...formData, hindi_name: e.target.value })}
                          className="admin-input"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="english_name" className="text-sm">English Name</Label>
                        <Input
                          id="english_name"
                          value={formData.english_name}
                          onChange={(e) => setFormData({ ...formData, english_name: e.target.value })}
                          className="admin-input"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="category" className="text-sm">Category</Label>
                      <Select
                        value={formData.category || ""}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger className="admin-input">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.length > 0 ? (
                            categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="" disabled>
                              No categories available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      
                      {/* Option to enter custom category */}
                      <div className="mt-2 flex items-center space-x-2 text-sm">
                        <span className="text-muted-foreground">Can't find your category?</span>
                        <Button 
                          type="button" 
                          variant="link" 
                          className="p-0 h-auto text-primary"
                          onClick={() => {
                            // Get custom category from user
                            const customCategory = window.prompt('Enter a custom category name:');
                            if (customCategory && customCategory.trim() !== '') {
                              setFormData({ ...formData, category: customCategory.trim() });
                              
                              // Add to categories if not already there
                              if (!categories.includes(customCategory.trim())) {
                                setCategories([...categories, customCategory.trim()].sort());
                              }
                            }
                          }}
                        >
                          Add custom category
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="description" className="text-sm">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="admin-input min-h-[80px]"
                        placeholder="Describe the dish..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="price" className="text-sm">Price (₹)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="admin-input"
                      />
                    </div>

                    <div>
                      <Label className="text-sm">Menu Item Image</Label>
                      
                      <div className="mt-2 space-y-3">
                        {/* Image preview */}
                        {imagePreview && (
                          <div className="mt-2 relative">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-full h-32 object-cover rounded-md"
                              onError={(e) => {
                                console.error('Image failed to load');
                                // Fall back to placeholder if image fails to load
                                (e.target as HTMLImageElement).src = '/placeholder.svg';
                              }}
                            />
                          </div>
                        )}
                        
                        {/* File input - hidden but triggered by the button */}
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                        
                        {/* Button to trigger file input */}
                        <Button 
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {imagePreview ? 'Change Image' : 'Upload Image (Optional)'}
                        </Button>
                      </div>
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <Button type="submit" disabled={saving || uploading} className="flex-1 h-9">
                        {(saving || uploading) && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
                        {uploading ? 'Uploading...' : 
                          saving ? 'Saving...' : 
                          editingItem ? 'Update' : 'Create'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setDialogOpen(false)}
                        className="flex-1 h-9"
                        disabled={saving || uploading}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Menu Items Table/Card List */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ChefHat className="w-5 h-5" />
                <span>All Menu Items ({filteredMenuItems.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-muted-foreground">Loading menu items...</p>
                </div>
              ) : filteredMenuItems.length === 0 ? (
                <div className="text-center py-8">
                  <ChefHat className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No menu items found</p>
                </div>
              ) : (
                <div className="overflow-x-auto w-full">
                  <Table className="min-w-[700px] w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Image</TableHead>
                        <TableHead>Names</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMenuItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.hindi_name}
                                className="w-12 h-12 object-cover rounded-lg"
                                onError={(e) => {
                                  // Replace with placeholder if image fails to load
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.parentElement?.querySelector('.image-fallback')?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <div className={`w-12 h-12 bg-muted rounded-lg flex items-center justify-center image-fallback ${item.image ? 'hidden' : ''}`}>
                              <ImageIcon className="w-5 h-5 text-muted-foreground" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.hindi_name}</p>
                              {item.english_name && (
                                <p className="text-sm text-muted-foreground">{item.english_name}</p>
                              )}
                              {item.description && (
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {item.category ? (
                              <Badge variant="outline">{item.category}</Badge>
                            ) : (
                              <span className="text-muted-foreground">Uncategorized</span>
                            )}
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatPrice(item.price)}
                          </TableCell>
                          <TableCell>
                            {new Date(item.date_added).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex space-x-2 justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(item)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Menu Item</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{item.hindi_name}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(item.id)}
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

export default MenuItems;