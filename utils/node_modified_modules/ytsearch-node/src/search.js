const axios = require('axios');

/**
 * Search for YouTube videos by query string.
 *
 * @param {string} query - The search query string.
 * @param {string} ogq - The original search query string (used for error messages).
 * @returns {array} - An array of video data objects.
 * @throws {Error} - If no results are found for the search query.
 */
const search = async (query, ogq) => {
  const base = 'https://www.youtube.com/results';

  const options = {
    app: 'desktop',
    search_query: query
  };

  try {
    const response = await axios.get(base, { params: options });
    const html = response.data;

    // Parse the initial data object from the HTML response
    const findInitialData = html.match(/var ytInitialData = {(.*?)};/g)[0];
    const fixData = findInitialData.replace(/var ytInitialData = /g, '');
    const initialData = JSON.parse(fixData.slice(0, -1));

    // Find the array of video data objects in the initial data object
    let data = initialData.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents;
    let index, confirm = false;
    for (let i = 0; i < data.length; i++) {
      if (confirm) break;
      if (data[i].hasOwnProperty('itemSectionRenderer')) {
        for (let j = 0; j < data[i].itemSectionRenderer.contents.length; j++) {
          if (data[i].itemSectionRenderer.contents[j].hasOwnProperty('videoRenderer')) {
            index = i;
            confirm = true;
            break;
          }
        }
      }
    }

    // If video data objects were found, return them. Otherwise, throw an error.
    if (typeof data[index] === 'object' && data[index].hasOwnProperty('itemSectionRenderer')) {
      data = data[index].itemSectionRenderer.contents;
      return data;
    } else {
      throw new Error(`No results were found for search query '${ogq}'.`);
    }
  } catch (error) {
    throw new Error(`Error searching for query '${ogq}': ${error.message}`);
  }
};

module.exports = search;
