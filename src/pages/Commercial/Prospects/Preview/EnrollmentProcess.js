import {
  CheckCheck,
  CreditCard,
  Download,
  Edit,
  Loader2,
  Mail,
  PlayCircle,
  Send,
  X,
} from "lucide-react";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { NavLink } from "react-router-dom";
import api from "~/services/api";
import { toast } from "react-toastify";
import SelectPopover from "~/components/RegisterForm/SelectPopover";
import { Form } from "@unform/web";
import { FullGridContext } from "../..";

export const InputContext = createContext({});

function EnrollmentProcess({
  enrollment = null,
  student_id = null,
  issuer = null,
  setLoading = () => null,
  loading = false,
  handleStartProcess = null,
}) {
  const { handleOpened } = useContext(FullGridContext);
  const process = `Enrollment Process`;
  const routine = `enrollment-process`;
  const [paymentMethods, setPaymentMethods] = useState([]);
  const generalForm = useRef();
  const [successfullyUpdated, setSuccessfullyUpdated] = useState(false);

  function handleSendMail(type = "enrollment-process") {
    setLoading(true);
    api
      .post(`/enrollments/send-form-mail`, {
        type: type ? type : routine,
        enrollment_id: enrollment.id,
        student_id,
      })
      .then(({ data }) => {
        setLoading(false);
        toast("E-mail has been sent!", { autoClose: 1000 });
      })
      .catch((error) => {
        setLoading(false);
        toast.error("Form mail failed!");
      });
  }
  useEffect(() => {
    async function loadData() {
      const paymentMethodData = await api.get(`/paymentmethods`);

      const paymentMethodOptions = paymentMethodData.data.map((f) => {
        return { value: f.id, label: f.description.slice(0, 20) };
      });

      setPaymentMethods(paymentMethodOptions);
    }
    loadData();
  }, []);

  if (!enrollment) {
    return (
      <div className="flex flex-1 w-full flex-col items-start justify-start text-center gap-4 px-4">
        <div className="flex w-96 flex-col items-center justify-center text-center gap-4 border border-gray-200 bg-slate-50 rounded-md p-4">
          {loading ? (
            <div className="w-full bg-slate-300 text-slate-500 border border-slate-400 hover:bg-slate-400 hover:text-white rounded-md py-4 px-4 my-2 px-2 h-6 flex flex-row items-center justify-between text-xs gap-1">
              <strong>Please wait...</strong>
              <Loader2 className="animate-spin" size={14} />
            </div>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={() => handleStartProcess(routine)}
              className="w-full bg-green-300 text-green-800 border border-green-400 hover:bg-green-400 hover:text-white rounded-md py-4 px-4 my-2 px-2 h-6 flex flex-row items-center justify-between text-xs gap-1"
            >
              <strong>Start {process} Process</strong>
              <PlayCircle size={18} />
            </button>
          )}
          <p className="text-xs text-gray-500 text-left px-2 border-t pt-4">
            This action will send an email to the student with a link to
            complete the {process} form.
          </p>
        </div>
      </div>
    );
  }

  function handleGenerateFees(data) {
    if (!data.paymentmethod_id) {
      toast.error("Please select a Payment Method.");
      return;
    }
    setLoading(true);
    api
      .post(`/prospect_payments/generateFees`, {
        filial_id: enrollment.filial_id,
        enrollment_id: enrollment.id,
        student_id,
        paymentmethod_id: data.paymentmethod_id,
      })
      .then(({ data: feesData }) => {
        api
          .post(`prospect_payments/payment_link`, {
            issuer_id: feesData.issuer.id,
            registrationFee_id: feesData.registrationFee.id,
            tuitionFee_id: feesData.tuitionFee.id,
            paymentmethod_id: data.paymentmethod_id,
            enrollment_id: enrollment.id,
            student_id,
          })
          .then(({ data }) => {
            setLoading(false);
            toast.success("Payment sent to student successfully!");
            handleOpened(null);
          })
          .catch((error) => {
            console.log(error);
            setLoading(false);
            toast.error("Payment failed!");
          });
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
        toast.error("Payment failed!");
      });
  }

  function handlePDF() {
    api
      // .get("/pdf/affidavit-support/bc59904a-686e-4b05-b69f-64960af78565", {
      // .get("/pdf/transfer-eligibility/137a1ee0-3d8c-4122-b1bf-f41e9bf7def9", {
      .get(`/pdf/enrollment/${enrollment.id}`, {
        responseType: "blob",
      })
      .then((res) => {
        const pdfBlob = new Blob([res.data], { type: "application/pdf" });
        saveAs(pdfBlob, `enrollment_${enrollment.id}.pdf`);
      });
  }

  return (
    <InputContext.Provider
      value={{
        id: null,
        generalForm,
        successfullyUpdated,
        setSuccessfullyUpdated,
        fullscreen: false,
        setFullscreen: () => null,
        handleCloseForm: () => null,
      }}
    >
      <Form ref={generalForm} onSubmit={handleGenerateFees} className="w-full">
        <div className="flex flex-1 w-full flex-col items-start justify-start text-center gap-4 px-4">
          <div className="relative flex w-full flex-col items-start justify-start text-center gap-4 border border-gray-200 bg-slate-50 rounded-md p-4">
            <h2 className="text-md font-bold w-full text-left border-b border-gray-200 pb-2">
              Enrollment Process
              {enrollment.student_signature ? (
                <span className="text-green-500"> - Signed</span>
              ) : (
                <span className="text-red-500"> - Not signed yet</span>
              )}
            </h2>
            <div className="relative flex w-full flex-row items-center justify-start text-center gap-4">
              <NavLink
                to={`/fill-form/Enrollment?crypt=${enrollment.id}`}
                target="_blank"
                disabled={true}
                className="bg-slate-300 text-slate-500 border border-slate-400 hover:bg-slate-400 hover:text-white rounded-md py-4 px-4 my-2 px-2 h-6 flex flex-row items-center justify-start text-xs gap-2"
              >
                <Edit size={14} />
                <strong>Access enrollment form</strong>
              </NavLink>
              {!enrollment.student_signature ? (
                <>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleSendMail()}
                    className="bg-slate-300 text-slate-500 border border-slate-400 hover:bg-slate-400 hover:text-white rounded-md py-4 px-4 my-2 px-2 h-6 flex flex-row items-center justify-start text-xs gap-2"
                  >
                    <Mail size={14} />
                    <strong>Send form link to student</strong>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  disabled={loading}
                  onClick={handlePDF}
                  className={`bg-slate-300 text-slate-500 border border-slate-400 hover:bg-slate-400 hover:text-white rounded-md py-4 px-4 my-2 px-2 h-6 flex flex-row items-center justify-start text-xs gap-2`}
                >
                  <Download size={14} />
                  <strong>Download PDF</strong>
                </button>
              )}
            </div>
          </div>
          {enrollment.enrollmentsponsors.length > 0 &&
            enrollment.enrollmentsponsors.map((sponsor, index) => {
              if (sponsor.name) {
                return (
                  <div className="relative flex w-full flex-col items-start justify-start text-center gap-4 border border-gray-200 bg-slate-50 rounded-md p-4">
                    <h2 className="text-md font-bold w-full text-left border-b border-gray-200 pb-2">
                      Sponsor #{index + 1} - {sponsor.name}{" "}
                      {sponsor.signature ? (
                        <span className="text-green-500"> - Signed</span>
                      ) : (
                        <span className="text-red-500"> - Not signed yet</span>
                      )}
                    </h2>
                    <div className="relative flex w-full flex-row items-center justify-start text-center gap-4">
                      <NavLink
                        to={`/fill-form/Sponsor?crypt=${sponsor.id}`}
                        target="_blank"
                        disabled={true}
                        className="bg-slate-300 text-slate-500 border border-slate-400 hover:bg-slate-400 hover:text-white rounded-md py-4 px-4 my-2 px-2 h-6 flex flex-row items-center justify-start text-xs gap-2"
                      >
                        <Edit size={14} />
                        <strong>Access sponsor form</strong>
                      </NavLink>
                      {!sponsor.signature ? (
                        <>
                          <button
                            type="button"
                            disabled={loading}
                            onClick={() => handleSendMail("sponsor-signature")}
                            className="bg-slate-300 text-slate-500 border border-slate-400 hover:bg-slate-400 hover:text-white rounded-md py-4 px-4 my-2 px-2 h-6 flex flex-row items-center justify-start text-xs gap-2"
                          >
                            <Mail size={14} />
                            <strong>Send form link to sponsor</strong>
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>
                );
              }
            })}
          <div className="relative flex w-full flex-col items-start justify-start text-center gap-4 border border-gray-200 bg-slate-50 rounded-md p-4">
            <h2 className="text-md font-bold w-full text-left border-b border-gray-200 pb-2">
              Payment{" "}
              {issuer && issuer.receivables.length > 0 ? (
                <>
                  <span className="text-green-500">
                    {" "}
                    - Invoice I
                    {issuer.receivables[0].invoice_number
                      .toString()
                      .padStart(6, "0")}
                  </span>
                  {issuer.receivables.find(
                    (receivable) => receivable.status === "Pending"
                  ) ? (
                    <span className="text-red-500">
                      {" "}
                      - Invoice not paid yet
                    </span>
                  ) : (
                    <>
                      <span className="text-green-500"> - Invoice Paid</span>{" "}
                    </>
                  )}
                </>
              ) : (
                <span className="text-red-500"> - Invoice not created</span>
              )}
            </h2>
            {console.log({ issuer })}
            {(!issuer ||
              issuer.receivables.find(
                (receivable) => receivable.status === "Pending"
              ) ||
              issuer.receivables.length === 0) && (
              <div className="relative flex w-full flex-row items-center justify-start text-center gap-4">
                <SelectPopover
                  name="paymentmethod_id"
                  title="Payment Method"
                  isSearchable
                  grow
                  required
                  defaultValue={
                    enrollment.paymentmethod_id
                      ? paymentMethods.find(
                          (paymentMethod) =>
                            paymentMethod.value === enrollment.paymentmethod_id
                        )
                      : null
                  }
                  options={paymentMethods}
                  InputContext={InputContext}
                />
                <button
                  type="button"
                  onClick={() => generalForm.current.submitForm()}
                  disabled={loading}
                  className={`bg-slate-300 text-slate-500 border border-slate-400 hover:bg-slate-400 hover:text-white rounded-md py-4 px-4 mb-2 mt-5 px-2 h-6 flex flex-row items-center justify-start text-xs gap-2`}
                >
                  <Send size={14} />
                  <strong>
                    {enrollment.payment_link_sent_to_student
                      ? "Payment link already sent, re-send link?"
                      : "Send payment link to student"}
                  </strong>
                </button>
              </div>
            )}
          </div>
        </div>
      </Form>
    </InputContext.Provider>
  );
}

export default EnrollmentProcess;
