// src/api/privateAPI.js
import instance from "@/lib/axios";

/* ========================== */
/* Household Assessments API  */
/* ========================== */

/**
 * Create a new household assessment record
 * POST /api/assessments
 * data = full payload from the form
 */
const createAssessment = async (data) => {
  return await instance.apiClient.post("/api/assessments", data, {
    headers: instance.publicHeaders(),
  });
};

/**
 * Get today's household assessments (table data)
 * GET /api/assessments/today
 */
const getTodayAssessments = async () => {
  return await instance.apiClient.get("/api/assessments/today", {
    headers: instance.publicHeaders(),
  });
};

/**
 * Get today's dashboard stats (12 cards + 2 charts)
 * GET /api/assessments/today/stats
 */
const getTodayAssessmentStats = async () => {
  return await instance.apiClient.get("/api/assessments/today/stats", {
    headers: instance.publicHeaders(),
  });
};

/* ========================== */
/* Export API                 */
/* ========================== */

/**
 * Export today's assessments (fixed-date) as an Excel file
 * GET /api/assessments/today/export
 *
 * NOTE: This returns a binary file (xlsx), so we request it as a blob.
 */
const exportTodayAssessmentsExcel = async () => {
  return await instance.apiClient.get("/api/assessments/today/export", {
    headers: instance.publicHeaders(),
    responseType: "blob",
  });
};

const privateAPI = {
  createAssessment,
  getTodayAssessments,
  getTodayAssessmentStats,
  exportTodayAssessmentsExcel, // ✅ NEW
};

export default privateAPI;
