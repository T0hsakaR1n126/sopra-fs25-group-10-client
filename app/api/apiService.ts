import { getApiDomain } from "@/utils/domain";
import { ApplicationError } from "@/types/error";

export class ApiService {
  private baseURL: string;
  private defaultHeaders: HeadersInit;
  
  constructor() {
    this.baseURL = getApiDomain();
    this.defaultHeaders = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    };
  }
  
  /**
  * Helper function to check the response, parse JSON,
  * and throw an error if the response is not OK.
  *
  * @param res - The response from fetch.
  * @param errorMessage - A descriptive error message for this call.
  * @returns Parsed JSON data.
  * @throws ApplicationError if res.ok is false.
  */
  private async processResponse<T>(
    res: Response
  ): Promise<T> {
    if (!res.ok) {
      let errorDetail = res.statusText;
      try {
        const errorInfo = await res.json();
        if (errorInfo?.message) {
          errorDetail = errorInfo.message;
        } else {
          errorDetail = JSON.stringify(errorInfo);
        }
      } catch {
        // If parsing fails, keep using res.statusText
      }
      const error: ApplicationError = new Error(
        errorDetail,
      ) as ApplicationError;
      error.info = JSON.stringify(
        { status: res.status, statusText: res.statusText },
        null,
        2,
      );
      error.status = res.status;
      throw error;
    }
    return res.headers.get("Content-Type")?.includes("application/json")
    ? res.json() as Promise<T>
    :Promise.resolve(res as T);
  }
  
  /**
  * GET request.
  * @param endpoint - The API endpoint (e.g. "/users").
  * @returns JSON data of type T.
  */
  public async get<T>(endpoint: string, options?: { headers?: Record<string, string> }): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers = {
      ...this.defaultHeaders,
      ...(options?.headers || {}),
    };
    
    const res = await fetch(url, {
      method: "GET",
      headers,
    });
    
    return this.processResponse<T>(
      res
    );
  }
  
  
  /**
  * POST request.
  * @param endpoint - The API endpoint (e.g. "/users").
  * @param data - The payload to post.
  * @returns JSON data of type T.
  */
  public async post<T>(endpoint: string, data: unknown, options?: { headers?: Record<string, string> }): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers = {
      ...this.defaultHeaders,
      ...(options?.headers || {}), // Merge optional headers
    };
    
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    
    return this.processResponse<T>(
      res
    );
  }
  
/**
 * PUT request.
 * @param endpoint - The API endpoint (e.g. "/users/123").
 * @param data - The payload to update.
 * @param options - Optional headers.
 * @returns JSON data of type T.
 */
public async put<T>(endpoint: string, data: unknown, options?: { headers?: Record<string, string> }): Promise<T> {
  const url = `${this.baseURL}${endpoint}`;

  const headers = {
    ...this.defaultHeaders,
    ...(options?.headers || {}), // Merge optional headers
  };

  const res = await fetch(url, {
    method: "PUT",
    headers,
    body: JSON.stringify(data),
  });

  return this.processResponse<T>(
    res
  );
}

/**
 * DELETE request.
 * @param endpoint - The API endpoint (e.g. "/users/123").
 * @param options - Optional headers.
 * @returns JSON data of type T.
 */
public async delete<T>(endpoint: string, options?: { headers?: Record<string, string> }): Promise<T> {
  const url = `${this.baseURL}${endpoint}`;

  const headers = {
    ...this.defaultHeaders,
    ...(options?.headers || {}), // Merge optional headers
  };

  const res = await fetch(url, {
    method: "DELETE",
    headers,
  });

  return this.processResponse<T>(
    res
  );
}

}
