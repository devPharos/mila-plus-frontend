import React, { useContext, useEffect } from "react";
import PagePreview from "./Preview";
import { useSelector } from "react-redux";
import { getData } from "~/functions/gridFunctions";
import PageContainer from "~/components/PageContainer";
import { FullGridContext } from "..";

export default function PartnersAndInfluencers() {
  const filial = useSelector((state) => state.auth.filial);
  const defaultOrderBy = { column: "name", asc: true };

  const compensationOptions = [
    { value: 'flat_fee', label: "Flat fee" },
    { value: 'percentage_per_enrollment', label: "Percentage Per Enrollment" },
    { value: 'flat_fee_per_enrollment', label: "Flat fee Per Enrollment" },
  ];

  const defaultGridHeader = [
    {
      title: "Partner's Name",
      name: "partners_name",
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
      name: "social_network_type ",
      type: "text",
      filter: false,
    },
    {
      title: "Social Profile",
      name: "social_network",
      type: "text",
      filter: false,
    },
    {
      title: "Telephone",
      name: "phone",
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
      name: "compensation_value",
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

    const data = await getData("partners_and_influencers", {
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
      ({ id, partners_name, contacts_name, social_network_type, social_network, phone, address, compensation_value, compensation, canceled_at }, index) => {

        let compensation_value_format = '';

        if(compensation === 'percentage_per_enrollment') {
          compensation_value_format = `${compensation_value}%`;
        } else {
          compensation_value_format =  new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
          }).format(compensation_value);
        }

        const ret = {
          show: true,
          id,
          fields: [partners_name, contacts_name, social_network_type, social_network, phone, address, compensationOptions.find(res => res.value === compensation).label, compensation_value_format],
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
