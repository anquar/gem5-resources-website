import getAllResourcesJSON from "./getAllResources";

/**
 * @helper
 * @async
 * @description Gets the filters from the JSON file. It gets the unique values for columns.
 * @returns {json} A json object with the filters.
*/
export default async function getFiltersJSON(database) {
    const resources = await getAllResourcesJSON(database);
    
    // get unique categories from resources
    // Filter out null/undefined values
    let categories = [...new Set(resources.map(resource => resource.category).filter(c => c))];
    let architectures = [...new Set(resources.map(resource => resource.architecture).filter(a => a))];

    let versions = new Set();
    for (const resource of resources) {
        if (resource.gem5_versions && Array.isArray(resource.gem5_versions)) {
            resource.gem5_versions.forEach(v => versions.add(v));
        }
    }

    return {
        category: categories,
        architecture: architectures,
        gem5_versions: Array.from(versions)
    };
}
