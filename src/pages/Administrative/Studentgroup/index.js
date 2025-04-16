import React, { useContext, useEffect, useState } from "react";
import PagePreview from "./Preview";
import { useSelector } from "react-redux";
import { FullGridContext } from "..";
import { getData } from "~/functions/gridFunctions";
import PageContainer from "~/components/PageContainer";
import { AlertContext } from "~/App";
import { toast } from "react-toastify";
import api from "~/services/api";
import { format, parseISO } from "date-fns";

export default function Studentgroups() {
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
      title: "Status",
      name: "status",
      type: "text",
      filter: true,
    },
    {
      title: "Private",
      name: "private",
      type: "boolean",
      filter: true,
    },
    {
      title: "Program Category",
      name: "programcategory_name",
      type: "text",
      filter: false,
    },
    {
      title: "Language Mode",
      name: "languagemode_name",
      type: "text",
      filter: false,
    },
    {
      title: "Classroom",
      name: "classroom_name",
      type: "text",
      filter: false,
    },
    {
      title: "Workload",
      name: "workload_name",
      type: "text",
      filter: false,
    },
    {
      title: "Staff",
      name: "staff_name",
      type: "text",
      filter: false,
    },
    {
      title: "Students in Group",
      name: "students",
      type: "integer",
      filter: false,
    },
    {
      title: "Start Date",
      name: "start_date",
      type: "date",
      filter: false,
    },
    {
      title: "End Date",
      name: "end_date",
      type: "date",
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

  async function loader() {
    setLoadingData(true);
    const data = await getData("studentgroups", {
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
          status,
          private: privateStatus,
          programcategory,
          languagemode,
          classroom,
          workload,
          staff,
          students,
          start_date,
          end_date,
          canceled_at,
        },
        index
      ) => {
        const { class_number: classroom_name } = classroom;
        const { name: workload_name } = workload;
        const { name: staff_name } = staff;
        const { name: programcategory_name } = programcategory;
        const { name: languagemode_name } = languagemode;

        const ret = {
          show: true,
          id,
          fields: [
            name,
            status,
            privateStatus,
            programcategory_name,
            languagemode_name,
            classroom_name,
            workload_name,
            staff_name,
            students.length,
            format(parseISO(start_date), "MM/dd/yyyy"),
            format(parseISO(end_date), "MM/dd/yyyy"),
          ],
          selectable: true,
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
  }, [opened, filial, orderBy, search, limit]);

  return (
    <PageContainer
      FullGridContext={FullGridContext}
      PagePreview={PagePreview}
      defaultGridHeader={defaultGridHeader}
    />
  );
}
