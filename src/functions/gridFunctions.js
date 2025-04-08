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
      column: "created_at",
      asc: true,
    },
  }
) {
  try {
    let orderFix = defaultOrderBy.column;
    if (orderBy && page === orderBy.page) {
      orderFix = orderBy.column;
    } else if (orderBy && orderBy.page) {
      setOrderBy(null);
      setSearch(null);
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
      }&search=${search}&type=${type}`
    );
    if (response.data.rows) {
      let pages = Math.ceil(response.data.totalRows / limit);
      if (response.data.totalRows === 0) {
        setPages(1);
      } else {
        setPages(pages);
      }
      return response.data.rows;
    } else {
      let pages = Math.ceil(response.data.length / limit);
      if (response.data.length === 0) {
        setPages(1);
      } else {
        setPages(pages);
      }
      return response.data;
    }
  } catch (err) {
    console.log(err);
    return null;
  }
}
