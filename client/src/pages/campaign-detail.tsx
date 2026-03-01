import { Layout } from "@/components/layout";
import { useCampaign, useSendCampaign } from "@/hooks/use-campaigns";
import { useSmtps } from "@/hooks/use-smtps";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Send, 
  Loader2, 
  CheckCircle2, 
  Server,
  Mail,
  MousePointerClick,
  MailOpen
} from "lucide-react";

export default function CampaignDetail() {
  const [, params] = useRoute("/campaigns/:id");
  const campaignId = Number(params?.id);
  
  const { data: campaign, isLoading: isLoadingCampaign } = useCampaign(campaignId);
  const { data: smtps = [], isLoading: isLoadingSmtps } = useSmtps();
  const sendMutation = useSendCampaign();

  const isLoading = isLoadingCampaign || isLoadingSmtps;

  if (isLoading) {
    return (
      <Layout>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!campaign) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-display font-bold text-foreground">Campaign not found</h2>
          <Link href="/campaigns" className="text-primary hover:underline mt-4 inline-block">Return to campaigns</Link>
        </div>
      </Layout>
    );
  }

  const isSending = sendMutation.isPending;
  const isDraft = campaign.status === 'draft';
  const isCompleted = campaign.status === 'completed';

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <Link href="/campaigns" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Campaigns
        </Link>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-display font-bold text-foreground">{campaign.name}</h1>
              {isDraft && <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Draft</span>}
              {isCompleted && <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Completed</span>}
              {campaign.status === 'sending' && <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse">Sending...</span>}
            </div>
            <p className="text-muted-foreground text-lg flex items-center">
              <Mail className="w-4 h-4 mr-2" />
              Subj: {campaign.subject}
            </p>
          </div>

          {isDraft && (
            <Button 
              size="lg"
              onClick={() => sendMutation.mutate(campaign.id)}
              disabled={isSending}
              className="bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-white shadow-xl shadow-emerald-500/20 h-12 px-8 w-full md:w-auto"
            >
              {isSending ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Send className="w-5 h-5 mr-2" />}
              {isSending ? "Initiating Send..." : "Send Campaign Now"}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-panel rounded-xl p-5 border-l-4 border-l-primary flex flex-col justify-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Total Sent</p>
            <p className="text-3xl font-display font-bold">{campaign.sentCount || 0}</p>
          </div>
          <div className="glass-panel rounded-xl p-5 border-l-4 border-l-indigo-500 flex flex-col justify-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1 flex items-center"><MailOpen className="w-3 h-3 mr-1"/> Opens</p>
            <p className="text-3xl font-display font-bold text-indigo-400">{campaign.openCount || 0}</p>
          </div>
          <div className="glass-panel rounded-xl p-5 border-l-4 border-l-purple-500 flex flex-col justify-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1 flex items-center"><MousePointerClick className="w-3 h-3 mr-1"/> Clicks</p>
            <p className="text-3xl font-display font-bold text-purple-400">{campaign.clickCount || 0}</p>
          </div>
          <div className="glass-panel rounded-xl p-5 border-l-4 border-l-rose-500 flex flex-col justify-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Bounced</p>
            <p className="text-3xl font-display font-bold text-rose-400">{campaign.failCount || 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 glass-panel rounded-2xl p-6 md:p-8">
            <h3 className="text-xl font-display font-bold border-b border-white/10 pb-4 mb-4 text-foreground flex justify-between items-center">
              Email Content
            </h3>
            <div className="bg-white text-black p-6 rounded-lg min-h-[400px] overflow-auto border border-white/20 shadow-inner">
              {/* Note: In a real app we'd use dangerouslySetInnerHTML safely, doing it here for the preview effect */}
              <div dangerouslySetInnerHTML={{ __html: campaign.content }} />
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-panel rounded-2xl p-6">
              <h3 className="text-lg font-display font-bold mb-4 flex items-center">
                <Server className="w-4 h-4 mr-2 text-primary" />
                SMTP Rotation
              </h3>
              {campaign.smtpIds && campaign.smtpIds.length > 0 ? (
                <div className="space-y-3">
                  {campaign.smtpIds.map((id) => {
                    const smtp = smtps.find(s => s.id === id);
                    return (
                      <div key={id} className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-white/5">
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{smtp?.name || `Unknown SMTP (${id})`}</span>
                          {smtp && <span className="font-mono text-[10px] text-muted-foreground">{smtp.host}</span>}
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      </div>
                    );
                  })}
                  <p className="text-xs text-muted-foreground text-center mt-4">
                    Emails will be distributed evenly across these {campaign.smtpIds.length} servers to maintain reputation.
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No SMTP servers selected for this campaign.</p>
              )}
            </div>
            
            {!isDraft && (
              <div className="glass-panel rounded-2xl p-6 bg-gradient-to-br from-card to-primary/5">
                <h3 className="text-lg font-display font-bold mb-2">Tracking Engine Active</h3>
                <p className="text-sm text-muted-foreground">
                  The hidden tracking pixel and link redirectors have been successfully injected into this campaign. Real-time stats are flowing.
                </p>
                <div className="mt-4 flex items-center justify-center h-2 bg-background rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-full animate-[pulse_2s_ease-in-out_infinite]" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
