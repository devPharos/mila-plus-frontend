import React, { useContext, useEffect, useState } from "react";
import PagePreview from "./Preview";
import { useSelector } from "react-redux";
import { FullGridContext } from "..";
import { getData } from "~/functions/gridFunctions";
import PageContainer from "~/components/PageContainer";
import Inactivate from "./Inactivate";
import Activate from "./Activate";
import Transfer from "./Transfer";
import MedicalCertificateVacation from "./MedicalCertificateVacation";
import api, { baseURL } from "~/services/api";
import AttendanceAdjustments from "./AttendanceAdjustments";
import GradesAdjustments from "./GradesAdjustments";
import AbsenseControl from "./AbsenseControl";

export default function AdministrativeStudent() {
  const filial = useSelector((state) => state.auth.filial);
  const defaultOrderBy = { column: "name", asc: true };
  const defaultGridHeader = [
    {
      title: "Registration Number",
      name: "registration_number",
      type: "text",
      filter: false,
    },
    {
      title: "Name",
      name: "name",
      type: "text",
      filter: false,
    },
    {
      title: "Last Name",
      name: "last_name",
      type: "text",
      filter: false,
    },
    {
      title: "Phone Number",
      name: "phone",
      type: "text",
      filter: false,
    },
    {
      title: "Group",
      name: ["studentgroup", "name"],
      type: "text",
      filter: false,
    },
    {
      title: "Teacher",
      name: ["teacher", "name"],
      type: "text",
      filter: true,
    },
    {
      title: "Category",
      name: "category",
      type: "text",
      filter: true,
    },
    {
      title: "Status",
      name: "status",
      type: "text",
      filter: true,
    },
    {
      title: "Resp. Agent",
      name: ["agent", "name"],
      type: "text",
      filter: true,
    },
  ];
  const relatoriosOptions = [
    {
      value: "vacation",
      label: "Vacation",
    },
    {
      value: "medical_excuse",
      label: "Medical Excuse",
    },
  ];
  const excelVacationFilterData = [
    {
      title: "Start Date From",
      name: "start_date_from",
      type: "date",
      value: null,
    },
    {
      title: "Start Date To",
      name: "start_date_to",
      type: "date",
      value: null,
    },
    {
      title: "End Date From",
      name: "end_date_from",
      type: "date",
      value: null,
    },
    {
      title: "End Date To",
      name: "end_date_to",
      type: "date",
      value: null,
    },
  ];
  const excelMedicalExcuseFilterData = [
    {
      title: "Date From",
      name: "date_from",
      type: "date",
      value: null,
    },
    {
      title: "Date To",
      name: "date_to",
      type: "date",
      value: null,
    },
  ];
  const [selected, setSelected] = useState([]);
  const [inactivateOpen, setInactivateOpen] = useState(false);
  const [attendanceAdjustmentsOpen, setAttendanceAdjustmentsOpen] =
    useState(false);
  const [gradesAdjustmentsOpen, setGradesAdjustmentsOpen] = useState(false);
  const [absenceControlOpen, setAbsenceControlOpen] = useState(false);
  const [activateOpen, setActivateOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [excelOpen, setExcelOpen] = useState(false);
  const [loadScreen, setLoadScreen] = useState(false);
  const [excelData, setExcelData] = useState([
    {
      title: "Report",
      name: "Report",
      type: "select",
      options: relatoriosOptions,
      value: "vacation",
    },
  ]);
  const [
    medicalAndCertificateVacationOpen,
    setMedicalAndCertificateVacationOpen,
  ] = useState(false);

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
    (el) => el.alias === "students"
  );

  const handleInactivate = () => {
    const newVarOpened = !inactivateOpen;
    setInactivateOpen(newVarOpened);
    if (!newVarOpened) {
      setSelected([]);
      loader();
    }
    handleOpened(null);
  };

  const handleAttendanceAdjustments = () => {
    const newVarOpened = !attendanceAdjustmentsOpen;
    setAttendanceAdjustmentsOpen(newVarOpened);
    if (!newVarOpened) {
      setSelected([]);
      loader();
    }
    handleOpened(null);
  };

  const handleAbsenseControl = () => {
    const newVarOpened = !absenceControlOpen;
    setAbsenceControlOpen(newVarOpened);
    if (!newVarOpened) {
      setSelected([]);
      loader();
    }
    handleOpened(null);
  };

  const handleGradesAdjustments = () => {
    const newVarOpened = !gradesAdjustmentsOpen;
    setGradesAdjustmentsOpen(newVarOpened);
    if (!newVarOpened) {
      setSelected([]);
      loader();
    }
    handleOpened(null);
  };

  const handleActivate = () => {
    const newVarOpened = !activateOpen;
    setActivateOpen(newVarOpened);
    if (!newVarOpened) {
      setSelected([]);
      loader();
    }
    handleOpened(null);
  };

  const handleTransfer = () => {
    const newVarOpened = !transferOpen;
    setTransferOpen(newVarOpened);
    if (!newVarOpened) {
      setSelected([]);
      loader();
    }
    handleOpened(null);
  };

  const handleMedicalAndCertificateVacation = () => {
    const newMedicalAndCertificateVacation = !medicalAndCertificateVacationOpen;
    setMedicalAndCertificateVacationOpen(newMedicalAndCertificateVacation);

    if (!newMedicalAndCertificateVacation) {
      setSelected([]);
      loader();
    }
    handleOpened(null);
  };

  async function loader() {
    setLoadingData(true);
    const data = await getData("students", {
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
          registration_number,
          id,
          name,
          last_name,
          phone,
          agent,
          studentgroup,
          teacher,
          category,
          status,
          canceled_at,
        },
        index
      ) => {
        let studentgroup_name = "";
        if (studentgroup) {
          studentgroup_name = studentgroup.name;
        }
        let teacher_name = "";
        if (teacher) {
          teacher_name = teacher.name;
        }
        let agent_name = "";
        if (agent) {
          agent_name = agent.name;
        }
        const ret = {
          show: true,
          id,
          fields: [
            registration_number,
            name,
            last_name,
            phone,
            studentgroup_name,
            teacher_name,
            category,
            status,
            agent_name,
          ],
          selectable: "In Class;Waiting;Inactive".includes(status),
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
    setExcelOpen(false);

    const newValue =
      excelData[0].value === "vacation"
        ? JSON.parse(
            JSON.stringify([
              {
                ...excelData[0],
              },
              ...excelVacationFilterData,
            ])
          )
        : JSON.parse(
            JSON.stringify([
              {
                ...excelData[0],
              },
              ...excelMedicalExcuseFilterData,
            ])
          );

    setExcelData(
      newValue.map((res, i) => {
        return {
          ...res,
          value: i === 0 ? res.value : null,
        };
      })
    );

    if (loadScreen) {
      setTimeout(() => setExcelOpen(true), 100);
    }

    if (!loadScreen) {
      setLoadScreen(true);
    }
  }, [excelData[0].value]);

  useEffect(() => {
    loader();
  }, [opened, filial, orderBy, search, limit, page]);

  const selectionFunctions = [];

  if (selected.length > 0) {
    const statusIndex = defaultGridHeader.findIndex(
      (el) => el.name === "status"
    );

    if (selected[0].fields[statusIndex] === "Waiting") {
      selectionFunctions.push({
        title: "Activate",
        alias: "activate",
        fun: handleActivate,
        icon: "School",
        Page: Activate,
        opened: activateOpen,
        setOpened: setActivateOpen,
        selected,
      });
    }

    selectionFunctions.push({
      title: "M.E. & Vacation",
      alias: "medical-certificate-vacation",
      fun: handleMedicalAndCertificateVacation,
      icon: "FileText",
      Page: MedicalCertificateVacation,
      opened: medicalAndCertificateVacationOpen,
      setOpened: setMedicalAndCertificateVacationOpen,
      selected,
    });

    if (selected[0].fields[statusIndex] === "In Class") {
      selectionFunctions.push({
        title: "Inactivate",
        alias: "inactivate",
        fun: handleInactivate,
        icon: "X",
        Page: Inactivate,
        opened: inactivateOpen,
        setOpened: setInactivateOpen,
        selected,
      });
      selectionFunctions.push({
        title: "Transfer",
        alias: "transfer",
        fun: handleTransfer,
        icon: "Replace",
        Page: Transfer,
        opened: transferOpen,
        setOpened: setTransferOpen,
        selected,
      });
    }

    if (
      selected[0].fields[statusIndex] === "In Class" ||
      selected[0].fields[statusIndex] === "Inactive"
    ) {
      selectionFunctions.push({
        title: "Attendance Adjust.",
        alias: "attendance-adjustments",
        fun: handleAttendanceAdjustments,
        icon: "Highlighter",
        Page: AttendanceAdjustments,
        opened: attendanceAdjustmentsOpen,
        setOpened: setAttendanceAdjustmentsOpen,
        selected,
      });
      selectionFunctions.push({
        title: "Absence Control",
        alias: "absense-control",
        fun: handleAbsenseControl,
        icon: "Percent",
        Page: AbsenseControl,
        opened: absenceControlOpen,
        setOpened: setAbsenceControlOpen,
        selected,
      });
      selectionFunctions.push({
        title: "Grades Adjust.",
        alias: "grades-adjustments",
        fun: handleGradesAdjustments,
        icon: "Highlighter",
        Page: GradesAdjustments,
        opened: gradesAdjustmentsOpen,
        setOpened: setGradesAdjustmentsOpen,
        selected,
      });
    }
  }

  async function handleExcel(generate = true) {
    if (excelOpen && generate) {
      // Construa o payload com base nos estados dos seus inputs
      const payload =
        excelData[0].value === "vacation"
          ? {
              start_date_from: excelData[1].value, // formato 'YYYY-MM-DD'
              start_date_to: excelData[2].value, // formato 'YYYY-MM-DD'
              end_date_from: excelData[3].value, // formato 'YYYY-MM-DD'
              end_date_to: excelData[4].value, // formato 'YYYY-MM-DD'
            }
          : {
              date_from: excelData[1].value,
              date_to: excelData[2].value,
            };

      try {
        const { data } = await api.post(
          `/${
            excelData.filter((res) => res.title === "Report")[0].value
          }/excel`,
          payload
        );

        // A baseURL deve apontar para o seu servidor backend
        // Ex: 'http://localhost:3333'
        saveAs(`${baseURL}/get-file/${data.name}`, `${data.name}.xlsx`);
      } catch (err) {
        // É uma boa prática mostrar o erro para o usuário
        if (err.response && err.response.data && err.response.data.error) {
          alert(`Erro: ${err.response.data.error}`); // ou use um componente de toast/notificação
        } else {
          alert("Ocorreu um erro ao gerar o relatório.");
        }
        console.error(err);
      }
    }

    setExcelOpen(!excelOpen);
  }

  return (
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
      Excel={{
        fun: handleExcel,
        opened: excelOpen,
        excelData,
        setExcelData,
      }}
    />
  );
}
