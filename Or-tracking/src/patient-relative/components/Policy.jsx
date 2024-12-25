import React from "react";
import LanguageSelector from "../components/LanguageSelector";

const Policy = ({
  t,
  handleAcceptPolicy,
  handleDeclinePolicy,
  visible,
  handleCloseModal,
}) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto flex justify-center items-center z-50 p-4 sm:p-6 md:p-8">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl relative">
        <div className="p-4 sm:p-6 md:p-8">
          <header className="flex flex-row justify-between items-center border-b pb-4 mb-4 gap-4">
            <div className="flex items-center gap-3">
              <svg
                className="w-6 h-6 text-blue-600"
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
              <h2 className="text-lg sm:text-xl font-medium text-blue-600">
                {t("login.POLICY_TITLE")}
              </h2>
            </div>
            <div className="w-auto ml-auto">
              <LanguageSelector />
            </div>
          </header>

          <main className="mb-6">
            <div className="overflow-y-auto max-h-[40vh] sm:max-h-[60vh] md:max-h-96 mb-6 pr-2">
              <p className="font-normal text-sm sm:text-base text-gray-600 leading-relaxed">
                {t("login.POLICY_TEXT")}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
              <button
                onClick={handleDeclinePolicy}
                className="w-full sm:w-auto h-10 sm:h-11 px-4 sm:px-6 border border-gray-200 
                bg-white text-gray-600 hover:bg-gray-50 flex items-center justify-center
                rounded transition-colors duration-200 order-2 sm:order-1"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <span className="text-sm sm:text-base">
                  {t("login.DECLINE_POLICY")}
                </span>
              </button>
              <button
                onClick={handleAcceptPolicy}
                className="w-full sm:w-auto h-10 sm:h-11 px-4 sm:px-6 
                bg-blue-600 text-white hover:bg-gray-800 flex items-center justify-center
                rounded transition-colors duration-200 order-1 sm:order-2"
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
                <span className="text-sm sm:text-base">
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
