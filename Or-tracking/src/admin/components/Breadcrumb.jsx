import React from "react";
import { useLocation, NavLink } from "react-router-dom";
import { Breadcrumb } from "antd";

function BreadcrumbComponent() {
  const location = useLocation();

  const generateBreadcrumbItems = (pathname) => {
    const pathSections = pathname
      .replace(/^\/admin/, "")
      .split("/")
      .filter(Boolean);

    return pathSections.map((section, index) => {
      const path = `/admin/${pathSections.slice(0, index + 1).join("/")}`;
      const sectionName = section.charAt(0).toUpperCase() + section.slice(1);
      return {
        title: (
          <NavLink className="font-bold" to={path}>
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
