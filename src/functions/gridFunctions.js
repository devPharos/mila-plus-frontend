import api from "~/services/api";

export async function getData(
  route,
  { limit, page, orderBy, setPages, search, defaultOrderBy }
) {
  try {
    const response = await api.get(
      `/${route}?limit=${limit}&page=${page}&orderBy=${
        orderBy ? orderBy.column : defaultOrderBy.column
      }&orderASC=${orderBy && orderBy.asc ? "ASC" : "DESC"}&search=${search}`
    );
    let pages = Math.ceil(response.data.length / limit);
    setPages(pages);
    return response.data;
  } catch (err) {
    console.log(err);
    return null;
  }
}
