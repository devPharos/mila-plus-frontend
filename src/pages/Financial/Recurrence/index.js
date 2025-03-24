import React, { useContext, useEffect, useState } from "react";
import PagePreview from "./Preview";
import { useSelector } from "react-redux";
import { FullGridContext } from "..";
import { getData } from "~/functions/gridFunctions";
import PageContainer from "~/components/PageContainer";
import { AlertContext } from "~/App";
import api from "~/services/api";
import { toast } from "react-toastify";

export default function FinancialRecurrence() {
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
      title: "Has Recurrence",
      name: "has_recurrence",
      type: "boolean",
      filter: true,
    },
  ];
  const [selected, setSelected] = useState([]);
  const { alertBox } = useContext(AlertContext);

  const {
    opened,
    orderBy,
    setGridData,
    page,
    setPages,
    limit,
    search,
    setActiveFilters,
    setLoadingData,
  } = useContext(FullGridContext);

  useEffect(() => {
    setActiveFilters([]);
  }, []);

  async function loader() {
    setLoadingData(true);
    const data = await getData("recurrence", {
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
        { registration_number, id, name, last_name, issuer, canceled_at },
        index
      ) => {
        const hasRecurrence =
          issuer && issuer.issuer_x_recurrence ? true : false;
        const ret = {
          show: true,
          id,
          fields: [registration_number, name, last_name, hasRecurrence],
          selectable: hasRecurrence,
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
    if (!opened) {
      loader();
    }
  }, [opened, filial, orderBy, search, limit]);

  function handleStopRecurrence() {
    if (selected.length === 0) {
      return;
    }
    alertBox({
      title: "Attention!",
      descriptionHTML:
        "Are you sure you want to stop this recurrence? This action will remove all pending receivables and cannot be undone.",
      buttons: [
        {
          title: "No",
          class: "cancel",
        },
        {
          title: "Yes",
          onPress: async () => {
            for (let student of selected) {
              try {
                await api
                  .delete(`/recurrence/${student.id}`)
                  .then((response) => {
                    console.log(response);
                  })
                  .catch((err) => {
                    console.log(err);
                  });
              } catch (err) {
                console.log(err);
              }
            }
            toast("Recurrence stopped!", { autoClose: 1000 });
            setSelected([]);
            loader();
          },
        },
      ],
    });
  }

  return (
    <PageContainer
      FullGridContext={FullGridContext}
      PagePreview={PagePreview}
      handleNew={false}
      defaultGridHeader={defaultGridHeader}
      // selection={{
      //   multiple: false,
      //   selected,
      //   setSelected,
      // functions: [
      //   {
      //     title: "Stop Recurrence",
      //     fun: handleStopRecurrence,
      //     icon: "X",
      //     Page: null,
      //     opened: false,
      //     setOpened: () => null,
      //     selected,
      //   },
      // ],
      // }}
    />
  );
}
