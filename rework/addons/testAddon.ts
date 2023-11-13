import { addon } from "../addonLoader.js";

const TestAddon: addon = {
    name: "TestAddon",
    description: "a test addon",
    credits: "tairasoul",
    version: "1.0.0",
    type: "songResolver",
    resolvers: [
        {
            name: "testResolver",
            regexMatches: [
                /https:\/\/*.youtube.com\/watch?v=*/
            ],
            resolve: async (url) => {
                return url;
            }
        }
    ]
}

export default TestAddon;