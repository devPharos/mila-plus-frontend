import React, { useContext, useEffect, useState } from "react";
import PagePreview from "./Preview";
import { useSelector } from "react-redux";
import { FullGridContext } from "..";
import { getData } from "~/functions/gridFunctions";
import PageContainer from "~/components/PageContainer";
import Inactivate from "./Inactivate";
import { AlertContext } from "~/App";

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
      title: "E-mail",
      name: "email",
      type: "text",
      filter: false,
    },
    {
      title: "Phone",
      name: "phone",
      type: "text",
      filter: false,
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
    const newVarOpened = !inactivateOpen;
    setInactivateOpen(newVarOpened);
    if (!newVarOpened) {
      setSelected([]);
      loader();
    }
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
          category,
          status,
          canceled_at,
        },
        index
      ) => {
        const ret = {
          show: true,
          id,
          fields: [
            registration_number,
            name,
            last_name,
            email,
            phone,
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
