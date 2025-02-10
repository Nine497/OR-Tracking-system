import React, { useState } from "react";
import { Icon } from "@iconify/react";
import AddUserModal from "./AddUserModal";
import { Button } from "antd";
import { useAuth } from "../../context/AuthContext";

function Users_Table_Header({ refreshTable }) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { permissions } = useAuth();

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    refreshTable();
    setIsModalVisible(false);
  };

  return (
    <div className="flex flex-row p-4 justify-between">
      <div className="text-xl sm:text-2xl font-semibold">
        การจัดการผู้ใช้งาน
      </div>
      {permissions.includes("5002") && (
        <Button
          type="primary"
          icon={<Icon icon="typcn:plus" className="text-lg" />}
          onClick={showModal}
          className="w-full sm:w-auto"
          size="large"
        >
          <span className="font-semibold tracking-wide">เพิ่มผู้ใช้</span>
        </Button>
      )}

      <AddUserModal visible={isModalVisible} onClose={handleCancel} />
    </div>
  );
}

export default Users_Table_Header;
