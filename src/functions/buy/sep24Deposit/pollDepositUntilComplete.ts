import { TransactionStatus } from "../types";
import { getCatchError } from "@stellar/frontend-helpers";

export const getErrorMessage = (error: Error | unknown) => {
  const e = getCatchError(error);
  return e.message || e.toString();
};

export const pollDepositUntilComplete = async ({
  popup,
  transactionId,
  token,
  sep24TransferServerUrl,
  trustAssetCallback,
  custodialMemoId,
}: {
  popup: any;
  transactionId: string;
  token: string;
  sep24TransferServerUrl: string;
  trustAssetCallback: () => Promise<string>;
  custodialMemoId?: string;
}) => {
  let currentStatus = TransactionStatus.INCOMPLETE;
  let trustedAssetAdded;

  const transactionUrl = new URL(
    `${sep24TransferServerUrl}/transaction?id=${transactionId}`,
  );
  console.log({
    title: `Polling for updates \`${transactionUrl.toString()}\``,
  });

  const endStatuses = [
    TransactionStatus.PENDING_EXTERNAL,
    TransactionStatus.COMPLETED,
    TransactionStatus.ERROR,
  ];

  const initResponse = await fetch(transactionUrl.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });

  const initTransactionJson = await initResponse.json();

  if (initTransactionJson?.transaction?.more_info_url) {
    console.log({
      title: "Transaction MORE INFO URL:",
      link: initTransactionJson.transaction.more_info_url,
    });
  }

  while (!popup.closed && !endStatuses.includes(currentStatus)) {
    // eslint-disable-next-line no-await-in-loop
    const response = await fetch(transactionUrl.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });

    // eslint-disable-next-line no-await-in-loop
    const transactionJson = await response.json();

    if (transactionJson.transaction.status !== currentStatus) {
      currentStatus = transactionJson.transaction.status;

      console.log({
        title: "Transaction MORE INFO URL:",
        link: initTransactionJson.transaction.more_info_url,
      });

      console.log({
        title: `Transaction \`${transactionId}\` is in \`${transactionJson.transaction.status}\` status.`,
        body: transactionJson.transaction,
      });

      switch (currentStatus) {
        case TransactionStatus.PENDING_USER_TRANSFER_START: {
          if (
            custodialMemoId &&
            transactionJson.transaction.deposit_memo !== custodialMemoId
          ) {
            console.log({
              title: "SEP-24 deposit custodial memo doesn’t match",
              body: `Expected ${custodialMemoId}, got ${transactionJson.transaction.deposit_memo}`,
            });
          }

          console.log({
            title:
              "The anchor is waiting on you to take the action described in the popup",
          });
          break;
        }
        case TransactionStatus.PENDING_ANCHOR: {
          console.log({
            title: "The anchor is processing the transaction",
          });
          break;
        }
        case TransactionStatus.PENDING_STELLAR: {
          console.log({
            title: "The Stellar network is processing the transaction",
          });
          break;
        }
        case TransactionStatus.PENDING_EXTERNAL: {
          console.log({
            title: "The transaction is being processed by an external system",
          });
          break;
        }
        case TransactionStatus.PENDING_TRUST: {
          console.log({
            title:
              "You must add a trustline to the asset in order to receive your deposit",
          });

          try {
            // eslint-disable-next-line no-await-in-loop
            trustedAssetAdded = await trustAssetCallback();
          } catch (error) {
            throw new Error(getErrorMessage(error));
          }
          break;
        }
        case TransactionStatus.PENDING_USER: {
          console.log({
            title:
              "The anchor is waiting for you to take the action described in the popup",
          });
          break;
        }
        case TransactionStatus.ERROR: {
          console.log({
            title: "There was a problem processing your transaction",
          });
          break;
        }
        default:
        // do nothing
      }
    }

    // run loop every 2 seconds
    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  console.log({ title: `Transaction status \`${currentStatus}\`` });

  if (!endStatuses.includes(currentStatus) && popup.closed) {
    console.log({
      title: `The popup was closed before the transaction reached a terminal status, if your balance is not updated soon, the transaction may have failed.`,
    });
  }

  return { currentStatus, trustedAssetAdded };
};
