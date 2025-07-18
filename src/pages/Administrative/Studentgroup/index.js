import React, { useContext, useEffect, useState } from "react";
import PagePreview from "./Preview";
import { useSelector } from "react-redux";
import { FullGridContext } from "..";
import { getData } from "~/functions/gridFunctions";
import PageContainer from "~/components/PageContainer";
import { format, parseISO, set } from "date-fns";
import { toast } from "react-toastify";
import api from "~/services/api";
import Attendance from "./Attendance";
import AttendanceReport from "./Attendance Report";

export default function Studentgroups() {
  const filial = useSelector((state) => state.auth.filial);
  const [loading, setLoading] = useState(false);
  const { profile } = useSelector((state) => state.user);
  const defaultOrderBy = { column: "name", asc: true };
  const defaultGridHeader = [
    {
      title: "Name",
      name: "name",
      type: "text",
      filter: false,
    },
    {
      title: "Status",
      name: "status",
      type: "text",
      filter: true,
    },
    // {
    //   title: "Private",
    //   name: "private",
    //   type: "boolean",
    //   filter: true,
    // },
    {
      title: "Level",
      name: ["level", "name"],
      type: "text",
      filter: true,
    },
    // {
    //   title: "Language Mode",
    //   name: "languagemode_name",
    //   type: "text",
    //   filter: false,
    // },
    {
      title: "Classroom",
      name: "classroom_name",
      type: "text",
      filter: false,
    },
    {
      title: "Workload",
      name: "workload_name",
      type: "text",
      filter: false,
    },
    {
      title: "Staff",
      name: "staff_name",
      type: "text",
      filter: false,
    },
    {
      title: "In Group",
      name: "students",
      type: "integer",
      filter: false,
    },
    {
      title: "Start Date",
      name: "start_date",
      type: "date",
      filter: false,
    },
    {
      title: "End Date",
      name: "end_date",
      type: "date",
      filter: false,
    },
  ];
  const [selected, setSelected] = useState([]);
  const [startGroup, setStartGroup] = useState(false);
  const [openAttendance, setOpenAttendance] = useState(false);
  const [openAttendanceReport, setOpenAttendanceReport] = useState(false);

  const {
    accessModule,
    activeFilters,
    gridData,
    gridDetails,
    gridHeader,
    handleFilters,
    handleOpened,
    limit,
    loadingData,
    opened,
    orderBy,
    page,
    pages,
    search,
    setActiveFilters,
    setGridData,
    setGridDetails,
    setGridHeader,
    setLimit,
    setLoadingData,
    setOpened,
    setOrderBy,
    setPage,
    setPages,
    setSearch,
    setTotalRows,
    setSuccessfullyUpdated,
    successfullyUpdated,
    totalRows,
  } = useContext(FullGridContext);

  const pageAccess = accessModule.children.find(
    (el) => el.alias === "studentgroups"
  );

  async function handleStart() {
    setLoading(true);
    if (selected[0].fields[1] !== "In Formation") {
      toast("Only in formation groups can be started!", {
        autoClose: 3000,
      });
      setLoading(false);
      return;
    }
    try {
      await api.post(`/studentgroups/start/${selected[0].id}`);
      toast("Group started!", { autoClose: 3000 });
      setLoading(false);
    } catch (err) {
      toast(err.response.data.error, { type: "error", autoClose: 3000 });
      setLoading(false);
    }
    setSelected([]);
    handleOpened(null);
  }

  async function handlePause() {
    setLoading(true);
    if (selected[0].fields[1] !== "Ongoing") {
      toast("Only ongoing groups can be paused!", {
        autoClose: 3000,
      });
      setLoading(false);
      return;
    }
    try {
      await api.post(`/studentgroups/pause/${selected[0].id}`);
      toast("Group paused!", { autoClose: 3000 });
      setLoading(false);
    } catch (err) {
      toast(err.response.data.error, { type: "error", autoClose: 3000 });
      setLoading(false);
    }
    setSelected([]);
    handleOpened(null);
  }

  function handleAttendance() {
    setOpenAttendance(!openAttendance);
    handleOpened(null);
  }

  function handleAttendanceReport() {
    setOpenAttendanceReport(!openAttendanceReport);
    handleOpened(null);
  }

  async function loader() {
    setLoadingData(true);
    const data = await getData("studentgroups", {
      limit,
      page,
      orderBy,
      setPages,
      setGridData,
      search,
      defaultGridHeader,
      defaultOrderBy,
      setGridDetails,
    });

    if (!data) {
      return;
    }
    const gridDataValues = data.map(
      (
        {
          id,
          name,
          status,
          private: privateStatus,
          classes,
          level,
          languagemode,
          classroom,
          workload,
          staff,
          students,
          start_date,
          end_date,
          canceled_at,
        },
        index
      ) => {
        const { class_number: classroom_name } = classroom;
        const { name: workload_name } = workload;
        const { name: staff_name } = staff;
        const { name: level_name } = level;
        const { name: languagemode_name } = languagemode;

        const ret = {
          show: true,
          id,
          fields: [
            name,
            status,
            // privateStatus,
            level_name,
            // languagemode_name,
            classroom_name,
            workload_name,
            staff_name,
            students.length,
            format(parseISO(start_date), "MM/dd/yyyy"),
            end_date ? format(parseISO(end_date), "MM/dd/yyyy") : "",
          ],
          others: {
            classes: classes.length,
          },
          selectable: true,
          canceled: canceled_at,
          page: Math.ceil((index + 1) / limit),
        };
        return ret;
      }
    );
    setGridData(gridDataValues);
    setLoadingData(false);
  }

  useEffect(() => {
    if (selected.length === 0) {
      loader();
    }
  }, [opened, filial, orderBy, search, limit, selected]);

  const selectionFunctions = [];

  // Função liberada para professor
  // if (groupName === "Teacher") {
  if (selected.length > 0 && selected[0].fields[1] === "Ongoing") {
    selectionFunctions.push({
      title: "Attendance",
      alias: "attendance",
      fun: handleAttendance,
      icon: "Highlighter",
      Page: Attendance,
      opened: openAttendance,
      setOpened: setOpenAttendance,
      selected,
    });
    selectionFunctions.push({
      title: "Attendance Report",
      alias: "attendance-report",
      fun: handleAttendanceReport,
      icon: "Highlighter",
      Page: AttendanceReport,
      opened: openAttendanceReport,
      setOpened: setOpenAttendanceReport,
      selected,
    });
  }

  // Funções para não professores
  // } else {
  if (selected.length === 0 || selected[0].fields[1] === "In Formation") {
    selectionFunctions.push({
      title: "Start Group",
      alias: "start-group",
      fun: handleStart,
      icon: "Play",
      Page: () => null,
      opened: startGroup,
      setOpened: setStartGroup,
      selected,
    });
  }
  if (selected.length > 0 && selected[0].fields[1] === "Ongoing") {
    if (selected[0].others.classes === 0) {
      selectionFunctions.push({
        title: "Pause Group",
        alias: "pause-group",
        fun: handlePause,
        icon: "Pause",
        Page: () => null,
        opened: startGroup,
        setOpened: setStartGroup,
        selected,
      });
    }
  }
  // }

  return (
    <>
      <PageContainer
        FullGridContext={FullGridContext}
        PagePreview={PagePreview}
        pageAccess={pageAccess}
        defaultGridHeader={defaultGridHeader}
        selection={{
          multiple: false,
          selected,
          setSelected,
          functions: selectionFunctions,
        }}
      />
      {loading && (
        <div className="flex justify-center items-center h-screen absolute top-0 left-0 w-full bg-gray-500 bg-opacity-50">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-700" />
        </div>
      )}
    </>
  );
}
