import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertCampaign } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export function useCampaigns() {
  return useQuery({
    queryKey: [api.campaigns.list.path],
    queryFn: async () => {
      const res = await fetch(api.campaigns.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch campaigns");
      return api.campaigns.list.responses[200].parse(await res.json());
    },
  });
}

export function useCampaign(id: number) {
  return useQuery({
    queryKey: [api.campaigns.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.campaigns.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch campaign");
      return api.campaigns.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  return useMutation({
    mutationFn: async (data: InsertCampaign) => {
      const validated = api.campaigns.create.input.parse(data);
      const res = await fetch(api.campaigns.create.path, {
        method: api.campaigns.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create campaign");
      return api.campaigns.create.responses[201].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.campaigns.list.path] });
      toast({ title: "Campaign Created", description: "Your campaign has been saved as a draft." });
      setLocation(`/campaigns/${data.id}`);
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });
}

export function useSendCampaign() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.campaigns.send.path, { id });
      const res = await fetch(url, { method: api.campaigns.send.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to send campaign");
      return api.campaigns.send.responses[200].parse(await res.json());
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: [api.campaigns.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.campaigns.get.path, id] });
      toast({ title: "Campaign Sending", description: data.message });
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });
}
