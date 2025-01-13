import React, { useContext, useEffect } from "react";
import PagePreview from "./Preview";
import { useSelector } from "react-redux";
import { getData } from "~/functions/gridFunctions";
import PageContainer from "~/components/PageContainer";
import { FullGridContext } from "..";

export default function CommercialProspects() {
  const filial = useSelector((state) => state.auth.filial);
  const defaultOrderBy = { column: "name", asc: true };
  const defaultGridHeader = [
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
      title: "Type",
      name: "processtypes",
      type: "text",
      filter: true,
    },
    {
      title: "Sub Status",
      name: "processsubstatuses",
      type: "text",
      filter: true,
    },
    {
      title: "Responsible Agent",
      name: "agent",
      type: "text",
      filter: true,
    },
  ];

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

  useEffect(() => {
    async function loader() {
      setLoadingData(true);
      const data = await getData("prospects", {
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
            last_name,
            email,
            canceled_at,
            agent,
            processtypes,
            processsubstatuses,
          },
          index
        ) => {
          const ret = {
            show: true,
            id,
            fields: [
              name,
              last_name,
              email,
              processtypes.name,
              processsubstatuses.name,
              agent.name,
            ],
            canceled: canceled_at,
            page: Math.ceil((index + 1) / limit),
          };
          return ret;
        }
      );
      setGridData(gridDataValues);
      setLoadingData(false);
    }
    loader();
  }, [opened, filial, orderBy, search, limit]);

  return (
    <PageContainer
      FullGridContext={FullGridContext}
      PagePreview={PagePreview}
      defaultGridHeader={defaultGridHeader}
    />
  );
}
