import { useContext } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { PageContext } from "~/App";
import api from "~/services/api";

export function today() {
  const date = new Date();
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

export function hasAccessTo(
  accesses = {
    children: null,
    hierarchy: null,
  },
  main_menu = null,
  menu_alias = null
) {
  const defaultFalse = {
    view: false,
    edit: false,
    create: false,
    inactivate: false,
  };
  if (!accesses || !menu_alias) {
    return defaultFalse;
  }

  if (accesses.children) {
    accesses = { ...accesses, hierarchy: accesses.children };
  }
  if (!accesses.hierarchy) {
    return defaultFalse;
  }

  let current = null;
  if (main_menu) {
    current = accesses.hierarchy
      .find((access) => access.alias === main_menu.toLowerCase())
      .children.find((access) => access.alias === menu_alias);
  } else {
    current = accesses.hierarchy.find((access) => access.alias === menu_alias);
  }

  if (!current || !current.MenuHierarchyXGroup) {
    return defaultFalse;
  }

  const { view, edit, create, inactivate } = current.MenuHierarchyXGroup;
  return { view, edit, create, inactivate };
}

export function getTabsPermissions(pageAlias = "", FullGridContext = null) {
  const { accessModule } = useContext(FullGridContext);

  const pageAccess = accessModule?.children?.find(
    (el) => el.alias === pageAlias
  );

  let tabsPermissions = null;

  if (!pageAccess) {
    return null;
  }
  if (pageAccess && pageAccess.children) {
    tabsPermissions = pageAccess.children.filter((el) =>
      el.alias.includes("-tab")
    );
  }
  return tabsPermissions;
}

export function tabAllowed(tabsPermissions = null, tabAlias = "") {
  if (!tabsPermissions || !tabAlias) {
    return false;
  }
  return tabsPermissions.find((el) => el.alias === tabAlias);
}

export function getCurrentPage() {
  const { signed } = useSelector((state) => state.auth);
  const { pages } = useContext(PageContext);
  const { pathname } = useLocation();
  const paths = pathname.substring(1).split("/");
  let currentModule = null;
  if (signed) {
    currentModule = pages.filter(
      (module) => module.name.toUpperCase() === paths[0].toUpperCase()
    )[0];
  } else {
    currentModule = pages[pages.length - 1];
  }
  let currentPage = null;
  if (currentModule) {
    currentPage = currentModule?.children?.filter(
      (page) =>
        page.path.toUpperCase() ===
        "/" + paths[0].toUpperCase() + "/" + paths[1].toUpperCase()
    )[0];
    if (currentPage?.children) {
      if (pathname.split("/").length === 4) {
        currentPage = currentPage?.children.filter(
          (page) =>
            page.path.toUpperCase() ===
            "/" +
              paths[0].toUpperCase() +
              "/" +
              paths[1].toUpperCase() +
              "/" +
              paths[2].toUpperCase()
        )[0];
      }
    }
  }
  return currentPage;
}

export const countries_list = [
  `Afghanistan`,
  `Albania`,
  `Algeria`,
  `Andorra`,
  `Angola`,
  `Antigua and Barbuda`,
  `Argentina`,
  `Armenia`,
  `Australia`,
  `Austria`,
  `Azerbaijan`,
  `Bahamas`,
  `Bahrain`,
  `Bangladesh`,
  `Barbados`,
  `Belarus`,
  `Belgium`,
  `Belize`,
  `Benin`,
  `Bhutan`,
  `Bolivia`,
  `Bosnia and Herzegovina`,
  `Botswana`,
  `Brazil`,
  `Brunei`,
  `Bulgaria`,
  `Burkina Faso`,
  `Burundi`,
  `Côte d'Ivoire`,
  `Cabo Verde`,
  `Cambodia`,
  `Cameroon`,
  `Canada`,
  `Central African Republic`,
  `Chad`,
  `Chile`,
  `China`,
  `Colombia`,
  `Comoros`,
  `Congo (Congo-Brazzaville)`,
  `Costa Rica`,
  `Croatia`,
  `Cuba`,
  `Cyprus`,
  `Czechia (Czech Republic)`,
  `Democratic Republic of the Congo`,
  `Denmark`,
  `Djibouti`,
  `Dominica`,
  `Dominican Republic`,
  `Ecuador`,
  `Egypt`,
  `El Salvador`,
  `Equatorial Guinea`,
  `Eritrea`,
  `Estonia`,
  `Eswatini (fmr. "Swaziland")`,
  `Ethiopia`,
  `Fiji`,
  `Finland`,
  `France`,
  `Gabon`,
  `Gambia`,
  `Georgia`,
  `Germany`,
  `Ghana`,
  `Greece`,
  `Grenada`,
  `Guatemala`,
  `Guinea`,
  `Guinea-Bissau`,
  `Guyana`,
  `Haiti`,
  `Holy See`,
  `Honduras`,
  `Hungary`,
  `Iceland`,
  `India`,
  `Indonesia`,
  `Iran`,
  `Iraq`,
  `Ireland`,
  `Israel`,
  `Italy`,
  `Jamaica`,
  `Japan`,
  `Jordan`,
  `Kazakhstan`,
  `Kenya`,
  `Kiribati`,
  `Kuwait`,
  `Kyrgyzstan`,
  `Laos`,
  `Latvia`,
  `Lebanon`,
  `Lesotho`,
  `Liberia`,
  `Libya`,
  `Liechtenstein`,
  `Lithuania`,
  `Luxembourg`,
  `Madagascar`,
  `Malawi`,
  `Malaysia`,
  `Maldives`,
  `Mali`,
  `Malta`,
  `Marshall Islands`,
  `Mauritania`,
  `Mauritius`,
  `Mexico`,
  `Micronesia`,
  `Moldova`,
  `Monaco`,
  `Mongolia`,
  `Montenegro`,
  `Morocco`,
  `Mozambique`,
  `Myanmar (formerly Burma)`,
  `Namibia`,
  `Nauru`,
  `Nepal`,
  `Netherlands`,
  `New Zealand`,
  `Nicaragua`,
  `Niger`,
  `Nigeria`,
  `North Korea`,
  `North Macedonia`,
  `Norway`,
  `Oman`,
  `Pakistan`,
  `Palau`,
  `Palestine State`,
  `Panama`,
  `Papua New Guinea`,
  `Paraguay`,
  `Peru`,
  `Philippines`,
  `Poland`,
  `Portugal`,
  `Qatar`,
  `Romania`,
  `Russia`,
  `Rwanda`,
  `Saint Kitts and Nevis`,
  `Saint Lucia`,
  `Saint Vincent and the Grenadines`,
  `Samoa`,
  `San Marino`,
  `Sao Tome and Principe`,
  `Saudi Arabia`,
  `Senegal`,
  `Serbia`,
  `Seychelles`,
  `Sierra Leone`,
  `Singapore`,
  `Slovakia`,
  `Slovenia`,
  `Solomon Islands`,
  `Somalia`,
  `South Africa`,
  `South Korea`,
  `South Sudan`,
  `Spain`,
  `Sri Lanka`,
  `Sudan`,
  `Suriname`,
  `Sweden`,
  `Switzerland`,
  `Syria`,
  `Tajikistan`,
  `Tanzania`,
  `Thailand`,
  `Timor-Leste`,
  `Togo`,
  `Tonga`,
  `Trinidad and Tobago`,
  `Tunisia`,
  `Turkey`,
  `Turkmenistan`,
  `Tuvalu`,
  `Uganda`,
  `Ukraine`,
  `United Arab Emirates`,
  `United Kingdom`,
  `United States of America`,
  `Uruguay`,
  `Uzbekistan`,
  `Vanuatu`,
  `Venezuela`,
  `Vietnam`,
  `Yemen`,
  `Zambia`,
  `Zimbabwe`,
];

export function applyFilters(
  activeFilters = [],
  gridData = [],
  gridHeader = [],
  orderBy = null,
  setGridData = () => null
) {
  const search = activeFilters.filter((el) => el.title === "search");
  const filters = activeFilters.filter((el) => el.title !== "search");

  const newData = gridData.map((line) => {
    line.show = true;
    filters.forEach((filter) => {
      const fieldPos = gridHeader.findIndex((el) => el.title === filter.title);
      if (fieldPos > -1) {
        if (Array.isArray(filter.value)) {
        } else if (typeof filter.value === "boolean") {
          if (
            line.fields &&
            line.fields[fieldPos].toString().search(filter.value.toString()) ===
              -1
          ) {
            line.show = false;
          }
        } else {
          if (
            (line.fields && !line.fields[fieldPos]) ||
            (line.fields &&
              line.fields[fieldPos].toUpperCase() !==
                filter.value.toUpperCase())
          ) {
            line.show = false;
          }
        }
      }
    });

    if (search.length > 0 && line.show) {
      line.show = false;
      line.fields.map((field) => {
        if (typeof field === "boolean") {
          // console.log(line.fields[fieldPos].toString(), filter.value.toString())
          // if (line.fields[fieldPos].toString().search(filter.value.toString()) === -1) {
          //   line.show = false;
          // }
        } else {
          if (
            field &&
            field.toUpperCase().search(search[0].value.toUpperCase()) > -1
          ) {
            line.show = true;
          }
        }
      });
    }

    return line;
  });

  if (orderBy && orderBy.column) {
    const fieldPos = gridHeader.findIndex((el) => el.title === orderBy.column);
    newData.sort((a, b) =>
      orderBy.asc
        ? a.fields[fieldPos] > b.fields[fieldPos]
        : a.fields[fieldPos] < b.fields[fieldPos]
    );
  }

  setGridData(newData);
}

export async function getRegistries({
  canceled_by = null,
  canceled_at = null,
  updated_by = null,
  updated_at = null,
  created_by = null,
  created_at = null,
}) {
  // console.log({ created_by, created_at, updated_by, updated_at, canceled_by, canceled_at })
  let registryBy = null;
  let registryAt = null;
  let registryStatus = null;
  if (canceled_by) {
    const { data: userRet } = await api.get(`users_short_info/${canceled_by}`);
    registryBy = userRet.name;
    registryAt = canceled_at;
    registryStatus = "Canceled";
  } else if (updated_by) {
    const { data: userRet } = await api.get(`users_short_info/${updated_by}`);
    registryBy = userRet.name;
    registryAt = updated_at;
    registryStatus = "Updated";
  } else if (created_by) {
    const { data: userRet } = await api.get(`users_short_info/${created_by}`);
    registryBy = userRet.name;
    registryAt = created_at;
    registryStatus = "Created";
  }
  return { registryBy, registryAt, registryStatus };
}

export function handleUpdatedFields(data, pageData) {
  const dataInArray = Object.keys(data).map((key) => [key, data[key]]);
  const pageDataInArray = Object.keys(pageData).map((key) => [
    key,
    pageData[key],
  ]);

  return (
    dataInArray &&
    dataInArray.filter((field) => {
      let x =
        field[1] === "Yes" || field[1] === "true"
          ? true
          : field[1] === "No" || field[1] === "false"
          ? false
          : field[1];
      const y =
        pageDataInArray.length > 0 &&
        pageDataInArray.find((pageField) => pageField[0] === field[0])
          ? pageDataInArray.find((pageField) => pageField[0] === field[0])[1]
          : null;

      if (typeof y === "number") {
        x = parseFloat(field[1]);
      }

      if (field[0] === "file_id") {
        return field;
      }

      if ((x != y && (x || y)) || typeof y === "boolean") {
        field[1] = x;
        return field;
      }
    })
  );
}

export const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",

  // These options can be used to round to whole numbers.
  // trailingZeroDisplay: 'stripIfInteger' // This is probably what most people
  // want. It will only stop printing
  // the fraction when the input
  // amount is a round number (int)
  // already. If that's not what you
  // need, have a look at the options
  // below.
  minimumFractionDigits: 0, // This suffices for whole numbers, but will
  // print 2500.10 as $2,500.1
  maximumFractionDigits: 2, // Causes 2500.99 to be printed as $2,501
});

export function capitalizeFirstLetter(val) {
  let vals = String(val).split(" ");
  vals.forEach((v, i) => {
    vals[i] = v.charAt(0).toUpperCase() + v.slice(1).toLowerCase();
  });

  return vals.join(" ");
}

export async function getPriceLists({
  filial_id = null,
  processsubstatus_id = null,
}) {
  let priceLists = null;
  let discountLists = null;

  if (!filial_id || !processsubstatus_id) {
    return { priceLists: null, discountLists: null };
  }

  await api.get(`filials/${filial_id}`).then(({ data }) => {
    priceLists = data.pricelists.find(
      (price) => price.processsubstatus_id === processsubstatus_id
    );
    discountLists = data.discountlists.filter((discount) => {
      if (discount.active) {
        return discount;
      }
    });
  });
  return { priceLists, discountLists };
}
