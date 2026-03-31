// src/lib/proposal.js
// Proposals API helper (fetch wrapper)
// Sizda token localStorage'da bo'lsa: accessToken

const API_URL = import.meta.env.VITE_API_URL ?? "";



const getToken = () => localStorage.getItem("accessToken");

/**
 * Universal request helper
 */
async function request(endpoint, options = {}) {
  const token = getToken();

  const config = {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...(options.body !== undefined ? { body: options.body } : {}),
  };

  const res = await fetch(`${API_URL}${endpoint}`, config);

  // 401 bo'lsa tokenni o'chirib login ga yo'naltirish (agar admin/client yo'nalish bo'lsa o'zgartirasiz)
  if (res.status === 401) {
    localStorage.removeItem("accessToken");
    // kerak bo'lsa: window.location.href = "/login";
  }

  // Ba'zan response bo'sh bo'lishi mumkin
  const text = await res.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { success: false, message: text || "Invalid JSON response" };
  }

  // Backend success false bo'lsa ham data qaytaraveramiz
  return data;
}

/* =========================
   PROPOSAL ENDPOINTS
   ========================= */

/**
 * POST /proposals
 * body: { job_id, cover_letter, proposed_price, proposed_duration }
 */
export function createProposal(payload) {
  return request("/proposals", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * GET /proposals
 * query: job_id, freelancer_id, status, page, limit
 */
export function getProposals(query = {}) {
  const qs = new URLSearchParams(query).toString();
  return request(`/proposals${qs ? `?${qs}` : ""}`);
}

/**
 * GET /proposals/:id
 */
export function getProposalById(id) {
  return request(`/proposals/${id}`);
}

/**
 * GET /proposals/my
 * query: status, page, limit
 */
export function getMyProposals(query = {}) {
  const qs = new URLSearchParams(query).toString();
  return request(`/proposals/my${qs ? `?${qs}` : ""}`);
}

/**
 * GET /proposals/project/:projectId
 * query: status, page, limit
 */
export function getProjectProposals(projectId, query = {}) {
  const qs = new URLSearchParams(query).toString();
  return request(`/proposals/project/${projectId}${qs ? `?${qs}` : ""}`);
}

/**
 * PUT /proposals/:id
 * body: { cover_letter?, proposed_price?, proposed_duration? }
 */
export function updateProposal(id, payload) {
  return request(`/proposals/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/**
 * DELETE /proposals/:id
 * Withdraw proposal
 */
export function withdrawProposal(id) {
  return request(`/proposals/${id}`, {
    method: "DELETE",
  });
}

/**
 * POST /proposals/:id/accept
 */
export function acceptProposal(id) {
  return request(`/proposals/${id}/accept`, {
    method: "POST",
  });
}

/**
 * POST /proposals/:id/reject
 */
export function rejectProposal(id) {
  return request(`/proposals/${id}/reject`, {
    method: "POST",
  });
}

/**
 * POST /proposals/:id/ai-writer
 */
export function aiWriter(id) {
  return request(`/proposals/${id}/ai-writer`, {
    method: "POST",
  });
}

/**
 * POST /proposals/:id/score
 */
export function aiScore(id) {
  return request(`/proposals/${id}/score`, {
    method: "POST",
  });
}


export default {
  createProposal,
  getProposals,
  getMyProposals,
  updateProposal,
  withdrawProposal,
  acceptProposal,
  rejectProposal,
  aiWriter,
  aiScore,
};
