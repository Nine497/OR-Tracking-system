import { useState } from "react";
import Header from "../components/Users_manage/Header";
import Table from "../components/Users_manage/Table";

function Users_manage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshTable = () => {
    setRefreshKey((prevKey) => prevKey + 1);
  };

  return (
    <>
      <Header refreshTable={refreshTable} />
      <hr />
      <Table refreshKey={refreshKey} />
    </>
  );
}

export default Users_manage;
