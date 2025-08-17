import React, { useContext, useEffect } from "react";
import { format, parseISO } from 'date-fns';
import PagePreview from "./Preview";
import { useSelector } from "react-redux";
import { getData } from "~/functions/gridFunctions";
import PageContainer from "~/components/PageContainer";
import { FullGridContext } from "..";

export const campaign_type_options = [
  { label: "Promotional Campaign", value: "promotional_campaign" },
  { label: "Seasonal Campaign", value: "seasonal_campaign" },
  { label: "Retention Campaign", value: "retention_campaign" }
]

export const marketing_channel_options = [
  { label: "Email Marketing", value: "email_marketing" },
  { label: "Social Media", value: "social_media" },
  { label: "WhatsApp", value: "whatsapp" },
  { label: "Search Engine Marketing (SEM)", value: "search_engine_marketing" },
  { label: "Influencer Marketing", value: "influencer_marketing" },
  { label: "Event Marketing", value: "event_marketing" },
  { label: "Partnership", value: "partnership" },
  { label: "Other", value: "other" }
];


export default function PartnersAndInfluencers() {
  const filial = useSelector((state) => state.auth.filial);
  const defaultOrderBy = { column: "campaign_name", asc: true };

  const compensationOptions = [
    { value: 'flat_fee', label: "Flat fee" },
    { value: 'percentage_per_enrollment', label: "Percentage Per Enrollment" },
    { value: 'flat_fee_per_enrollment', label: "Flat fee Per Enrollment" },
  ];

  const defaultGridHeader = [
    {
      title: "Campaign Name",
      name: "campaign_name",
      type: "text",
      filter: false,
    },
    {
      title: "Campaign Objective",
      name: "campaign_objective",
      type: "text",
      filter: false,
    },
    {
      title: "Target Audience",
      name: "target_audience",
      type: "text",
      filter: false,
    },
    {
      title: "Start Date:",
      name: "start_date:",
      type: "text",
      filter: false,
    },
    {
      title: "End Date",
      name: "end_date",
      type: "text",
      filter: false,
    },
    {
      title: "Budget",
      name: "budget",
      type: "text",
      filter: false,
    },
    {
      title: "Marketing Channel",
      name: "marketing_channel",
      type: "text",
      filter: false,
    },
    {
      title: "Campaign Type",
      name: "campaign_type",
      type: "text",
      filter: false,
    },
    {
      title: "Discount Related",
      name: "discount_related",
      type: "text",
      filter: false,
    },
    {
      title: "Status",
      name: "status",
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
    (el) => el.alias === "campaign"
  );

  async function loader() {
    setLoadingData(true);

    const data = await getData("campaign", {
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

    const gridDataValues = data.map(({
      id,
      campaign_name,
      campaign_objective,
      target_audience,
      start_date,
      end_date,
      budget,
      marketing_channel,
      campaign_type,
      discount_list,
      status,
      canceled_at,
    }, index) => {
      const budget_format =  new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(budget);

      const ret = {
        show: true,
        id,
        fields: [
          campaign_name,
          campaign_objective,
          target_audience,
          format(parseISO(start_date), 'MM/dd/yyyy'),
          format(parseISO(end_date), 'MM/dd/yyyy'),
          budget_format,
          marketing_channel_options.find(res => res.value === marketing_channel).label,
          campaign_type_options.find(res => res.value === campaign_type).label,
          discount_list ? `${discount_list.name} ${discount_list.value}%` : '-',
          status ? 'Active' :'Deactive',
        ],
        canceled: canceled_at,
        page: Math.ceil((index + 1) / limit),
      };

      return ret;
    });
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
