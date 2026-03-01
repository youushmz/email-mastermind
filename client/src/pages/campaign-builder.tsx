import { useState } from "react";
import { Layout } from "@/components/layout";
import { useCreateCampaign } from "@/hooks/use-campaigns";
import { useSmtps } from "@/hooks/use-smtps";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCampaignSchema } from "@shared/routes";
import { z } from "zod";
import { Server, ArrowLeft, Code } from "lucide-react";
import { Link } from "wouter";

type CampaignFormValues = z.infer<typeof insertCampaignSchema>;

export default function CampaignBuilder() {
  const { data: smtps = [] } = useSmtps();
  const createMutation = useCreateCampaign();

  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(insertCampaignSchema),
    defaultValues: {
      name: "",
      subject: "",
      content: "",
      smtpIds: [],
    }
  });

  const onSubmit = (data: CampaignFormValues) => {
    createMutation.mutate(data);
  };

  const selectedSmtpIds = form.watch("smtpIds") || [];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <Link href="/campaigns" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Campaigns
        </Link>
        
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-foreground">Campaign Builder</h1>
          <p className="text-muted-foreground mt-2 text-lg">Design your email and configure sending rotation.</p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="glass-panel rounded-2xl p-6 md:p-8 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base">Campaign Internal Name <span className="text-destructive">*</span></Label>
              <Input 
                id="name" 
                {...form.register("name")} 
                placeholder="e.g., Q4 Black Friday Promo" 
                className="bg-background/50 h-12 text-base border-white/10 focus:border-primary" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-base">Email Subject Line <span className="text-destructive">*</span></Label>
              <Input 
                id="subject" 
                {...form.register("subject")} 
                placeholder="Don't miss out on these exclusive deals..." 
                className="bg-background/50 h-12 text-base border-white/10 focus:border-primary" 
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="content" className="text-base">HTML Content <span className="text-destructive">*</span></Label>
                <div className="text-xs text-muted-foreground flex items-center bg-background px-2 py-1 rounded border border-white/5">
                  <Code className="w-3 h-3 mr-1" /> Raw HTML Mode
                </div>
              </div>
              <Textarea 
                id="content" 
                {...form.register("content")} 
                placeholder="<html><body><h1>Hello World</h1></body></html>" 
                className="bg-background/50 min-h-[300px] font-mono text-sm border-white/10 focus:border-primary p-4" 
              />
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 md:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="font-display text-xl font-bold flex items-center">
                  <Server className="w-5 h-5 mr-2 text-primary" />
                  SMTP Rotation
                </h3>
                <p className="text-muted-foreground text-sm mt-1">Select one or multiple SMTP servers to rotate sending.</p>
              </div>
              {smtps.length > 0 && (
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    if (selectedSmtpIds.length === smtps.length) {
                      form.setValue("smtpIds", [], { shouldValidate: true });
                    } else {
                      form.setValue("smtpIds", smtps.map(s => s.id), { shouldValidate: true });
                    }
                  }}
                >
                  {selectedSmtpIds.length === smtps.length ? "Deselect All" : "Select All"}
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {smtps.map((smtp) => {
                const isSelected = selectedSmtpIds.includes(smtp.id);
                return (
                  <div 
                    key={smtp.id}
                    className={`relative flex items-start space-x-3 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                      isSelected 
                        ? "bg-primary/10 border-primary shadow-[0_0_15px_rgba(79,70,229,0.15)]" 
                        : "bg-background/50 border-white/5 hover:border-white/20"
                    }`}
                    onClick={(e) => {
                      // Prevent double toggle when clicking the checkbox itself
                      if ((e.target as HTMLElement).closest('button[role="checkbox"]')) return;
                      
                      const newIds = isSelected 
                        ? selectedSmtpIds.filter(id => id !== smtp.id)
                        : [...selectedSmtpIds, smtp.id];
                      form.setValue("smtpIds", newIds, { shouldValidate: true });
                    }}
                  >
                    <Checkbox 
                      checked={isSelected}
                      onCheckedChange={(checked) => {
                        const newIds = checked 
                          ? [...selectedSmtpIds, smtp.id]
                          : selectedSmtpIds.filter(id => id !== smtp.id);
                        form.setValue("smtpIds", newIds, { shouldValidate: true });
                      }}
                      className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                    />
                    <div className="flex-1">
                      <Label className="font-medium text-base cursor-pointer">{smtp.name}</Label>
                      <p className="text-xs text-muted-foreground mt-1 font-mono">{smtp.host}</p>
                      <p className="text-xs text-muted-foreground mt-1">Quota: {smtp.dailyQuota} emails/day</p>
                    </div>
                  </div>
                );
              })}
              
              {smtps.length === 0 && (
                <div className="col-span-full p-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-sm">
                  You need to configure at least one SMTP server before you can send a campaign.
                  <Link href="/smtps" className="ml-2 underline font-medium hover:text-amber-300">Add SMTP Server</Link>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4 pb-12">
            <Button 
              type="submit" 
              size="lg" 
              disabled={createMutation.isPending || selectedSmtpIds.length === 0}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white shadow-xl shadow-primary/25 h-14 px-8 text-lg w-full md:w-auto"
            >
              {createMutation.isPending ? "Saving..." : "Save Draft & Continue"}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
