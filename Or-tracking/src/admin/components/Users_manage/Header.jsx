import React, { useState } from "react";
import { Icon } from "@iconify/react";
import AddUserModal from "./AddUserModal";
import { Button } from "antd";
function Users_Table_Header() {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <div className="flex flex-row p-4 justify-between">
      <div className="text-3xl font-semibold">Users management</div>
      <Button
        type="primary"
        icon={<Icon icon="typcn:plus" className="text-lg" />}
        onClick={showModal}
        className="w-full sm:w-auto"
      >
        <span className="font-bold">Add</span>
      </Button>

      <AddUserModal visible={isModalVisible} onClose={handleCancel} />
    </div>
  );
}

export default Users_Table_Header;
