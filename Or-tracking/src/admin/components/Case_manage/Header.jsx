import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import { Button } from "antd";

function Case_Table_Header() {
  const navigate = useNavigate();

  const handleAddClick = () => {
    navigate("/admin/case_manage/add_case");
  };

  return (
    <div className="flex flex-row p-4 justify-between">
      <div className="text-xl sm:text-2xl font-semibold">
        การจัดการเคสผ่าตัด
      </div>

      <Button
        type="primary"
        icon={<Icon icon="typcn:plus" className="text-lg" />}
        onClick={handleAddClick}
        className="font-bold flex items-center gap-2"
        size="large"
      >
        <span className="font-semibold tracking-wide">เพิ่มเคส</span>
      </Button>
    </div>
  );
}

export default Case_Table_Header;
