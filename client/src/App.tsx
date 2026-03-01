import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Dashboard from "@/pages/dashboard";
import CampaignsPage from "@/pages/campaigns";
import CampaignBuilder from "@/pages/campaign-builder";
import CampaignDetail from "@/pages/campaign-detail";
import ContactsPage from "@/pages/contacts";
import SmtpsPage from "@/pages/smtps";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard}/>
      <Route path="/campaigns" component={CampaignsPage}/>
      <Route path="/campaigns/new" component={CampaignBuilder}/>
      <Route path="/campaigns/:id" component={CampaignDetail}/>
      <Route path="/contacts" component={ContactsPage}/>
      <Route path="/smtps" component={SmtpsPage}/>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
