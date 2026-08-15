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
      throw new Error(
        data?.detail ||
        data?.message ||
        `Request failed with status ${response.status}`
      );
    }

    return data;

  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export default apiClient;