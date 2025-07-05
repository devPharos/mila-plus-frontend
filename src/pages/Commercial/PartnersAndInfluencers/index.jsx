import React, { useContext, useEffect } from "react";
import PagePreview from "./Preview";
import { useSelector } from "react-redux";
import { getData } from "~/functions/gridFunctions";
import PageContainer from "~/components/PageContainer";
import { FullGridContext } from "..";

export default function PartnersAndInfluencers() {
  const filial = useSelector((state) => state.auth.filial);
  const defaultOrderBy = { column: "name", asc: true };
  const defaultGridHeader = [
    {
      title: "Partner's Name",
      name: "partners_ame",
      type: "text",
      filter: false,
    },
    {
      title: "Contact's Name",
      name: "contacts_name",
      type: "text",
      filter: false,
    },
    {
      title: "Social Media ",
      name: "social_µedia ",
      type: "text",
      filter: false,
    },
    {
      title: "Telephone",
      name: "telephoneame",
      type: "text",
      filter: false,
    },
    {
      title: "Address",
      name: "address",
      type: "text",
      filter: false,
    },
    {
      title: "Compensation",
      name: "compensation",
      type: "text",
      filter: false,
    },
    {
      title: "Value or Percentual.",
      name: "Campo Value/Percen.",
      type: "text",
      filter: false,
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
      (el) => el.alias === "partners-and-influencers"
    );

  async function loader() {
    setLoadingData(true);

    // const data = await getData("partners-and-influencers", {
    //   limit,
    //   page,
    //   orderBy,
    //   setPages,
    //   setGridData,
    //   search,
    //   defaultGridHeader,
    //   defaultOrderBy,
    //   setGridDetails,
    // });


    const data = [];

    if (!data) {
      return;
    }

    const gridDataValues = data.map(
      ({ id, name, email, canceled_at }, index) => {
        const ret = {
          show: true,
          id,
          fields: [name, email],
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
