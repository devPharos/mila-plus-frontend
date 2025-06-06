import api from "~/services/api";

export async function openPaymentModal({
  receivable = null,
  recurrence_id = null,
}) {
  await api
    .post(`/emergepay/simple-form`, {
      receivable_id: receivable.id,
      amount: receivable.total,
      pageDescription: receivable.memo,
    })
    .then(({ data }) => {
      const { transactionToken } = data;
      emergepay.open({
        // (required) Used to set up the modal
        transactionToken: transactionToken,
        // (optional) Callback function that gets called after a successful transaction
        onTransactionSuccess: async function (approvalData) {
          //   console.log("Approval Data", approvalData);
          await api
            .post(`/emergepay/post-back-listener`, approvalData)
            .then(async () => {
              if (recurrence_id) {
                const {
                  accountCardType,
                  accountExpiryDate,
                  maskedAccount,
                  billingName,
                } = approvalData;
                await api.post(
                  `/recurrence/fill-autopay-data/${recurrence_id}`,
                  {
                    autopay_fields: {
                      accountCardType,
                      accountExpiryDate,
                      maskedAccount,
                      billingName,
                    },
                  }
                );
              }
              return approvalData;
            })
            .catch((err) => {
              console.log(err);
            });
          setTimeout(() => {
            emergepay.close();
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
