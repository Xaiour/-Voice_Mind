import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, uploadFile } from "@/lib/api-client";
import { toast } from "sonner";

/**
 * Hook for voice analysis operations — fetch history, upload, trigger analysis.
 */
export function useAnalysis() {
  const queryClient = useQueryClient();

  // Fetch analysis history
  const {
    data: historyData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["voice-history"],
    queryFn: async () => {
      const { data } = await api.get("/voice/history");
      return data;
    },
  });

  // Upload audio mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const { data } = await uploadFile("/voice/upload", file);
      return data;
    },
    onSuccess: (data) => {
      toast.success("Audio uploaded! Analysis in progress.");
      queryClient.invalidateQueries({ queryKey: ["voice-history"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Upload failed");
    },
  });

  // Get single analysis
  const getAnalysis = async (id: string) => {
    const { data } = await api.get(`/voice/analysis/${id}`);
    return data.data;
  };

  return {
    analyses: historyData?.data || [],
    pagination: historyData?.pagination,
    isLoading,
    refetch,
    uploadAudio: uploadMutation.mutate,
    isUploading: uploadMutation.isPending,
    getAnalysis,
  };
}
