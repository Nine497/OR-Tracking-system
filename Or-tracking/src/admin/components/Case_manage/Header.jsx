import { Icon } from "@iconify/react";
import CustomButton from "../CustomButton";
import { useNavigate } from "react-router-dom";

function Case_Table_Header() {
  const navigate = useNavigate();

  const handleAddClick = () => {
    navigate("/admin/case_manage/add_case");
  };

  return (
    <div className="flex flex-row p-4 justify-between">
      <div className="text-3xl font-semibold">Case management</div>
      <CustomButton
        variant="add"
        icon={<Icon icon="typcn:plus" className="text-lg" />}
        onClick={handleAddClick}
      >
        <span className="font-bold">Add</span>
      </CustomButton>
    </div>
  );
}

export default Case_Table_Header;
