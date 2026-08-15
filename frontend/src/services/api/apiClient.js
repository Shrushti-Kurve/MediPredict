const API_BASE_URL = "http://127.0.0.1:8000";

const apiClient = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  };

  if (options.body !== undefined) {
    config.body =
      typeof options.body === "string"
        ? options.body
        : JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);

    const text = await response.text();

    let data;

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = text;
    }

    if (!response.ok) {
      let errorMessage =
  `Request failed with status ${response.status}`;

if (typeof data?.detail === "string") {
  errorMessage = data.detail;
} else if (data?.detail) {
  errorMessage = JSON.stringify(data.detail);
} else if (typeof data?.message === "string") {
  errorMessage = data.message;
} else if (data?.message) {
  errorMessage = JSON.stringify(data.message);
}

throw new Error(errorMessage);
    }

    return data;

  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

apiClient.get = async (endpoint, options = {}) => {
  return apiClient(endpoint, {
    ...options,
    method: "GET",
  });
};

apiClient.post = async (endpoint, body = null, options = {}) => {
  return apiClient(endpoint, {
    ...options,
    method: "POST",
    body,
  });
};

apiClient.put = async (endpoint, body = null, options = {}) => {
  return apiClient(endpoint, {
    ...options,
    method: "PUT",
    body,
  });
};

apiClient.delete = async (endpoint, options = {}) => {
  return apiClient(endpoint, {
    ...options,
    method: "DELETE",
  });
};

export default apiClient;