import getAllResourcesJSON from "./getAllResources";
import compareVersions from "../compareVersions";

/**
 * @function getVersionsByIDJSON
 * @async
 * @description This function retrieves an array of resource objects with different versions from a JSON database based on the provided ID and database name.
 * The retrieved resources are sorted by their resource version in descending order.
 * @param {string} id - The ID of the resource to retrieve different versions for.
 * @param {string} database - The name of the JSON database.
 * @returns {Array<Object>} - An array of resource objects, each representing a different version of the resource, sorted by resource version in descending order.
 * If the resource is not found, an error message is returned.
 */
export default async function getVersionsByIDJSON(id, database) {
    const resources = await getAllResourcesJSON(database);
    
    // We need to search recursively for nested resources
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
    results.forEach((result) => {
        result.database = database;
        // Polyfill ID if missing
        if (!result.id && result.name) {
            result.id = result.name;
        }
    });
    
    // Sort only if versions exist. If no version, treat as 0.0.0 or similar to avoid crash.
    results.sort((a, b) => -compareVersions(a.resource_version || '0.0.0', b.resource_version || '0.0.0'));
    
    return results;
}
