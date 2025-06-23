import React, { useContext, useEffect } from "react";
import PagePreview from "./Preview";
import { useSelector } from "react-redux";
import { getData } from "~/functions/gridFunctions";
import PageContainer from "~/components/PageContainer";
import { FullGridContext } from "..";

export default function Workloads() {
  const filial = useSelector((state) => state.auth.filial);
  const defaultOrderBy = { column: "name", asc: true };
  const defaultGridHeader = [
    {
      title: "Level",
      name: "level_name",
      type: "text",
      filter: true,
    },
    {
      title: "Language Mode",
      name: "languagemode_name",
      type: "text",
      filter: true,
    },
    {
      title: "Name",
      name: "name",
      type: "text",
      filter: false,
    },
    {
      title: "Days/Week",
      name: "days_per_week",
      type: "text",
      filter: false,
    },
    {
      title: "Hours/Day",
      name: "hours_per_day",
      type: "text",
      filter: false,
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
    setGridDetails,
  } = useContext(FullGridContext);

  useEffect(() => {
    setActiveFilters([]);
  }, []);
  async function loader() {
    setLoadingData(true);
    const data = await getData("workloads", {
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
        { id, name, Level, Languagemode, days_per_week, hours_per_day },
        index
      ) => {
        if (!name) {
          name = `${days_per_week.toString()} day(s) per week, ${hours_per_day.toString()} hour(s) per day.`;
        }
        const level_name = Level.Programcategory.name + " - " + Level.name;
        const languagemode_name = Languagemode.name;
        return {
          show: true,
          id,
          fields: [
            level_name,
            languagemode_name,
            name,
            days_per_week.toString(),
            hours_per_day.toString(),
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
      defaultGridHeader={defaultGridHeader}
    />
  );
}
