import React, { useContext, useEffect, useState } from "react";
import PagePreview from "./Preview";
import { useSelector } from "react-redux";
import { FullGridContext } from "..";
import { getData } from "~/functions/gridFunctions";
import PageContainer from "~/components/PageContainer";
import Inactivate from "./Inactivate";
import { AlertContext } from "~/App";
import { toast } from "react-toastify";
import api from "~/services/api";

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
  const { alertBox } = useContext(AlertContext);
  const [selected, setSelected] = useState([]);
  const [inactivateOpen, setInactivateOpen] = useState(false);

  const handleInactivate = () => {
    if (selected[0].fields[6] === "Inactive") {
      toast("Only active students can be inactivated!", {
        autoClose: 3000,
      });
      return;
    }
    const newVarOpened = !inactivateOpen;
    setInactivateOpen(newVarOpened);
    if (!newVarOpened) {
      setSelected([]);
      loader();
    }
  };

  const handleActivate = () => {
    if (selected[0].fields[6] !== "Waiting") {
      toast("Only students on waiting list can be activated!", {
        autoClose: 3000,
      });
      return;
    }
    alertBox({
      title: "Activate",
      descriptionHTML:
        "Are you sure you want to activate this student? \n This action will put the student In Class.",
      buttons: [
        {
          title: "Yes",
          onPress: async () => {
            const data = await api.post(`/students/activate/${selected[0].id}`);
            if (data) {
              toast("Student activated!", { autoClose: 3000 });
              setSelected([]);
              loader();
            }
          },
        },
        {
          title: "No",
          onPress: async () => {
            return;
          },
        },
      ],
    });
  };

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
          email,
          phone,
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
    loader();
  }, [opened, filial, orderBy, search, limit]);

  return (
    <PageContainer
      FullGridContext={FullGridContext}
      PagePreview={PagePreview}
      defaultGridHeader={defaultGridHeader}
      selection={{
        multiple: false,
        selected,
        setSelected,
        functions: [
          {
            title: "Put In Class",
            fun: handleActivate,
            icon: "School",
            Page: () => null,
            opened: inactivateOpen,
            setOpened: setInactivateOpen,
            selected,
          },
          {
            title: "Inactivate",
            fun: handleInactivate,
            icon: "X",
            Page: Inactivate,
            opened: inactivateOpen,
            setOpened: setInactivateOpen,
            selected,
          },
        ],
      }}
    />
  );
}
