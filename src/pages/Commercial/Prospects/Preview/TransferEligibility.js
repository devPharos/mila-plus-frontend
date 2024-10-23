import { Edit, Loader2, Mail, PlayCircle } from "lucide-react";
import React from "react";
import { NavLink } from "react-router-dom";

// import { Container } from './styles';

function TransferEligibility({
  enrollment = null,
  student_id = null,
  setLoading = () => null,
  loading = false,
  handleStartProcess = null,
}) {
  const process = `Transfer Eligibility`;
  const routine = `transfer-eligibility`;

  function handleSendMail() {
    setLoading(true);
    api
      .post(`/enrollments/send-form-mail`, {
        type: routine,
        enrollment_id: enrollment.id,
        student_id,
      })
      .then(({ data }) => {
        setLoading(false);
        toast("Form mail sent!", { autoClose: 1000 });
      });
  }
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
  return (
    <div className="flex flex-1 w-full flex-col items-start justify-start text-center gap-4 px-4">
      <div className="flex w-full flex-row items-center justify-start text-center gap-4 border border-gray-200 bg-slate-50 rounded-md p-4">
        <NavLink
          to={`/fill-form/Transfer?crypt=${enrollment.id}`}
          target="_blank"
          disabled={true}
          className="bg-slate-300 text-slate-500 border border-slate-400 hover:bg-slate-400 hover:text-white rounded-md py-4 px-4 my-2 px-2 h-6 flex flex-row items-center justify-start text-xs gap-2"
        >
          <Edit size={14} />
          <strong>Access the Form</strong>
        </NavLink>
        <button
          type="button"
          disabled={loading}
          onClick={() => handleSendMail()}
          className="bg-slate-300 text-slate-500 border border-slate-400 hover:bg-slate-400 hover:text-white rounded-md py-4 px-4 my-2 px-2 h-6 flex flex-row items-center justify-start text-xs gap-2"
        >
          <Mail size={14} />
          <strong>Re-send form link to student</strong>
        </button>
      </div>
      <p className="w-full text-xs text-gray-500 text-left px-2 border-t pt-4">
        {
          enrollment.enrollmenttimelines[
            enrollment.enrollmenttimelines.length - 1
          ].phase_step
        }
      </p>
    </div>
  );
}

export default TransferEligibility;
