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

export default function Studentgroups() {
  const filial = useSelector((state) => state.auth.filial);
  const { profile } = useSelector((state) => state.user);
  const groupName = profile.groups[0].group.name;
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
      filter: false,
    },
    {
      title: "Language Mode",
      name: "languagemode_name",
      type: "text",
      filter: false,
    },
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

  async function handleStart() {
    if (selected[0].fields[1] !== "In Formation") {
      toast("Only in formation groups can be started!", {
        autoClose: 3000,
      });
      return;
    }
    try {
      await api.post(`/studentgroups/start/${selected[0].id}`);
      toast("Group started!", { autoClose: 3000 });
    } catch (err) {
      toast(err.response.data.error, { type: "error", autoClose: 3000 });
    }
    setSelected([]);
  }

  async function handlePause() {
    if (selected[0].fields[1] !== "Ongoing") {
      toast("Only ongoing groups can be paused!", {
        autoClose: 3000,
      });
      return;
    }
    try {
      await api.post(`/studentgroups/pause/${selected[0].id}`);
      toast("Group paused!", { autoClose: 3000 });
    } catch (err) {
      toast(err.response.data.error, { type: "error", autoClose: 3000 });
    }
    setSelected([]);
  }

  async function handleAttendance() {
    setOpenAttendance(!openAttendance);
  }

  const {
    opened,
    orderBy,
    setGridData,
    page,
    setPages,
    limit,
    search,
    setLoadingData,
  } = useContext(FullGridContext);

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
            languagemode_name,
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
      fun: handleAttendance,
      icon: "Highlighter",
      Page: Attendance,
      opened: openAttendance,
      setOpened: setOpenAttendance,
      selected,
    });
  }

  // Funções para não professores
  // } else {
  if (selected.length === 0 || selected[0].fields[1] === "In Formation") {
    selectionFunctions.push({
      title: "Start Group",
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
    <PageContainer
      FullGridContext={FullGridContext}
      PagePreview={PagePreview}
      defaultGridHeader={defaultGridHeader}
      selection={{
        multiple: false,
        selected,
        setSelected,
        functions: selectionFunctions,
      }}
    />
  );
}
