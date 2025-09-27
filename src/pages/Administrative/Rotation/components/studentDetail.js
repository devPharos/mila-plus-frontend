import { X } from "lucide-react";

export default function StudentDetail({ studentGroup, setShowDetails, group }) {
  if (!studentGroup) return null;
  const { name, last_name } = studentGroup.frequency.student;
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-10">
      <div className="w-full h-full flex flex-col items-center justify-center gap-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg">
          <div className="flex flex-col items-center justify-center gap-4 p-4">
            <div className="w-full flex flex-row items-center justify-between gap-4 pb-2 border-b">
              <h1 className="text-sm font-bold">
                {name} <span className="font-extralight">{last_name}</span>
              </h1>
              <div className="text-xl font-bold cursor-pointer">
                <X size={22} onClick={() => setShowDetails(null)} />
              </div>
            </div>
            <div className="flex flex-row items-center justify-center gap-4">
              <div className="flex flex-col items-start justify-center gap-2"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
