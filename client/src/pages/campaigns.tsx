import { Layout } from "@/components/layout";
import { useCampaigns } from "@/hooks/use-campaigns";
import { Button } from "@/components/ui/button";
import { Plus, Megaphone, ArrowRight, Play, CheckCircle2, Clock } from "lucide-react";
import { Link } from "wouter";

export default function CampaignsPage() {
  const { data: campaigns = [], isLoading } = useCampaigns();

  const getStatusConfig = (status: string | null) => {
    switch(status) {
      case 'completed': return { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10' };
      case 'sending': return { icon: Play, color: 'text-indigo-400', bg: 'bg-indigo-400/10' };
      case 'draft': 
      default: return { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10' };
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-display font-bold text-foreground">Campaigns</h1>
          <p className="text-muted-foreground mt-2 text-lg">Create, send, and monitor your email marketing.</p>
        </div>

        <Link href="/campaigns/new">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {campaigns.map((campaign) => {
          const status = getStatusConfig(campaign.status);
          const StatusIcon = status.icon;

          return (
            <div key={campaign.id} className="glass-panel rounded-2xl p-6 flex flex-col hover-elevate transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${status.bg} border border-current/10`}>
                  <Megaphone className={`w-6 h-6 ${status.color}`} />
                </div>
                <div className={`flex items-center text-xs font-medium px-2.5 py-1 rounded-full border border-current/20 ${status.bg} ${status.color} capitalize tracking-wider`}>
                  <StatusIcon className="w-3 h-3 mr-1.5" />
                  {campaign.status || 'draft'}
                </div>
              </div>

              <h3 className="font-display text-xl font-bold text-foreground mb-1 line-clamp-1">{campaign.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-1 mb-6">Subj: {campaign.subject}</p>

              <div className="grid grid-cols-3 gap-2 mt-auto mb-6 p-4 rounded-xl bg-background/50 border border-white/5">
                <div className="text-center">
                  <p className="text-2xl font-bold font-display">{campaign.sentCount || 0}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">Sent</p>
                </div>
                <div className="text-center border-l border-white/10">
                  <p className="text-2xl font-bold font-display text-indigo-400">{campaign.openCount || 0}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">Opened</p>
                </div>
                <div className="text-center border-l border-white/10">
                  <p className="text-2xl font-bold font-display text-purple-400">{campaign.clickCount || 0}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">Clicked</p>
                </div>
              </div>

              <Link href={`/campaigns/${campaign.id}`} className="block w-full mt-auto">
                <Button variant="outline" className="w-full bg-transparent border-white/10 hover:bg-white/5 hover:text-primary transition-colors">
                  {campaign.status === 'draft' ? 'Continue Editing' : 'View Report'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          );
        })}

        {campaigns.length === 0 && !isLoading && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-white/10 rounded-2xl glass-panel">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Megaphone className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-display text-2xl font-medium text-foreground">No campaigns yet</h3>
            <p className="text-muted-foreground mt-2 mb-8 text-lg max-w-md mx-auto">Create your first campaign to start engaging with your audience and tracking performance.</p>
            <Link href="/campaigns/new">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 text-lg px-8 h-14">
                <Plus className="w-5 h-5 mr-2" />
                Create First Campaign
              </Button>
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}
