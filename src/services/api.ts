/**
 * SIAS Online — Frontend API service layer.
 * Generic wrapper around fetch() for calling PHP endpoints.
 */
const Api = {
  async request<T = any>(
    endpoint: string,
    method: string = "GET",
    body?: Record<string, any>,
  ): Promise<T> {
    const options: RequestInit = {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
    };
    if (body && method !== "GET") {
      options.body = JSON.stringify(body);
    }
    const response = await fetch(`api/${endpoint}`, options);
    const data = await response.json();
    if (!response.ok) {
      const message =
        data && typeof data === "object" && "error" in data
          ? (data as any).error
          : `Request failed (${response.status})`;
      throw new ApiError(message, response.status, data);
    }
    return data as T;
  },

  get<T = any>(endpoint: string): Promise<T> {
    return Api.request<T>(endpoint, "GET");
  },

  post<T = any>(endpoint: string, body: Record<string, any>): Promise<T> {
    return Api.request<T>(endpoint, "POST", body);
  },

  put<T = any>(endpoint: string, body: Record<string, any>): Promise<T> {
    return Api.request<T>(endpoint, "PUT", body);
  },

  del<T = any>(endpoint: string): Promise<T> {
    return Api.request<T>(endpoint, "DELETE");
  },
};

class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}
