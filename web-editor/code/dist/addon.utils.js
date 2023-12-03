export default class AddonUtils {
    info = [];
    constructor(info) {
        this.info = info.sort((a, b) => b.priority - a.priority);
    }
    async getAvailableResolvers(url) {
        const resolvers = [];
        for (const addon of this.info) {
            for (const resolver of addon.resolvers) {
                if (await resolver.available(url))
                    resolvers.push(resolver);
            }
        }
        return resolvers;
    }
}
