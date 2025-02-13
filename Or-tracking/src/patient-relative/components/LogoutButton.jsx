import React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@iconify/react";
import { useNavigate, useSearchParams } from "react-router-dom";

const LogoutButton = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const link = searchParams.get("link");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate(`/ptr?link=${link}`);
  };

  return (
    <button
      onClick={handleLogout}
      className="
        group
        flex items-center gap-2
        px-4 py-2.5
        bg-white/90 hover:bg-white
        backdrop-blur-sm
        rounded-xl
        shadow-lg hover:shadow-xl
        transition-all duration-200
        border border-white/20
        text-gray-700 hover:text-red-600
      "
    >
      <Icon
        icon="material-symbols:logout"
        className="w-5 h-5 transition-colors duration-200"
      />
      <span className="hidden md:inline font-medium">{t("common.LOGOUT")}</span>
    </button>
  );
};

export default LogoutButton;
