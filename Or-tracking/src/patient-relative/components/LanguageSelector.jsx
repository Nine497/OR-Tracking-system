import React from "react";
import { Dropdown } from "antd";
import { useTranslation } from "react-i18next";
import { Icon } from "@iconify/react";

const LanguageSelector = () => {
  const { t, i18n } = useTranslation();

  const languages = [
    {
      code: "en",
      label: "English",
      flag: "twemoji:flag-united-kingdom",
    },
    {
      code: "th",
      label: "ไทย",
      flag: "twemoji:flag-thailand",
    },
    {
      code: "bs",
      label: "Bahasa",
      flag: "twemoji:flag-indonesia",
    },
  ];

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  const menuItems = languages.map((lang) => ({
    key: lang.code,
    label: (
      <div
        className={`
          flex items-center gap-3 px-4 py-2 cursor-pointer
          hover:bg-blue-50 transition-all duration-200
          ${i18n.language === lang.code ? "bg-blue-50" : ""}
          rounded-lg
        `}
        onClick={() => changeLanguage(lang.code)}
      >
        <Icon icon={lang.flag} className="w-5 h-5" />
        <span className="flex-grow font-medium">{lang.label}</span>
        {i18n.language === lang.code && (
          <Icon icon="ph:check-bold" className="w-4 h-4 text-blue-500" />
        )}
      </div>
    ),
  }));

  const currentLanguage = languages.find((lang) => lang.code === i18n.language);

  return (
    <div className="relative">
      <Dropdown
        menu={{
          items: menuItems,
          className: "min-w-[180px] mt-2",
        }}
        trigger={["click"]}
        placement="bottomRight"
        overlayStyle={{ padding: "8px" }}
      >
        <button
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
          "
        >
          <Icon
            icon={currentLanguage?.flag || "twemoji:globe-showing-americas"}
            className="w-5 h-5"
          />
          <span className="hidden md:inline text-gray-700 font-medium whitespace-nowrap">
            {currentLanguage?.label || t("language.SELECT")}
          </span>
          <Icon
            icon="ph:caret-down-bold"
            className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200"
          />
        </button>
      </Dropdown>
    </div>
  );
};

export default LanguageSelector;
