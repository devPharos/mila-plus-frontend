
export function hasAccessTo(accesses = null, menu_alias = 0) {
  return accesses && accesses.hierarchy && accesses.hierarchy.findIndex(access => access.alias === menu_alias) > -1
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
  `Unites States of America`,
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
