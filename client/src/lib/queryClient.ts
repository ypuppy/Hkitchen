import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    console.warn(`API request failed with status ${res.status} for ${res.url}`);
    let errorMessage;
    try {
      const errorText = await res.text();
      console.error(`Error response body: ${errorText}`);
      
      // Try to parse JSON error message
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorText;
      } catch (e) {
        // If not JSON, use the text directly
        errorMessage = errorText;
      }
    } catch (e) {
      errorMessage = res.statusText;
    }
    
    throw new Error(errorMessage || `Request failed with status ${res.status}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  console.log(`Making ${method} request to ${url}`, data ? { data } : '');
  
  try {
    const res = await fetch(url, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });
    
    // Don't throw here, just return the response for more flexible handling
    return res;
  } catch (error: any) {
    console.error(`Network error during ${method} request to ${url}:`, error);
    throw new Error(`Network error: ${error?.message || 'Unknown error'}`);
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn = <TData = unknown>(options: {
  on401: UnauthorizedBehavior;
}): QueryFunction<TData | null> => {
  return async ({ queryKey }) => {
    console.log(`Making query request to ${queryKey[0]}`);
    
    try {
      const res = await fetch(queryKey[0] as string, {
        credentials: "include",
      });
      
      console.log(`Query response from ${queryKey[0]}: status ${res.status}`);
      
      if (options.on401 === "returnNull" && res.status === 401) {
        console.log(`Unauthorized request to ${queryKey[0]}, returning null as configured`);
        return null;
      }
      
      if (!res.ok) {
        await throwIfResNotOk(res);
      }
      
      const data = await res.json() as TData;
      return data;
    } catch (error) {
      console.error(`Error in query to ${queryKey[0]}:`, error);
      throw error;
    }
  };
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
