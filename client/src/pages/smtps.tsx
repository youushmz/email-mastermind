import { useState } from "react";
import { Layout } from "@/components/layout";
import { useSmtps, useCreateSmtp, useDeleteSmtp, useTestSmtp } from "@/hooks/use-smtps";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Server, Plus, Trash2, Activity, ShieldCheck, ShieldAlert } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSmtpSchema } from "@shared/routes";
import { z } from "zod";

type SmtpFormValues = z.infer<typeof insertSmtpSchema>;

export default function SmtpsPage() {
  const { data: smtps = [], isLoading } = useSmtps();
  const createMutation = useCreateSmtp();
  const deleteMutation = useDeleteSmtp();
  const testMutation = useTestSmtp();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const form = useForm<SmtpFormValues>({
    resolver: zodResolver(insertSmtpSchema),
    defaultValues: {
      name: "",
      host: "",
      port: 587,
      username: "",
      password: "",
      secure: true,
      dailyQuota: 500,
      isActive: true,
    }
  });

  const onSubmit = (data: SmtpFormValues) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setIsAddOpen(false);
        form.reset();
      }
    });
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-display font-bold text-foreground">SMTP Infrastructure</h1>
          <p className="text-muted-foreground mt-2 text-lg">Manage your sending IP rotation and servers.</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4 mr-2" />
              Add SMTP Server
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] bg-card border-border">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Add New SMTP Server</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input id="name" {...form.register("name")} placeholder="e.g. Amazon SES - Account 1" className="bg-background" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="host">Host</Label>
                  <Input id="host" {...form.register("host")} placeholder="smtp.mail.us-east-1.awsapps.com" className="bg-background" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="port">Port</Label>
                  <Input id="port" type="number" {...form.register("port", { valueAsNumber: true })} className="bg-background" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" {...form.register("username")} className="bg-background" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" {...form.register("password")} className="bg-background" />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="dailyQuota">Daily Quota (Emails/day)</Label>
                  <Input id="dailyQuota" type="number" {...form.register("dailyQuota", { valueAsNumber: true })} className="bg-background" />
                </div>
                <div className="flex items-center space-x-2 col-span-2 mt-2">
                  <Checkbox 
                    id="secure" 
                    checked={form.watch("secure")}
                    onCheckedChange={(checked) => form.setValue("secure", checked as boolean)}
                  />
                  <Label htmlFor="secure">Use Secure Connection (TLS/SSL)</Label>
                </div>
              </div>
              <Button type="submit" className="w-full mt-6" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Adding..." : "Save Configuration"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
        {smtps.map((smtp) => (
          <div key={smtp.id} className="glass-panel rounded-2xl p-6 flex flex-col hover-elevate group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Server className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg text-foreground">{smtp.name}</h3>
                  <p className="text-sm text-muted-foreground font-mono">{smtp.host}:{smtp.port}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {smtp.secure ? (
                  <div className="flex items-center text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-400/20">
                    <ShieldCheck className="w-3 h-3 mr-1" /> Secure
                  </div>
                ) : (
                  <div className="flex items-center text-xs text-amber-400 bg-amber-400/10 px-2 py-1 rounded-full border border-amber-400/20">
                    <ShieldAlert className="w-3 h-3 mr-1" /> Insecure
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 my-4 py-4 border-y border-white/5">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Username</p>
                <p className="text-sm font-medium truncate" title={smtp.username}>{smtp.username}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Quota Usage</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{smtp.usedQuota} / {smtp.dailyQuota}</p>
                  <div className="flex-1 h-1.5 bg-background rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary" 
                      style={{ width: `${Math.min(100, (smtp.usedQuota / smtp.dailyQuota) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto flex justify-end gap-3 pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-transparent border-white/10 hover:bg-white/5"
                onClick={() => testMutation.mutate(smtp.id)}
                disabled={testMutation.isPending}
              >
                <Activity className="w-4 h-4 mr-2 text-indigo-400" />
                Test Connection
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={() => {
                  if (confirm("Are you sure you want to delete this SMTP server?")) {
                    deleteMutation.mutate(smtp.id);
                  }
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}

        {smtps.length === 0 && !isLoading && (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-white/10 rounded-2xl glass-panel">
            <Server className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="font-display text-xl font-medium text-foreground">No SMTP servers configured</h3>
            <p className="text-muted-foreground mt-2 mb-6">Add your first SMTP server to start sending campaigns.</p>
            <Button onClick={() => setIsAddOpen(true)}>Add SMTP Server</Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
