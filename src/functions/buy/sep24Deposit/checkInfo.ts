import { get } from "lodash";

import { AnchorActionType } from "../types"
 const isNativeAsset = (assetCode: string) => { 
  return ["XLM", "NATIVE"].includes(assetCode.toLocaleUpperCase());
}

export const checkInfo = async ({
  type,
  toml,
  assetCode,
}: {
  type: AnchorActionType;
  toml: any;
  assetCode: string;
}) => {
  console.log({
    title: `Checking \`/info\` endpoint to ensure this currency is enabled for ${
      type === AnchorActionType.DEPOSIT ? "deposit" : "withdrawal"
    }`,
  });
  const infoURL = `${toml.TRANSFER_SERVER_SEP0024}/info`;
  console.log({ title: `GET \`${infoURL}\`` });

  const info = await fetch(infoURL);
  const infoJson = await info.json();
  const isNative = isNativeAsset(assetCode);

  console.log({ title: `GET \`${infoURL}\``, body: infoJson });

  if (!get(infoJson, [type, isNative ? "native" : assetCode, "enabled"])) {
    throw new Error("Asset is not enabled in the `/info` endpoint");
  }

  return infoJson;
};
