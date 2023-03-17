import React from "react";
import { RotatingLines } from "react-loader-spinner";

/**
 * Simple loading animation with rotating lines.
 * see also: https://mhnpd.github.io/react-loader-spinner/docs/components/rotating-lines
 */
const SpinnerLoader: React.FC<{}> = () => {
  return (
    <div className="w-full h-[90%] flex items-center justify-center">
      <RotatingLines
        strokeColor="grey"
        strokeWidth="5"
        animationDuration="0.75"
        width="96"
      />
    </div>
  );
};

export default SpinnerLoader;