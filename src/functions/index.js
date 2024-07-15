import { useContext } from "react";
import { useLocation } from "react-router-dom";
import { PageContext } from "~/App";
import api from "~/services/api";

export function hasAccessTo(accesses = null, menu_alias = null) {
  const defaultFalse = { view: false, edit: false, create: false, inactivate: false };
  if (!accesses || !accesses.hierarchy || !menu_alias) {
    return defaultFalse
  }

  const current = accesses.hierarchy.filter(access => access.alias === menu_alias)[0];

  if (!current || !current.MenuHierarchyXGroup) {
    return defaultFalse;
  }

  const { view, edit, create, inactivate } = current.MenuHierarchyXGroup;
  return { view, edit, create, inactivate };
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
  `Zimbabwe`
]

export function applyFilters(activeFilters, gridData, gridHeader, orderBy, setGridData) {

  const search = activeFilters.filter(el => el.title === 'search');
  const filters = activeFilters.filter(el => el.title !== 'search');

  const newData = gridData.map((line) => {
    line.show = true;
    filters.forEach(filter => {
      const fieldPos = gridHeader.findIndex((el) => el.title === filter.title);
      if (fieldPos > -1) {
        if (Array.isArray(filter.value)) {
          console.log(typeof filter.value)
        } else if (typeof filter.value === 'boolean') {
          console.log(line.fields[fieldPos].toString(), filter.value.toString())
          if (line.fields[fieldPos].toString().search(filter.value.toString()) === -1) {
            line.show = false;
          }
        } else {
          if (!line.fields[fieldPos] || line.fields[fieldPos].toUpperCase().search(filter.value.toUpperCase()) === -1) {
            line.show = false;
          }
        }
      }
    })

    if (search.length > 0 && line.show) {
      line.show = false;
      line.fields.map((field) => {
        if (typeof field === 'boolean') {
          // console.log(line.fields[fieldPos].toString(), filter.value.toString())
          // if (line.fields[fieldPos].toString().search(filter.value.toString()) === -1) {
          //   line.show = false;
          // }
        } else {
          if (field && field.toUpperCase().search(search[0].value.toUpperCase()) > -1) {
            line.show = true;
          }
        }
      })
    }


    return line
  })

  if (orderBy.column) {
    const fieldPos = gridHeader.findIndex((el) => el.title === orderBy.column);
    newData.sort((a, b) => orderBy.asc ? a.fields[fieldPos] > b.fields[fieldPos] : a.fields[fieldPos] < b.fields[fieldPos])
  }

  setGridData(newData)

}

export async function getRegistries({ canceled_by = null, canceled_at = null, updated_by = null, updated_at = null, created_by = null, created_at = null }) {
  // console.log({ created_by, created_at, updated_by, updated_at, canceled_by, canceled_at })
  let registryBy = null;
  let registryAt = null;
  let registryStatus = null;
  if (canceled_by) {
    const { data: userRet } = await api.get(`users_short_info/${canceled_by}`)
    registryBy = userRet.name
    registryAt = canceled_at;
    registryStatus = 'Canceled';
  } else if (updated_by) {
    const { data: userRet } = await api.get(`users_short_info/${updated_by}`)
    registryBy = userRet.name
    registryAt = updated_at;
    registryStatus = 'Updated';
  } else if (created_by) {
    const { data: userRet } = await api.get(`users_short_info/${created_by}`)
    registryBy = userRet.name
    registryAt = created_at;
    registryStatus = 'Created';
  }
  return { registryBy, registryAt, registryStatus }
}

export function handleUpdatedFields(data, pageData) {
  const dataInArray = Object.keys(data).map((key) => [key, data[key]])
  const pageDataInArray = Object.keys(pageData).map((key) => [key, pageData[key]]);

  return dataInArray.filter((field) => {
    const x = field[1] === 'Yes' ? true : field[1] === 'No' ? false : field[1];
    const y = pageDataInArray.filter(filialField => filialField[0] === field[0])[1];

    if (x != y && (x || y)) {
      return field;
    }
  })

}

export function getCurrentPage() {
  const { pages } = useContext(PageContext)
  const { pathname } = useLocation();
  const paths = pathname.substring(1).split('/');
  const currentModule = pages.filter(module => module.name === paths[0])[0];
  const currentPage = currentModule.children.filter(page => page.path === pathname)[0];
  return currentPage
}
