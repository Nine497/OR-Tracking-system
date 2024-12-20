import React, { useEffect, useState } from "react";
import { usePatient } from "../context/PatientContext";
import { useNavigate } from "react-router-dom";
import { notification, Timeline } from "antd";
import axiosInstance from "../../admin/api/axiosInstance";
import LanguageSelector from "../components/LanguageSelector";
import { useTranslation } from "react-i18next";

const View = () => {
  const { patient_id, surgery_case_id } = usePatient();
  const [loading, setLoading] = useState(true);
  const [patientData, setPatientData] = useState(null);
  const [statusData, setStatusData] = useState([]);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        if (!patient_id || !surgery_case_id) {
          console.log("Missing data:", { patient_id, surgery_case_id });
          navigate("/ptr/");
          return;
        }

        const response = await axiosInstance.post("patient/getPatientData", {
          surgery_case_id,
        });
        setPatientData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching patient data:", error);
        notification.error({
          message: "Failed to load patient data",
        });
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [patient_id, surgery_case_id, navigate]);

  useEffect(() => {
    const fetchStatusData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("patient/getAllStatus");
        setStatusData(response.data);
      } catch (error) {
        console.error("Error fetching status data:", error);
        notification.error({
          message: "Failed to load status data",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStatusData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 relative w-full min-h-screen font-normal text-base">
      <div className="absolute top-0 left-0 right-0 h-[25%] bg-[#3F7BF2] rounded-b-[50%_20%] z-[-1] w-full" />
      <div className="absolute bottom-0 left-0 right-0 h-[75%] bg-white z-[-2]" />
      {patientData && (
        <div className="pt-[15%] flex flex-col gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 mt-4 mx-4">
            <h3 className="text-2xl font-bold mb-4">ข้อมูลผู้ป่วย</h3>
            <div className="space-y-4">
              <p>HN: {patientData.hn_code}</p>
              <p>
                ชื่อ: {patientData.patient_first_name}
                {patientData.patient_last_name}
              </p>
              <p> เพศ: {patientData.gender}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mx-4">
            <div className="space-y-4">
              <p>
                แพทย์: {patientData.doctor_first_name}
                {patientData.doctor_last_name}
              </p>
              <p>เริ่มต้น : {patientData.estimate_start_time}</p>
              <p>ใช้เวลาผ่าตัดประมาณ : {patientData.estimate_duration}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6  m-4">
            <h3 className="text-2xl font-bold mb-4">สถานะการดำเนินการ</h3>
            <Timeline>
              {statusData.map((status) => (
                <Timeline.Item
                  key={status.status_id}
                  color={
                    status.status_name === patientData.status_name
                      ? "blue" // สีสำหรับสถานะปัจจุบัน
                      : "gray" // สีสำหรับสถานะอื่น
                  }
                >
                  {status.status_name}
                </Timeline.Item>
              ))}
            </Timeline>
          </div>
          <LanguageSelector />
        </div>
      )}
    </div>
  );
};

export default View;
