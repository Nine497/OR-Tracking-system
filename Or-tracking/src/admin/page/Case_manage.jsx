import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/Case_manage/Header";
import Table from "../components/Case_manage/Table";

function Case_manage() {
  const location = useLocation();
  const isAddCasePath = location.pathname === "/admin/case_manage/add_case";

  return (
    <>
      {!isAddCasePath ? (
        <>
          <Header />
          <hr />
          <Table />
        </>
      ) : (
        <Outlet />
      )}
    </>
  );
}

export default Case_manage;
