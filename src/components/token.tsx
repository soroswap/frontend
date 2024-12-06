import React, { ImgHTMLAttributes } from "react";

type Token = "SOL" | "ETH";

const tokenMap: Record<Token, string> = {
  SOL: "sol.png",
  ETH: "eth.png",
};

interface TokenProps extends ImgHTMLAttributes<HTMLImageElement> {
  token?: Token;
  imageUrl?: string;
}

const TokenImage: React.FC<TokenProps> = ({ imageUrl, ...imgProps }) => {
  return (
    <img
      src={imageUrl || `/favicon.ico`}
      style={{ borderRadius: "100%" }}
      width="26px"
      height="26px"
      {...imgProps}
    />
  );
};

export default TokenImage;
