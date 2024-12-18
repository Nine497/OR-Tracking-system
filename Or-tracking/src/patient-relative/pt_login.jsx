import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

function PatientRelativeLogin() {
  const location = useLocation();
  const [decodedToken, setDecodedToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");

    const validateToken = async () => {
      try {
        if (token) {
          const response = await axios.post("/api/validate-token", { token });
          if (response.data.valid) {
            setDecodedToken(response.data.decoded);
          } else {
            setErrorMessage("Invalid or expired token.");
          }
        } else {
          setErrorMessage("Token not found in URL.");
        }
      } catch (error) {
        console.error("Error validating token:", error);
        setErrorMessage("Error validating token.");
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [location]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex items-center justify-center h-screen w-screen">
      {decodedToken ? (
        <div>
          <h1>Case ID: {decodedToken.surgery_case_id}</h1>
        </div>
      ) : (
        <h1>{errorMessage}</h1>
      )}
    </div>
  );
}

export default PatientRelativeLogin;
