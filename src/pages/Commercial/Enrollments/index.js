import React, { useContext, useEffect } from "react";
import PagePreview from "./Preview";
import { useSelector } from "react-redux";
import { getData } from "~/functions/gridFunctions";
import PageContainer from "~/components/PageContainer";
import { FullGridContext } from "..";
import { format, parseISO } from "date-fns";

export default function CommercialEnrollments() {
  const filial = useSelector((state) => state.auth.filial);
  const defaultOrderBy = { column: "name", asc: true };
  const defaultGridHeader = [
    {
      title: "Enroll. Start",
      type: "text",
      filter: false,
    },
    {
      title: "Prospect",
      type: "text",
      filter: true,
    },
    {
      title: "Type",
      type: "text",
      filter: true,
    },
    {
      title: "Sub Status",
      type: "text",
      filter: true,
    },
    {
      title: "Application",
      type: "text",
      filter: true,
    },
    {
      title: "Phase Step",
      type: "text",
      filter: false,
    },
    {
      title: "Step Date",
      type: "text",
      filter: false,
    },
    {
      title: "Step Status",
      type: "text",
      filter: false,
    },
    {
      title: "Expected Date",
      type: "text",
      filter: false,
    },
  ];

  const { opened, orderBy, setGridData, page, setPages, limit, search } =
    useContext(FullGridContext);

  useEffect(() => {
    async function loader() {
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
              expected_date &&
              expected_date <= format(new Date(), "yyyyMMdd") ? (
                <div className="flex flex-row gap-2 items-center text-red-500">
                  {exptected} <History size={12} color="#f00" />
                </div>
              ) : (
                exptected
              ),
            ],
            canceled: canceled_at,
            page: Math.ceil((index + 1) / limit),
          };
          return ret;
        }
      );
      setGridData(gridDataValues);
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
