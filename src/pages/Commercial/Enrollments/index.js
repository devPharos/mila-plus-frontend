import React, { useContext, useEffect } from "react";

import { useSelector } from "react-redux";
import { getData } from "~/functions/gridFunctions";
import PageContainer from "~/components/PageContainer";
import { FullGridContext } from "..";
import { format, parseISO } from "date-fns";
import PagePreview from "./Preview/index.js";

export default function CommercialEnrollments() {
  const filial = useSelector((state) => state.auth.filial);
  const defaultOrderBy = { column: "application", asc: true };
  const defaultGridHeader = [
    {
      title: "Enroll. Start",
      name: "start_date",
      type: "text",
      filter: false,
    },
    {
      title: "Prospect",
      name: "prospect",
      type: "text",
      filter: true,
    },
    {
      title: "Type",
      name: "type",
      type: "text",
      filter: true,
    },
    {
      title: "Sub Status",
      name: "sub_status",
      type: "text",
      filter: true,
    },
    {
      title: "Application",
      name: "application",
      type: "text",
      filter: true,
    },
    {
      title: "Phase Step",
      name: "phase_step",
      type: "text",
      filter: false,
    },
    {
      title: "Step Date",
      name: "step_date",
      type: "text",
      filter: false,
    },
    {
      title: "Step Status",
      name: "step_status",
      type: "text",
      filter: false,
    },
    {
      title: "Expected Date",
      name: "expected_date",
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
    setLoadingData,
  } = useContext(FullGridContext);

  useEffect(() => {
    async function loader() {
      setLoadingData(true);
      const data = await getData("enrollments", {
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
          { id, students, enrollmenttimelines, canceled_at, application },
          index
        ) => {
          const { name, processtypes, processsubstatuses } = students;
          const type = processtypes ? processtypes.name : "";
          const sub_status = processsubstatuses ? processsubstatuses.name : "";
          const {
            phase,
            phase_step,
            created_at: stepCreatedAt,
            step_status,
            expected_date,
          } = enrollmenttimelines[enrollmenttimelines.length - 1];
          const exptected = expected_date
            ? format(parseISO(expected_date), "MM/dd/yyyy")
            : "-";
          const enroll_start =
            enrollmenttimelines.length > 0
              ? format(
                  parseISO(enrollmenttimelines[0].created_at),
                  "MM/dd/yyyy"
                )
              : "-";
          const ret = {
            show: true,
            id,
            fields: [
              enroll_start,
              name,
              type,
              sub_status,
              application,
              phase_step,
              format(stepCreatedAt, "MM/dd/yyyy @ HH:mm"),
              step_status,
              expected_date
                ? format(parseISO(expected_date), "MM/dd/yyyy")
                : "",
            ],
            canceled: canceled_at,
            page: Math.ceil((index + 1) / limit),
          };
          return ret;
        }
      );
      // console.log(gridDataValues);
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
