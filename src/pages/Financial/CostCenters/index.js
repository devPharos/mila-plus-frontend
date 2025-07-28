import React, { useContext, useEffect } from "react";
import PagePreview from "./Preview";
import { useSelector } from "react-redux";
import { getData } from "~/functions/gridFunctions";
import PageContainer from "~/components/PageContainer";
import { FullGridContext } from "..";

export default function CostCenters() {
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
      title: "P&L",
      name: "profit_and_loss",
      type: "boolean",
      filter: true,
    },
    {
      title: "Posting",
      name: "allow_use",
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
    (el) => el.alias === "cost-centers"
  );

  useEffect(() => {
    setActiveFilters([]);
  }, []);
  async function loader() {
    setLoadingData(true);
    const data = await getData("costCenters", {
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
        { id, code, name, Father, visibility, allow_use, profit_and_loss },
        index
      ) => {
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
            allow_use,
            visibility,
          ],
          page: Math.ceil((index + 1) / limit),
        };
      }
    );
    setGridData(gridDataValues);
    setLoadingData(false);
  }

  useEffect(() => {
    loader();
  }, [opened, filial, orderBy, search, limit, page]);

  return (
    <PageContainer
      FullGridContext={FullGridContext}
      PagePreview={PagePreview}
      pageAccess={pageAccess}
      defaultGridHeader={defaultGridHeader}
    />
  );
}
