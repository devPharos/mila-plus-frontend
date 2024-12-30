import { emergepaySdk } from "emergepay-sdk";
import React from "react";
import api from "~/services/api";

export default function AdministrativeDashboard() {
  async function handleEmergePay() {
    try {
      api
        .post(`/emergepay/text-to-pay`, {
          receivable_id: "teste-id",
          amount: 498,
          pageDescription: "Teste de mensagem para o pagamento.",
        })
        .then((response) => {
          console.log(response);
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (err) {
      console.log({ err });
    }
  }

  async function handleRefund() {
    try {
      api
        .post(`/emergepay/refund`)
        .then((response) => {
          console.log(response);
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (err) {
      console.log({ err });
    }
  }

  return (
    <div className="h-full bg-white flex flex-1 flex-row justify-start items-start rounded-tr-2xl px-4">
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
          Simple Form
        </button>
      </div>
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
        <button type="button" onClick={() => handleEmergePay()}>
          Text to Pay
        </button>
      </div>
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
        <button type="button" onClick={() => handleRefund()}>
          Refund
        </button>
      </div>
    </div>
  );
}
