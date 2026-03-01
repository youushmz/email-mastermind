import { useState } from "react";
import { Layout } from "@/components/layout";
import { useContacts, useCreateContact, useDeleteContact } from "@/hooks/use-contacts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Users, Plus, Trash2, Search, Upload, Filter, Globe, Smartphone } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertContactSchema } from "@shared/routes";
import { z } from "zod";

type ContactFormValues = z.infer<typeof insertContactSchema>;

export default function ContactsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [deviceFilter, setDeviceFilter] = useState<string>("all");
  
  const { data: contacts = [], isLoading } = useContacts({ 
    country: countryFilter === "all" ? undefined : countryFilter,
    device: deviceFilter === "all" ? undefined : deviceFilter
  });

  const createMutation = useCreateContact();
  const deleteMutation = useDeleteContact();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(insertContactSchema),
    defaultValues: { email: "", firstName: "", lastName: "" }
  });

  const onSubmit = (data: ContactFormValues) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setIsAddOpen(false);
        form.reset();
      }
    });
  };

  const filteredContacts = contacts.filter(c => 
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.firstName && c.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.lastName && c.lastName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-display font-bold text-foreground">Contact Database</h1>
          <p className="text-muted-foreground mt-2 text-lg">Manage your subscribers and mailing lists.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button variant="outline" className="bg-card border-white/10 hidden sm:flex">
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
          </Button>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-card border-border">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">Add New Contact</DialogTitle>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
                  <Input id="email" type="email" {...form.register("email")} className="bg-background" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" {...form.register("firstName")} className="bg-background" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" {...form.register("lastName")} className="bg-background" />
                  </div>
                </div>
                <Button type="submit" className="w-full mt-6" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Adding..." : "Save Contact"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search contacts..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-card border-white/10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-muted-foreground" />
          <Select value={countryFilter} onValueChange={setCountryFilter}>
            <SelectTrigger className="w-[140px] bg-card border-white/10">
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              <SelectItem value="US">USA</SelectItem>
              <SelectItem value="GB">UK</SelectItem>
              <SelectItem value="CA">Canada</SelectItem>
              <SelectItem value="DE">Germany</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-muted-foreground" />
          <Select value={deviceFilter} onValueChange={setDeviceFilter}>
            <SelectTrigger className="w-[140px] bg-card border-white/10">
              <SelectValue placeholder="Device" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Devices</SelectItem>
              <SelectItem value="Desktop">Desktop</SelectItem>
              <SelectItem value="Mobile">Mobile</SelectItem>
              <SelectItem value="Tablet">Tablet</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        <Table>
          <TableHeader className="bg-background/40">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="font-medium text-muted-foreground w-12"></TableHead>
              <TableHead className="font-medium text-muted-foreground">Email</TableHead>
              <TableHead className="font-medium text-muted-foreground">Name</TableHead>
              <TableHead className="font-medium text-muted-foreground">Location</TableHead>
              <TableHead className="font-medium text-muted-foreground">Device</TableHead>
              <TableHead className="font-medium text-muted-foreground">Added Date</TableHead>
              <TableHead className="text-right font-medium text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContacts.length > 0 ? (
              filteredContacts.map((contact) => (
                <TableRow key={contact.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                  <TableCell>
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                      {contact.email.charAt(0).toUpperCase()}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{contact.email}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {[contact.firstName, contact.lastName].filter(Boolean).join(" ") || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {contact.country || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {contact.device || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        if (confirm("Remove this contact?")) {
                          deleteMutation.mutate(contact.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={7} className="h-48 text-center text-muted-foreground">
                  {isLoading ? "Loading contacts..." : "No contacts found matching filters."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Layout>
  );
}
