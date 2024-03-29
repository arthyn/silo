import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStorage } from "../state/storage";

export function useS3Redirect() {
  const navigate = useNavigate();
  const { loaded, hasCredentials, s3 } = useStorage();

  useEffect(() => {
    if (loaded && (!hasCredentials || !s3.configuration.currentBucket)) {
      navigate('/')
    }
  }, [loaded, hasCredentials])
}