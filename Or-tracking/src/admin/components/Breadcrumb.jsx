import React from "react";
import { useLocation, NavLink } from "react-router-dom";
import { Breadcrumb } from "antd";

function BreadcrumbComponent() {
  const location = useLocation();

  const getSectionNameInThai = (section) => {
    const nameMapping = {
      roomSchedule: "ห้องผ่าตัด",
      calendar: "ปฏิทิน",
      caseManage: "การจัดการเคสผ่าตัด",
      usersManage: "การจัดการผู้ใช้งาน",
      addCase: "เพิ่มเคสผ่าตัด",
      editCase: "แก้ไขเคสผ่าตัด",
    };

    const camelCaseSection = section
      .split("_")
      .map((word, index) =>
        index === 0
          ? word.toLowerCase()
          : word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join("");

    return (
      nameMapping[camelCaseSection] ||
      section.charAt(0).toUpperCase() + section.slice(1)
    );
  };

  const generateBreadcrumbItems = (pathname) => {
    const pathSections = pathname
      .replace(/^\/admin/, "")
      .split("/")
      .filter(Boolean);

    return pathSections.map((section, index) => {
      const path = `/admin/${pathSections.slice(0, index + 1).join("/")}`;
      const sectionName = getSectionNameInThai(section);
      return {
        title: (
          <NavLink to={path} className="font-bold">
            {sectionName}
          </NavLink>
        ),
        key: path,
      };
    });
  };

  const breadcrumbItems = generateBreadcrumbItems(location.pathname);

  return <Breadcrumb separator=">" items={breadcrumbItems} />;
}

export default BreadcrumbComponent;
