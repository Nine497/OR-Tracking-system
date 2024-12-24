import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, Avatar, Tag, Typography, Timeline } from "antd";
import { Icon } from "@iconify/react";
import LoadingGif from "../assets/hospital-bed.gif";

const FullScreenLoading = ({ isLoading, showLoadingContent, isExiting, t }) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <div
          className={`fixed inset-0 bg-white transition-opacity duration-500 ${
            isLoading ? "opacity-100 z-50" : "opacity-0 -z-10"
          } flex items-center justify-center`}
        >
          <div
            className={`transform transition-all duration-700 ease-out ${
              showLoadingContent && !isExiting
                ? "scale-100 translate-y-0 opacity-100"
                : isExiting
                ? "scale-95 -translate-y-10 opacity-0"
                : "scale-95 translate-y-10 opacity-0"
            }`}
          >
            <div className="relative w-40 h-40 md:w-60 md:h-60 mb-8">
              <div className="absolute inset-0 bg-blue-200 rounded-full animate-ping opacity-20" />
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{
                  scale: showLoadingContent ? 1 : 0.9,
                  opacity: showLoadingContent ? 1 : 0,
                }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <img
                  src={LoadingGif}
                  alt="Loading..."
                  className="w-full h-full object-contain"
                />
              </motion.div>
            </div>

            <div className="relative">
              <div
                className={`text-center transition-all duration-500 ${
                  showLoadingContent && !isExiting ? "opacity-100" : "opacity-0"
                }`}
              >
                <span className="font-semibold text-2xl md:text-3xl text-gray-700">
                  {t("loading.LOADING")}
                </span>
                <span className="inline-flex gap-1 ml-2">
                  <motion.span
                    className="inline-block"
                    animate={{ y: [0, -8, 0] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      repeatDelay: 0.1,
                    }}
                  >
                    .
                  </motion.span>
                  <motion.span
                    className="inline-block"
                    animate={{ y: [0, -8, 0] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      repeatDelay: 0.2,
                      delay: 0.2,
                    }}
                  >
                    .
                  </motion.span>
                  <motion.span
                    className="inline-block"
                    animate={{ y: [0, -8, 0] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      repeatDelay: 0.3,
                      delay: 0.3,
                    }}
                  >
                    .
                  </motion.span>
                </span>
              </div>

              <div
                className={`absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent bg-[length:200%_100%] animate-shimmer opacity-30 ${
                  showLoadingContent && !isExiting ? "" : "hidden"
                }`}
              />
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default FullScreenLoading;
