import React, { useContext, useEffect, useState } from "react";
import PagePreview from "./Preview";
import { useSelector } from "react-redux";
import { getData } from "~/functions/gridFunctions";
import PageContainer from "~/components/PageContainer";
import { FullGridContext } from "..";
import api from "~/services/api";
import { toast } from "react-toastify";
import { AlertContext } from "~/App";

export default function Groups() {
  const { alertBox } = useContext(AlertContext);
  const filial = useSelector((state) => state.auth.filial);
  const defaultOrderBy = { column: "bank_name", asc: true };
  const defaultGridHeader = [
    {
      title: "Name",
      name: "name",
      type: "text",
      filter: false,
    },
    {
      title: "Type",
      name: "type",
      type: "text",
      filter: true,
    },
    {
      title: "Users",
      name: "users",
      type: "integer",
      filter: false,
    },
    {
      title: "Filial",
      name: "filial",
      type: "text",
      filter: true,
    },
  ];
  const [selected, setSelected] = useState([]);
  const [deleteOpened, setDeleteOpened] = useState(false);

  const handleDelete = () => {
    alertBox({
      title: "Attention!",
      descriptionHTML: "Are you sure you want to delete this group?",
      buttons: [
        {
          title: "No",
          class: "cancel",
        },
        {
          title: "Yes",
          onPress: async () => {
            api
              .delete(`groups/${selected[0].id}`)
              .then(() => {
                toast("Group deleted!", { autoClose: 3000 });
                setSelected([]);
                loader();
              })
              .catch((err) => {
                toast(err.response.data.error, { autoClose: 3000 });
              });
          },
        },
      ],
    });
  };

  const selectionFunctions = [];

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

  const pageAccess = accessModule.children.find((el) => el.alias === "groups");

  useEffect(() => {
    setActiveFilters([]);
  }, []);
  async function loader() {
    setLoadingData(true);
    const data = await getData("groups?filialId=" + filial.id, {
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
        { id, name, Filialtype, canceled_at, filial, fixed, groupxuser },
        index
      ) => {
        const filialTypeName = Filialtype.name;
        const filialName = filial.name;
        return {
          show: true,
          id,
          fields: [
            name,
            filialTypeName,
            groupxuser.length + " user(s)",
            filialName,
          ],
          canceled: canceled_at,
          page: Math.ceil((index + 1) / limit),
          selectable: !fixed && !groupxuser.length,
        };
      }
    );
    setGridData(gridDataValues);
    setLoadingData(false);
  }

  useEffect(() => {
    loader();
  }, [opened, filial, orderBy, search, limit, page]);

  if (selected.length > 0) {
    selectionFunctions.push({
      title: "Delete not used group",
      fun: handleDelete,
      icon: "X",
      Page: () => null,
      opened: deleteOpened,
      setOpened: setDeleteOpened,
      selected,
    });
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
    />
  );
}
