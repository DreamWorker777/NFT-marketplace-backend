export const paginateArray = (array, perPage, page) => array.slice((page - 1) * perPage, page * perPage)

export const sortCompare = key => (a, b) => {
    const fieldA = a[key]
    const fieldB = b[key]

    let comparison = 0
    if (fieldA > fieldB) {
        comparison = 1
    } else if (fieldA < fieldB) {
        comparison = -1
    }
    return comparison
}