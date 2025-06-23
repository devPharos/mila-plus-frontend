import api from "~/services/api";

export async function getData(
  route,
  {
    limit = 50,
    page = 1,
    orderBy = null,
    setOrderBy = () => null,
    setPages = () => null,
    search = null,
    setSearch = () => null,
    type = null,
    defaultOrderBy = {
      column: null,
      asc: true,
    },
    setTotalRows = () => null,
    setGridDetails = () => null,
    pathname = null,
  }
) {
  try {
    let orderFix = defaultOrderBy.column;
    if (orderBy && page === orderBy.page) {
      orderFix = orderBy.column;
    } else if (orderBy && orderBy.page) {
      // setOrderBy(null);
      // setSearch(null);
    }
    const response = await api.get(
      `/${route}?limit=${limit}&page=${page}&orderBy=${orderFix}&orderASC=${
        orderBy
          ? orderBy.asc
            ? "ASC"
            : "DESC"
          : defaultOrderBy.asc
          ? "ASC"
          : "DESC"
      }&search=${search ? search.value : ""}&type=${type}`
    );
    let pages = Math.ceil(response.data.totalRows / limit);
    if (response.data.totalRows === 0) {
      setPages(1);
    } else {
      setPages(pages);
    }
    setGridDetails({
      totalRows: response.data.totalRows,
      pages: pages || 1,
    });
    console.log(route, {
      totalRows: response.data.totalRows,
      pages: pages || 1,
    });
    setTotalRows(response.data.totalRows);
    return response.data.rows;
  } catch (err) {
    console.log(err);
    return null;
  }
}
