import { emergepaySdk } from "emergepay-sdk";
import React from "react";

export default function AdministrativeDashboard() {
  async function handleEmergePay() {
    try {
      const emergepay = new emergepaySdk({
        oid: oid,
        authToken: authToken,
        environmentUrl: environmentUrl,
      });
      var amount = "0.01";
      var config = {
        transactionType: TransactionType.CreditSale,
        method: "modal",
        fields: [
          {
            id: "base_amount",
            value: amount,
          },
          {
            id: "external_tran_id",
            value: emergepay.getExternalTransactionId(),
          },
        ],
      };

      emergepay
        .startTransaction(config)
        .then(function (transactionToken) {
          res.send({
            transactionToken: transactionToken,
          });
        })
        .catch(function (err) {
          res.send(err.message);
        });
    } catch (err) {
      console.log({ err });
    }
  }

  return (
    <div className="h-full bg-white flex flex-1 flex-col justify-start items-start rounded-tr-2xl px-4">
      <div
        style={{
          flex: 1,
          width: "50%",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "start",
          paddingTop: 24,
        }}
        id="parent"
      >
        <button type="button" id="cip-pay-btn">
          Emerge Pay
        </button>
      </div>
    </div>
  );
}
