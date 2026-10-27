
const API_BASE = "http://127.0.0.1:8000";

export async function checkBackend() {
  const response = await fetch(`${API_BASE}/health`);

  if (!response.ok) {
    throw new Error("EchoVault backend is not responding.");
  }

  return response.json();
}

export async function fetchMemories() {
  const response = await fetch(`${API_BASE}/memories`);

  if (!response.ok) {
    throw new Error("Could not load memories.");
  }

  return response.json();
}

export async function saveMemory(memory) {
  const response = await fetch(`${API_BASE}/memories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(memory),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Could not save memory.");
  }

  return response.json();
}

export async function deleteMemory(id) {
  const response = await fetch(
    `${API_BASE}/memories/${encodeURIComponent(id)}`,
    { method: "DELETE" }
  );

  if (!response.ok) {
    throw new Error("Could not delete memory.");
  }

  return response.json();
}



export async function updateMemory(id, memory) {
  const response = await fetch(
    `${API_BASE}/memories/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(memory),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Could not update memory.");
  }

  return response.json();
}
