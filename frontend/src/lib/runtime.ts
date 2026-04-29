const PRODUCTION_API_BASE_URL = "/api";
const PRODUCTION_BACKEND_ORIGIN = "https://hamrobichar-backend.onrender.com";
const PRODUCTION_SITE_URL = "https://hamrobichar.com";
const LOCAL_API_BASE_URL = "http://localhost:5000/api";
const LOCAL_BACKEND_ORIGIN = "http://localhost:5000";

const isLocalhostUrl = (value: string): boolean => /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(value);

export const getApiBaseUrl = (): string => {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

  if (process.env.NODE_ENV === "production") {
    if (configured && !isLocalhostUrl(configured) && !configured.startsWith("/")) {
      return configured.replace(/\/$/, "");
    }

    return PRODUCTION_API_BASE_URL;
  }

  return configured ?? LOCAL_API_BASE_URL;
};

export const getBackendOrigin = (): string => {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

  if (process.env.NODE_ENV === "production") {
    if (configured && !isLocalhostUrl(configured) && !configured.startsWith("/")) {
      return configured.replace(/\/api\/?$/, "").replace(/\/$/, "");
    }

    return PRODUCTION_BACKEND_ORIGIN;
  }

  if (configured && !configured.startsWith("/")) {
    return configured.replace(/\/api\/?$/, "").replace(/\/$/, "");
  }

  return LOCAL_BACKEND_ORIGIN;
};

export const getSiteUrl = (): string => {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (process.env.NODE_ENV === "production") {
    // Always enforce the canonical production domain during migration.
    return PRODUCTION_SITE_URL;
  }

  return configured ?? PRODUCTION_SITE_URL;
};