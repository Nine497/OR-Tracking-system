import React, { useState, useEffect } from "react";
import { zoomies } from "ldrs";
import "./FullScreenLoading.css";

const FullScreenLoading = ({ loading, t, icon }) => {
  zoomies.register();
  const [isDestroyed, setIsDestroyed] = useState(false);

  useEffect(() => {
    if (!loading) {
      const timeout = setTimeout(() => setIsDestroyed(true), 100000);
      return () => clearTimeout(timeout);
    } else {
      setIsDestroyed(false);
    }
  }, [loading]);

  if (isDestroyed) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white overflow-hidden touch-none">
      <div
        className={`fixed inset-0 w-full h-full bg-white flex items-center justify-center flex-col gap-[30px] z-[400] transition-all duration-500
           ${loading ? "opacity-100" : "opacity-0"}
           ${isDestroyed ? "hidden" : ""}
           `}
      >
        <div className="flex items-center justify-start flex-col gap-1 w-3/4">
          <div>
            <div className="flex items-center justify-center gap-3 text-white bg-transparent text-[1.5rem]">
              {icon}
            </div>
          </div>
          <div className="flex flex-col gap-3 items-center justify-center z-[101]">
            <span
              className={`text-base font-medium loading-text-loop text-center`}
            >
              {t("loading.LOADING")}
            </span>
            <l-zoomies
              size="80"
              stroke="5"
              bg-opacity="0.1"
              speed="1.4"
              color="var(--blue-700)"
            ></l-zoomies>
          </div>
        </div>
        <div className="circle-loading flex items-center justify-center text-white"></div>
      </div>
    </div>
  );
};

export default FullScreenLoading;

export const ORIconLoading = () => {
  return (
    <svg
      className="z-[101] bed-stroke-container"
      width="200"
      height="220"
      viewBox="0 0 200 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M77.6197 127.746L135.726 157.553M65.04 157.553V148.899L135.726 127.746"
        className=" bed-stroke "
        strokeWidth="2"
      />
      <mask
        id="mask0_1110_6423"
        style={{ maskType: "luminance" }}
        maskUnits="userSpaceOnUse"
        x="5"
        y="106"
        width="191"
        height="15"
      >
        <path
          d="M5 116.751C5 111.229 9.47715 106.751 15 106.751H185.341C190.864 106.751 195.341 111.229 195.341 116.751V118.803C195.341 119.908 194.446 120.803 193.341 120.803H6C5.44772 120.803 5 120.356 5 119.803V116.751Z"
          fill="white"
        />
      </mask>
      <g mask="url(#mask0_1110_6423)">
        <path
          d="M5 116.751C5 111.229 9.47715 106.751 15 106.751H185.341C190.864 106.751 195.341 111.229 195.341 116.751V118.803C195.341 119.908 194.446 120.803 193.341 120.803H6C5.44772 120.803 5 120.356 5 119.803V116.751Z"
          className=" bed-stroke"
          strokeWidth="4"
        />
      </g>
      {/*  <mask id="mask1_1110_6423" style={{ maskType: 'luminance' }} maskUnits="userSpaceOnUse" x="29" y="10" width="52" height="51" strokeWidth="2">
                <path d="M77.2493 11.365C81.1389 15.2858 81.1136 21.6174 77.1927 25.507L44.8369 57.605C40.9161 61.4945 34.5845 61.4692 30.6949 57.5484L30.0449 56.8932C29.656 56.5011 29.6585 55.8679 30.0506 55.479L75.1851 10.7041C75.5772 10.3151 76.2104 10.3177 76.5993 10.7097L77.2493 11.365Z" className='bed-stroke'  
                strokeWidth="4" />
            </mask>
            <g mask="url(#mask1_1110_6423)" strokeWidth="2">
                <path d="M77.2493 11.365C81.1389 15.2858 81.1136 21.6174 77.1927 25.507L44.8369 57.605C40.9161 61.4945 34.5845 61.4692 30.6949 57.5484L30.0449 56.8932C29.656 56.5011 29.6585 55.8679 30.0506 55.479L75.1851 10.7041C75.5772 10.3151 76.2104 10.3177 76.5993 10.7097L77.2493 11.365Z" className='bed-stroke'  
                />
            </g> */}
      <path
        d="M18.3486 119.952H181.992V122.172C181.992 125.485 179.306 128.172 175.992 128.172H24.3486C21.0349 128.172 18.3486 125.485 18.3486 122.172V119.952Z"
        className=" bed-stroke"
        strokeWidth="2"
        stroke=""
      />
      <path
        d="M72.5211 14.8216L33.4326 53.5987L31.8694 52.0229C29.5356 49.6704 29.5508 45.8714 31.9033 43.5377L62.4727 13.2119C64.8252 10.8781 68.6241 10.8933 70.9579 13.2458L72.5211 14.8216Z"
        className=" bed-stroke"
        strokeWidth="2"
      />
      <path
        d="M76.0357 25.8716L69.5957 32.2603L70.9771 33.6528C71.755 34.4369 73.0214 34.442 73.8055 33.6641L77.4058 30.0925C78.1899 29.3146 78.195 28.0483 77.4171 27.2641L76.0357 25.8716Z"
        className=" bed-stroke"
        strokeWidth="2"
      />
      <path
        d="M64.5484 37.2676L58.1084 43.6562L59.4898 45.0487C60.2677 45.8329 61.5341 45.838 62.3182 45.06L65.9185 41.4885C66.7026 40.7106 66.7077 39.4442 65.9298 38.6601L64.5484 37.2676Z"
        className=" bed-stroke"
        strokeWidth="2"
      />
      <path
        d="M53.0611 48.6638L46.6211 55.0525L48.0025 56.445C48.7804 57.2291 50.0468 57.2342 50.8309 56.4563L54.4312 52.8847C55.2154 52.1068 55.2204 50.8405 54.4425 50.0563L53.0611 48.6638Z"
        className=" bed-stroke"
        strokeWidth="2"
      />
      <path
        d="M26.0518 96.4026H46.1173C49.431 96.4026 52.1173 99.0889 52.1173 102.403V107.603H20.0518V102.403C20.0518 99.0889 22.7381 96.4026 26.0518 96.4026Z"
        className=" bed-stroke"
        strokeWidth="2"
      />
      <path
        d="M40.3408 175.384V157.5H160.341V175.384"
        className=" bed-stroke"
        strokeWidth="2"
      />
      <path
        d="M40.7281 186.774C43.7034 186.774 46.1154 184.362 46.1154 181.387C46.1154 178.412 43.7034 176 40.7281 176C37.7528 176 35.3408 178.412 35.3408 181.387C35.3408 184.362 37.7528 186.774 40.7281 186.774Z"
        className=" bed-stroke"
        strokeWidth="2"
      />
      <path
        d="M160.728 186.774C163.703 186.774 166.115 184.362 166.115 181.387C166.115 178.412 163.703 176 160.728 176C157.753 176 155.341 178.412 155.341 181.387C155.341 184.362 157.753 186.774 160.728 186.774Z"
        className=" bed-stroke"
        strokeWidth="2"
      />
      <path
        d="M47.6929 26.4656L37.1967 15.885H5.42578"
        className=" bed-stroke"
        strokeWidth="2"
      />
      <path
        d="M175.547 27.8267H110.384C105.413 27.8267 101.384 31.8561 101.384 36.8267V76.782C101.384 81.7525 105.413 85.782 110.384 85.782H175.547C180.518 85.782 184.547 81.7525 184.547 76.782V36.8267C184.547 31.8561 180.518 27.8267 175.547 27.8267Z"
        className=" bed-stroke"
        strokeWidth="2"
      />
      <path
        d="M108.048 43.8594H120.184"
        className=" bed-stroke fill-red-600"
        strokeWidth="2"
      />
      <path
        d="M108.048 50.2466H120.184"
        className=" bed-stroke"
        strokeWidth="2"
      />
      <path
        d="M108.048 56.634H120.184"
        className=" bed-stroke"
        strokeWidth="2"
      />
      <path
        d="M108.048 63.0212H120.184"
        className=" bed-stroke"
        strokeWidth="2"
      />
      <path
        d="M108.048 69.4084H120.184"
        className=" bed-stroke"
        strokeWidth="2"
      />
      <path
        d="M127.21 58.7629H139.346L144.03 45.5625L147.862 58.7629H153.611L155.953 64.7243L158.721 58.7629L161.914 67.918L165.534 58.7629H178.095"
        className=" bed-stroke"
        strokeWidth="2"
      />
    </svg>
  );
};
