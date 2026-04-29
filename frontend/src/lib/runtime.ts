const PRODUCTION_API_BASE_URL = "https://hamrobichar-backend.onrender.com/api";
const PRODUCTION_SITE_URL = "https://hamrobichar.com";
const LOCAL_API_BASE_URL = "http://localhost:5000/api";

const isLocalhostUrl = (value: string): boolean => /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(value);

export const getApiBaseUrl = (): string => {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

  if (process.env.NODE_ENV === "production") {
    if (configured && !isLocalhostUrl(configured)) {
      return configured.replace(/\/$/, "");
    }

    return PRODUCTION_API_BASE_URL;
  }

  return configured ?? LOCAL_API_BASE_URL;
};

export const getSiteUrl = (): string => {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (process.env.NODE_ENV === "production") {
    if (configured && !isLocalhostUrl(configured)) {
      return configured.replace(/\/$/, "");
    }

    return PRODUCTION_SITE_URL;
  }

  return configured ?? PRODUCTION_SITE_URL;
};