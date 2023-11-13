declare const _default: ({
    name: string;
    description: string;
    callback: (interaction: import("oceanic.js").CommandInteraction<import("oceanic.js").AnyInteractionChannel | import("oceanic.js").Uncached>, resolvers: import("../client.js").ResolverInformation, guild: import("../client.js").Guild, client: import("../client.js").default) => Promise<import("oceanic.js").Message<import("oceanic.js").AnyInteractionChannel | import("oceanic.js").Uncached> | undefined>;
} | {
    name: string;
    description: string;
    callback: (interaction: import("oceanic.js").CommandInteraction<import("oceanic.js").AnyInteractionChannel | import("oceanic.js").Uncached>, _resolvers: import("../client.js").ResolverInformation, guild: import("../client.js").Guild, client: import("../client.js").default) => Promise<void>;
})[];
export default _default;
