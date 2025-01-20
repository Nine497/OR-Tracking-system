import React, { useState } from "react";
import LanguageSelector from "../components/LanguageSelector";
import { axiosInstancePatient } from "../../admin/api/axiosInstance";

const Policy = ({
  t,
  handleAcceptPolicy,
  handleDeclinePolicy,
  visible,
  handleCloseModal,
  link,
}) => {
  if (!visible) return null;

  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPolicy, setAgreedPolicy] = useState(false);

  const handleTermsChange = (e) => {
    setAgreedTerms(e.target.checked);
  };

  const handlePolicyChange = (e) => {
    setAgreedPolicy(e.target.checked);
  };

  const saveAcceptedTerms = async () => {
    try {
      const response = await axiosInstancePatient.post(
        `link_cases/accept_terms/${link}`
      );

      if (response.status === 200) {
        const data = response.data;
        console.log("Terms accepted successfully", data);
      } else {
        throw new Error("Failed to save terms acceptance");
      }
    } catch (error) {
      console.error("Error accepting terms:", error);
    }
  };

  const handleAccept = async () => {
    if (agreedTerms && agreedPolicy) {
      try {
        await saveAcceptedTerms();
        handleAcceptPolicy();
      } catch (error) {
        alert(t("login.TERMS_ACCEPTANCE_FAILED"));
        console.error("Error accepting terms:", error);
      }
    } else {
      alert(t("login.POLICY_NOT_AGREED"));
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto flex justify-center items-center z-50 p-4 sm:p-6 md:p-8">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl relative">
        <div className="p-4 sm:p-6 md:p-8">
          <header className="flex flex-row justify-between items-center border-b pb-4 mb-4 gap-4">
            <div className="flex items-center gap-3">
              <svg
                className="w-6 h-6 text-black"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <h2 className="text-lg sm:text-xl font-medium text-black">
                {t("login.TERMS_TITLE")}
              </h2>
            </div>
            <div className="w-auto ml-auto">
              <LanguageSelector />
            </div>
          </header>

          <main>
            <div className="overflow-y-auto max-h-[40vh] sm:max-h-[60vh] md:max-h-96 mb-6 px-3 py-4 bg-gray-50 rounded-lg">
              <div className="mb-4">
                {/* Terms Heading */}
                <span className="text-base font-semibold text-gray-700">
                  {t("login.TERMS_HEAD")}
                </span>
                <p className="font-normal text-sm sm:text-base text-gray-600 leading-relaxed mt-2">
                  {t("login.TERMS_TEXT")}
                </p>
              </div>

              <div className="mb-4">
                {/* Policy Heading */}
                <span className="text-base font-semibold text-gray-700">
                  {t("login.POLICY_HEAD")}
                </span>
                <p className="font-normal text-sm sm:text-base text-gray-600 leading-relaxed mt-2">
                  {t("login.POLICY_TEXT")}
                </p>
              </div>
            </div>

            <div className="mb-6">
              {/* Terms and Conditions Checkbox */}
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={handleTermsChange}
                  className="h-5 w-5 text-blue-600 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm sm:text-base text-gray-600">
                  {t("login.AGREE")}{" "}
                  <span className="font-semibold">{t("login.TERMS_HEAD")}</span>
                </label>
              </div>

              {/* Privacy Policy Checkbox */}
              <div className="flex items-center mb-6">
                <input
                  type="checkbox"
                  checked={agreedPolicy}
                  onChange={handlePolicyChange}
                  className="h-5 w-5 text-blue-600 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm sm:text-base text-gray-600">
                  {t("login.AGREE")}{" "}
                  <span className="font-semibold">
                    {t("login.POLICY_HEAD")}
                  </span>
                </label>
              </div>
            </div>

            <div className="flex flex-row justify-end gap-3 sm:gap-4">
              {/* Accept Button */}
              <button
                onClick={handleAccept}
                disabled={!agreedTerms || !agreedPolicy} // Disable if not checked
                className={`w-full sm:w-auto h-10 sm:h-11 px-4 sm:px-6 
                ${
                  !agreedTerms || !agreedPolicy
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-gray-800"
                } 
                flex items-center justify-center rounded transition-colors duration-200`}
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="font-medium text-sm sm:text-base">
                  {t("login.ACCEPT_POLICY")}
                </span>
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Policy;
