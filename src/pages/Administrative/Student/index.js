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
  ];
  const [selected, setSelected] = useState([]);
  const [inactivateOpen, setInactivateOpen] = useState(false);
  const [activateOpen, setActivateOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [medicalAndCertificateVacationOpen, setMedicalAndCertificateVacationOpen] = useState(false);
  
  const {
    opened,
    orderBy,
    setGridData,
    page,
    setPages,
    limit,
    search,
    setLoadingData,
    handleOpened,
  } = useContext(FullGridContext);

  const handleInactivate = () => {
    const newVarOpened = !inactivateOpen;
    setInactivateOpen(newVarOpened);
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
        const ret = {
          show: true,
          id,
          fields: [
            registration_number,
            name,
            last_name,
            studentgroup_name,
            teacher_name,
            category,
            status,
          ],
          selectable: "In Class;Waiting".includes(status),
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
    loader();
  }, [opened, filial, orderBy, search, limit]);

  const selectionFunctions = [];

  if (selected.length > 0) {
    const statusIndex = defaultGridHeader.findIndex(
      (el) => el.name === "status"
    );

    if (selected[0].fields[statusIndex] === "Waiting") {
      selectionFunctions.push({
        title: "Activate",
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
        fun: handleInactivate,
        icon: "X",
        Page: Inactivate,
        opened: inactivateOpen,
        setOpened: setInactivateOpen,
        selected,
      });
      selectionFunctions.push({
        title: "Transfer",
        fun: handleTransfer,
        icon: "Replace",
        Page: Transfer,
        opened: transferOpen,
        setOpened: setTransferOpen,
        selected,
      });
    }
  }

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
