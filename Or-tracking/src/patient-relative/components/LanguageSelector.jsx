import React from "react";
import { Dropdown, Menu } from "antd";
import { useTranslation } from "react-i18next";

const LanguageSelector = () => {
  const { t, i18n } = useTranslation();
  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  const menu = (
    <Menu>
      <Menu.Item onClick={() => changeLanguage("en")}>English</Menu.Item>
      <Menu.Item onClick={() => changeLanguage("th")}>ไทย</Menu.Item>
      <Menu.Item onClick={() => changeLanguage("bs")}>Bahasa</Menu.Item>
    </Menu>
  );

  return (
    <div className="absolute top-4 right-4 z-10">
      <Dropdown overlay={menu} trigger={["click"]}>
        <button className="text-sm p-2 bg-slate-500 text-white rounded-md">
          Select Language
        </button>
      </Dropdown>
    </div>
  );
};

export default LanguageSelector;
