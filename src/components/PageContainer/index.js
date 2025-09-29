import React, { useContext, useEffect } from "react";
import PageHeader from "../PageHeader";
import Breadcrumbs from "../Breadcrumbs";
import FiltersBar from "../FiltersBar";
import { Filter, Loader } from "lucide-react";
import Filters from "../Filters";
import Grid from "../Grid";
import PreviewController from "../PreviewController";
import { applyFilters, getCurrentPage, hasAccessTo } from "~/functions";
import { useSelector } from "react-redux";
import FormLoading from "../RegisterForm/FormLoading";

// import { Container } from './styles';

function PageContainer({
  pageAccess = null,
  FullGridContext = null,
  PagePreview = null,
  defaultGridHeader = [],
  selection = null,
  handleNew = true,
  handleEdit = true,
  Excel = null,
}) {
  const accesses = useSelector((state) => state.auth.accesses);
  const currentPage = getCurrentPage();
  const {
    opened,
    setOpened,
    activeFilters,
    gridData,
    gridHeader,
    setGridHeader,
    orderBy,
    setGridData,
    loadingData,
  } = useContext(FullGridContext);

  if (!pageAccess) {
    pageAccess = hasAccessTo(
      accesses,
      currentPage.path.split("/")[1],
      currentPage.alias
    );
  }

  useEffect(() => {
    if (gridData && gridHeader) {
      applyFilters(activeFilters, gridData, gridHeader, orderBy, setGridData);
    }
  }, [activeFilters]);

  useEffect(() => {
    setGridHeader(defaultGridHeader);
  }, []);

  return (
    <div className="h-full bg-white flex flex-1 flex-col justify-start items-start rounded-tr-2xl px-4">
      <PageHeader>
        <Breadcrumbs currentPage={currentPage} />
        {/* <FiltersBar>
          <Filter size={14} /> Custom Filters
        </FiltersBar> */}
      </PageHeader>
      <Filters
        access={pageAccess}
        Context={FullGridContext}
        handleNew={handleNew ? () => setOpened("new") : null}
        selection={selection}
        Excel={Excel}
      />

      {loadingData ? (
        <FormLoading />
      ) : (
        <Grid
          Context={FullGridContext}
          selection={selection}
          handleEdit={handleEdit}
        >
          {opened && (
            <PreviewController Context={FullGridContext}>
              <PagePreview
                access={pageAccess}
                id={opened}
                defaultFormType="full"
                Context={FullGridContext}
              />
            </PreviewController>
          )}
          {selection &&
            selection.functions &&
            selection.functions.map((func, index) => {
              if (func.fun === null) return null;
              return (
                <PreviewController key={index} Context={FullGridContext}>
                  {func.opened && (
                    <func.Page
                      access={pageAccess}
                      selected={selection.selected}
                      defaultFormType="full"
                      handleOpened={func.fun}
                    />
                  )}
                </PreviewController>
              );
            })}
        </Grid>
      )}
    </div>
  );
}

export default PageContainer;
