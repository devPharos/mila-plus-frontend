import api from "~/services/api";

export function openPaymentModal(receivable = null) {
  api
    .post(`/emergepay/simple-form`, {
      receivable_id: receivable.id,
      amount: receivable.amount,
      pageDescription: receivable.memo,
    })
    .then(({ data }) => {
      const { transactionToken } = data;
      emergepay.open({
        // (required) Used to set up the modal
        transactionToken: transactionToken,
        // (optional) Callback function that gets called after a successful transaction
        onTransactionSuccess: function (approvalData) {
          //   console.log("Approval Data", approvalData);
          api.post(`/emergepay/post-back-listener`, approvalData).then(() => {
            return approvalData;
          });
          setTimeout(() => {
            emergepay.close();
            // location = "";
          }, 2000);
        },
        // (optional) Callback function that gets called after a failure occurs during the transaction (such as a declined card)
        onTransactionFailure: function (failureData) {
          console.log("Failure Data", failureData);
        },
        // (optional) Callback function that gets called after a user clicks the close button on the modal
        onTransactionCancel: function () {
          console.log("transaction cancelled!");
        },
      });
    });
}
