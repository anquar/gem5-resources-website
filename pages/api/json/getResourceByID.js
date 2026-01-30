import getAllResourcesJSON from "./getAllResources";

/**
 * @function getResourceByIDJSON
 * @async
 * @description This function retrieves a resource from a JSON database based on the provided ID, database name, and version.
 * It also retrieves associated workloads that reference the resource, and returns an object containing the resource and its metadata.
 * @param {string} id - The ID of the resource to retrieve.
 * @param {string} database - The name of the JSON database.
 * @param {number} version - The version of the resource to retrieve (optional).
 * @returns {Object} - An object containing the retrieved resource and its metadata, including associated workloads and database name.
 * If the resource is not found, an error message is returned.
 */
export default async function getResourceByIDJSON(id, database, version) {
    const resources = await getAllResourcesJSON(database);

    // filter json file to find the resources that contain the query in their id
    // We need to search recursively for nested resources (e.g. in 'contents')
    const results = [];
    function findRecursive(list) {
        if (!list || !Array.isArray(list)) return;
        for (const resource of list) {
            // Check both id and name
            if ((resource.id === id) || (resource.name === id)) {
                results.push(resource);
            }
            if (resource.contents) {
                findRecursive(resource.contents);
            }
        }
    }
    findRecursive(resources);

    if (results.length === 0) {
        return { error: 'Resource not found' }
    }

    // find workloads that contain the resource id is a value in resource.resources disctionary
    let workloads = []
    for (const res of resources) {
        if (res.resources) {
            for (let r in res.resources) {
                if (res.resources[r] === id) {
                    workloads.push(res.id || res.name);
                }
            }
        }
    }

    let resource;
    if (!version) {
        resource = results[0];
        // go through the results and find most recent version
        for (let i = 0; i < results.length; i++) {
            if (results[i].resource_version && resource.resource_version &&
                results[i].resource_version > resource.resource_version) {
                resource = results[i];
            }
        }
    } else {
        for (let i = 0; i < results.length; i++) {
            if (results[i].resource_version === version) {
                resource = results[i];
            }
        }
    }
    if (!resource) {
        return { error: 'Resource not found' }
    }
    
    // Polyfill ID if missing, as frontend expects it
    if (!resource.id && resource.name) {
        resource.id = resource.name;
    }

    // Polyfill source_url if missing but source exists
    if (!resource.source_url && resource.source) {
        resource.source_url = `https://github.com/gem5/gem5-resources/tree/develop/${resource.source}`;
    }

    resource.workloads_mapping = workloads;
    resource.database = database;
    return resource;
}
