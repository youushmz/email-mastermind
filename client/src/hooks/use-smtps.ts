import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertSmtp, type UpdateSmtpRequest } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useSmtps() {
  return useQuery({
    queryKey: [api.smtps.list.path],
    queryFn: async () => {
      const res = await fetch(api.smtps.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch SMTPs");
      return api.smtps.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateSmtp() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: InsertSmtp) => {
      const validated = api.smtps.create.input.parse(data);
      const res = await fetch(api.smtps.create.path, {
        method: api.smtps.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create SMTP");
      return api.smtps.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.smtps.list.path] });
      toast({ title: "Success", description: "SMTP configuration added successfully." });
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });
}

export function useUpdateSmtp() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & UpdateSmtpRequest) => {
      const validated = api.smtps.update.input.parse(updates);
      const url = buildUrl(api.smtps.update.path, { id });
      const res = await fetch(url, {
        method: api.smtps.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update SMTP");
      return api.smtps.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.smtps.list.path] });
      toast({ title: "Success", description: "SMTP configuration updated." });
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });
}

export function useDeleteSmtp() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.smtps.delete.path, { id });
      const res = await fetch(url, { method: api.smtps.delete.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete SMTP");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.smtps.list.path] });
      toast({ title: "Success", description: "SMTP configuration deleted." });
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });
}

export function useTestSmtp() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.smtps.test.path, { id });
      const res = await fetch(url, { method: api.smtps.test.method, credentials: "include" });
      if (!res.ok) throw new Error("Connection test failed");
      return api.smtps.test.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      toast({ 
        title: data.success ? "Connection Successful" : "Connection Failed", 
        description: data.message,
        variant: data.success ? "default" : "destructive"
      });
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });
}
