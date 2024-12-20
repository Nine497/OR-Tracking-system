import React from "react";

const Policy = ({ t, handleAcceptPolicy }) => {
  return (
    <div className="w-full max-w-lg bg-white rounded-lg shadow-lg">
      <div className="w-full p-6 border-b border-gray-200">
        <h1 className="text-2xl md:text-3xl font-semibold text-center text-gray-800">
          {t("login.POLICY_TITLE")}
        </h1>
      </div>

      <div className="p-4 sm:p-6 md:p-8">
        <p className="text-base text-gray-700">{t("login.POLICY_TEXT")}</p>

        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={handleAcceptPolicy}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md"
          >
            {t("login.ACCEPT_POLICY")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Policy;
