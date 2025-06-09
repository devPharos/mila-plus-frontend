import React, { useContext, useEffect } from "react";
import PagePreview from "./Preview";
import { useSelector } from "react-redux";
import { getData } from "~/functions/gridFunctions";
import PageContainer from "~/components/PageContainer";
import { FullGridContext } from "..";

export default function FinancialBank() {
  const filial = useSelector((state) => state.auth.filial);
  const defaultOrderBy = { column: "code", asc: true };
  const defaultGridHeader = [
    {
      title: "Code",
      name: "code",
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
      title: "Level 2",
      name: "name",
      type: "text",
      filter: false,
    },
    {
      title: "Level 3",
      name: "name",
      type: "text",
      filter: false,
    },
    {
      title: "Level 4",
      name: "name",
      type: "text",
      filter: false,
    },
    {
      title: "Profit and Loss",
      name: "profit_and_loss",
      type: "boolean",
      filter: true,
    },
    {
      title: "Visibility",
      name: "visibility",
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
    setActiveFilters,
    setLoadingData,
  } = useContext(FullGridContext);

  useEffect(() => {
    setActiveFilters([]);
  }, []);

  useEffect(() => {
    async function loader() {
      setLoadingData(true);
      const data = await getData("chartofaccounts", {
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
        ({ id, code, name, Father, visibility, profit_and_loss }, index) => {
          let fullName = "";
          let levelOne = "";
          let levelTwo = "";
          let levelThree = "";
          let levelFour = "";
          if (Father) {
            if (Father.Father) {
              if (Father.Father.Father) {
                levelOne = Father.Father.Father.name;
                levelTwo = Father.Father.name;
                levelThree = Father.name;
                levelFour = name;
                fullName += Father.Father.Father.name + " > ";
              } else {
                levelOne = Father.Father.name;
                levelTwo = Father.name;
                levelThree = name;
              }
              fullName += Father.Father.name + " > ";
            } else {
              levelOne = Father.name;
              levelTwo = name;
            }
            fullName += Father.name + " > ";
          } else {
            levelOne = name;
          }
          fullName += name;

          return {
            show: true,
            id,
            fields: [
              code,
              levelOne,
              levelTwo,
              levelThree,
              levelFour,
              profit_and_loss,
              visibility,
            ],
            page: Math.ceil((index + 1) / limit),
          };
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
