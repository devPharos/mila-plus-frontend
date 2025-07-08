import { format } from "date-fns";
import { CheckCheck, Loader2, Mail, Save, Scaling, X } from "lucide-react";
import React, { useContext } from "react";

// import { Container } from './styles';

export default function FormHeader({
  loading = false,
  saveText = "Save changes",
  outside = false,
  access = {
    view: false,
    edit: false,
    create: false,
    inactivate: false,
    MenuHierarchyXGroup: null,
  },
  title = "",
  registry = { registryBy: null, registryAt: null, registryStatus: null },
  InputContext = null,
  emailButtonText = "Send Mail",
  createText = "Create",
  createIcon = <Save size={16} />,
  enableFullScreen = true,
}) {
  const { registryBy, registryAt, registryStatus } = registry;
  const {
    id,
    fullscreen,
    setFullscreen,
    successfullyUpdated,
    handleCloseForm,
    handleInactivate,
    canceled,
    handleOutsideMail,
  } = useContext(InputContext);

  if (access.MenuHierarchyXGroup) {
    access = access.MenuHierarchyXGroup;
  }

  return (
    <div className="sticky top-0 z-50 bg-slate-100 h-24 mb-4 px-4 py-8 flex flex-row items-center justify-between w-full">
      <h2
        className="flex flex-col justify-start items-start gap-1"
        style={{ fontSize: 24 }}
      >
        {title}{" "}
        <span className="text-xs">
          {registryAt &&
            `${registryStatus} by ${registryBy} on ${format(
              registryAt,
              "LLL do, yyyy @ HH:mm"
            )}`}
        </span>
      </h2>

      <div className="flex flex-row justify-between items-center gap-4">
        {loading ? (
          <div className="flex flex-row justify-center items-center gap-2">
            <Loader2 size={16} color="#111" className="animate-spin" />
            <div>Please wait...</div>
          </div>
        ) : (
          <>
            {!outside && access && (
              <>
                {enableFullScreen && (
                  <button
                    type="button"
                    onClick={() => setFullscreen(!fullscreen)}
                    className="text-md font-bold bg-secondary border hover:border-primary hover:text-primary rounded-md p-4 h-6 flex flex-row items-center justify-center text-xs gap-1"
                  >
                    <Scaling size={16} />{" "}
                    {fullscreen ? "Minimize" : "Full Screen"}
                  </button>
                )}
                {(access.edit && id !== "new") ||
                (access.create && id === "new") ? (
                  <button
                    type="button"
                    onClick={() => handleCloseForm()}
                    className="text-md font-bold bg-secondary border hover:border-primary hover:text-primary rounded-md p-4 h-6 flex flex-row items-center justify-center text-xs gap-1"
                  >
                    <X size={16} />{" "}
                    {successfullyUpdated
                      ? "Close"
                      : "Discard changes not saved"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleCloseForm()}
                    className="text-md font-bold bg-secondary border hover:border-primary hover:text-primary rounded-md p-4 h-6 flex flex-row items-center justify-center text-xs gap-1"
                  >
                    <X size={16} /> Close
                  </button>
                )}
              </>
            )}
            {(outside || (access && access.create)) && id === "new" && (
              <button
                type="submit"
                className={`text-md font-bold ${
                  !successfullyUpdated ? "bg-red-500" : "bg-primary"
                } text-white rounded-md p-4 h-6 flex flex-row items-center justify-center text-xs gap-1`}
              >
                <>
                  {createIcon} {createText}
                </>
              </button>
            )}
            {(outside || (access && access.edit)) && id !== "new" && (
              <button
                type="submit"
                className={`text-md font-bold ${
                  !successfullyUpdated ? "bg-red-500" : "bg-primary"
                } text-white rounded-md p-4 h-6 flex flex-row items-center justify-center text-xs gap-1`}
              >
                {!successfullyUpdated ? (
                  <>
                    <Save size={16} /> {saveText}
                  </>
                ) : (
                  <>
                    <CheckCheck size={16} /> {"Saved"}
                  </>
                )}
              </button>
            )}
            {!outside && handleOutsideMail && id !== "new" && (
              <button
                type="button"
                onClick={() => handleOutsideMail()}
                className="text-md font-bold bg-secondary border hover:border-primary hover:text-primary rounded-md p-4 h-6 flex flex-row items-center justify-center text-xs gap-1"
              >
                <Mail size={16} /> {emailButtonText}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
