const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export async function registerUser(userData) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    let message = "Registration failed";

    try {
      const errorData = await response.json();
      message = errorData.detail || message;
    } catch {
      // Keep default message
    }

    throw new Error(message);
  }

  return response.json();
}

export async function loginUser(email, password) {
  const formData = new URLSearchParams();

  formData.append("username", email);
  formData.append("password", password);

  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Invalid credentials");
  }

  const data = await response.json();

  const profileResponse = await fetch(`${API_BASE_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${data.access_token}`,
    },
  });

  if (profileResponse.ok) {
    const profile = await profileResponse.json();
    localStorage.setItem("userRole", profile.role);
  }

  return data;
}