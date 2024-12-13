import { Outlet } from "react-router-dom";
import Header from "../components/Users_manage/Header";
import Table from "../components/Users_manage/Table";

function Users_manage() {
  return (
    <>
      <Header />
      <hr />
      <Table />
    </>
  );
}
export default Users_manage;
