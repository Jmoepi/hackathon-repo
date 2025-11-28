"use client";

import { useCallback } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

export function useReCaptcha() {
  const { executeRecaptcha } = useGoogleReCaptcha();

  const verifyReCaptcha = useCallback(
    async (action: string = "submit"): Promise<string | null> => {
      if (!executeRecaptcha) {
        console.warn("reCAPTCHA not initialized");
        return null;
      }

      try {
        const token = await executeRecaptcha(action);
        return token;
      } catch (error) {
        console.error("reCAPTCHA verification failed:", error);
        return null;
      }
    },
    [executeRecaptcha]
  );

  const isReady = !!executeRecaptcha;

  return {
    verifyReCaptcha,
    isReady,
  };
}
