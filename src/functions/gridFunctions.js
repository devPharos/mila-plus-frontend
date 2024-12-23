export function runFilter(title, value) {
  if (value) {
    setActiveFilters([
      ...activeFilters.filter((el) => el.title != title),
      { title, value },
    ]);
  } else {
    setActiveFilters([...activeFilters.filter((el) => el.title != title)]);
  }
}
