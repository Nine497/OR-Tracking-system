import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";

// แทนที่ defaultProps ด้วย default parameters ในการรับ props
const CustomButton = ({
  children,
  variant = "default",
  className = "",
  onClick = () => {},
  disabled = false,
  icon = null,
}) => {
  const baseStyle =
    "flex items-center justify-center px-4 py-1 rounded-lg transition-all duration-300 focus:outline-none group relative overflow-hidden";

  const variants = {
    default: {
      base: "bg-blue-100 text-blue-600 border border-blue-400",
      hover: "hover:bg-blue-300 hover:text-blue-700 hover:border-blue-600",
      shadow: "hover:-translate-y-0.5 hover:scale-[1.015]",
      overlay: "group-hover:opacity-20 group-hover:scale-150 bg-white/20",
    },
    primary: {
      base: "bg-indigo-200 text-indigo-800 shadow-sm border-indigo-300",
      hover: "hover:bg-indigo-500 hover:shadow-lg hover:text-white",
      shadow: "hover:-translate-y-0.5 hover:scale-[1.015]",
      overlay: "group-hover:opacity-20 group-hover:scale-150 bg-white/20",
    },
    danger: {
      base: "bg-red-500 text-white",
      hover: "hover:bg-red-600 hover:shadow-lg",
      shadow: "hover:-translate-y-0.5 hover:scale-[1.015]",
      overlay: "group-hover:opacity-20 group-hover:scale-150 bg-white/20",
    },
    white: {
      base: "bg-white text-gray-800 border border-gray-200 shadow-sm",
      hover: "hover:bg-gray-100 hover:shadow-md hover:border-gray-300",
      overlay: "group-hover:opacity-20 group-hover:scale-150 bg-gray-200/20",
    },
    add: {
      base: "bg-indigo-500 text-white shadow-md py-2",
      hover: "hover:bg-indigo-600 hover:shadow-lg",
      shadow: "hover:-translate-y-0.5 hover:scale-[1.015]",
      overlay: "group-hover:opacity-20 group-hover:scale-150 bg-white/20",
    },
  };

  const disabledStyle =
    "bg-gray-300 text-gray-500 cursor-not-allowed opacity-60";

  const renderIcon = () => {
    if (!icon) return null;

    if (React.isValidElement(icon)) {
      return React.cloneElement(icon, {
        className: clsx(
          icon.props.className,
          "mr-2 group-hover:scale-110 transition-transform duration-300"
        ),
      });
    }

    return null;
  };

  return (
    <button
      className={clsx(
        baseStyle,
        variants[variant].base,
        !disabled && [variants[variant].hover, variants[variant].shadow],
        disabled && disabledStyle,
        className
      )}
      onClick={onClick}
      disabled={disabled}
    >
      <span
        className={clsx(
          "absolute inset-0 z-0 opacity-0 transition-all duration-300",
          !disabled && variants[variant].overlay
        )}
      />
      <span className="relative z-10 flex items-center">
        {renderIcon()}
        {children}
      </span>
    </button>
  );
};

CustomButton.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(["default", "primary", "danger", "white", "add"]),
  className: PropTypes.string,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  icon: PropTypes.oneOfType([PropTypes.element, PropTypes.elementType]),
};

// ลบ defaultProps ออก เพราะใช้ default parameters แทนแล้ว

export default CustomButton;
