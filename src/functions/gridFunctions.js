import api from "~/services/api";

export async function getData(
  route,
  { limit, page, orderBy, setPages, search, defaultOrderBy }
) {
  try {
    const response = await api.get(
      `/${route}?limit=${limit}&page=${page}&orderBy=${
        orderBy ? orderBy.column : defaultOrderBy.column
      }&orderASC=${
        orderBy
          ? orderBy.asc
            ? "ASC"
            : "DESC"
          : defaultOrderBy.asc
          ? "ASC"
          : "DESC"
      }&search=${search}`
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
