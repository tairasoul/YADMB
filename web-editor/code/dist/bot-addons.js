import { hasResolvers } from "./retrieveFormattedAddons.js";
let addons;
function fetchAddons() {
    return new Promise((resolve) => {
        if (!addons) {
            fetch(`${window.location.protocol}/get-bot-addons`)
                .then((resp) => resp.json())
                .then((json) => {
                addons = JSON.parse(json);
                resolve();
            });
        }
        else {
            resolve();
        }
    });
}
class HtmlHelper {
    parentElement;
    constructor(element) {
        this.parentElement = element;
    }
    createElement(tagName, attributes = {}, textContent = '') {
        const element = document.createElement(tagName);
        // Set attributes
        for (const key in attributes) {
            element.setAttribute(key, attributes[key]);
        }
        // Set text content
        if (textContent) {
            element.textContent = textContent;
        }
        // Append to parent element
        this.parentElement.appendChild(element);
        return element;
    }
}
function createAddon(addon) {
    const addonContainer = document.querySelector(".addons-container");
    const addonDiv = document.createElement("div");
    addonDiv.className = "addon";
    const helper = new HtmlHelper(addonDiv);
    helper.createElement("h3", { class: "addon-title" }, addon.name);
    helper.createElement("p", { class: "addon-description" }, addon.description);
    helper.createElement("p", { class: "addon-author" }, addon.credits);
    helper.createElement("p", { class: "addon-version" }, addon.version);
    const resolverList = helper.createElement("ul", { class: "resolver-item" });
    const rHelper = new HtmlHelper(resolverList);
    if (hasResolvers(addon)) {
        const data = addon.data.resolvers;
        for (const resolver of data.audio ?? []) {
            const li = rHelper.createElement("li", { class: "resolver-item" });
            const li_h = new HtmlHelper(li);
            li_h.createElement("strong", { class: "resolver-name" }, resolver.name);
            const li2 = new HtmlHelper(li_h.createElement("li", { class: "resolver-info" }));
            // @ts-ignore
            li2.createElement("span", { class: "resolver-description" }, "Priority: " + resolver.priority);
            const li3 = new HtmlHelper(li_h.createElement("li", { class: "resolver-info" }));
            li3.createElement("strong", { class: "resolver-type" }, "Type: Audio Resolver");
        }
        for (const resolver of data.pager ?? []) {
            const li = rHelper.createElement("li", { class: "resolver-item" });
            const li_h = new HtmlHelper(li);
            li_h.createElement("strong", { class: "resolver-name" }, resolver.name);
            const li2 = new HtmlHelper(li_h.createElement("li", { class: "resolver-info" }));
            // @ts-ignore
            li2.createElement("span", { class: "resolver-description" }, "Priority: " + resolver.priority);
            const li3 = new HtmlHelper(li_h.createElement("li", { class: "resolver-info" }));
            li3.createElement("strong", { class: "resolver-type" }, "Type: Data Pager");
        }
        for (const resolver of data.playlist ?? []) {
            const li = rHelper.createElement("li", { class: "resolver-item" });
            const li_h = new HtmlHelper(li);
            li_h.createElement("strong", { class: "resolver-name" }, resolver.name);
            const li2 = new HtmlHelper(li_h.createElement("li", { class: "resolver-info" }));
            // @ts-ignore
            li2.createElement("span", { class: "resolver-description" }, "Priority: " + resolver.priority);
            const li3 = new HtmlHelper(li_h.createElement("li", { class: "resolver-info" }));
            li3.createElement("strong", { class: "resolver-type" }, "Type: Playlist Resolver");
        }
        for (const resolver of data.provider ?? []) {
            const li = rHelper.createElement("li", { class: "resolver-item" });
            const li_h = new HtmlHelper(li);
            li_h.createElement("strong", { class: "resolver-name" }, resolver.name);
            const li2 = new HtmlHelper(li_h.createElement("li", { class: "resolver-info" }));
            // @ts-ignore
            li2.createElement("span", { class: "resolver-description" }, "Priority: " + resolver.priority);
            const li3 = new HtmlHelper(li_h.createElement("li", { class: "resolver-info" }));
            li3.createElement("strong", { class: "resolver-type" }, "Type: Provider Resolver");
        }
        for (const resolver of data.songData ?? []) {
            const li = rHelper.createElement("li", { class: "resolver-item" });
            const li_h = new HtmlHelper(li);
            li_h.createElement("strong", { class: "resolver-name" }, resolver.name);
            const li2 = new HtmlHelper(li_h.createElement("li", { class: "resolver-info" }));
            // @ts-ignore
            li2.createElement("span", { class: "resolver-description" }, "Priority: " + resolver.priority);
            const li3 = new HtmlHelper(li_h.createElement("li", { class: "resolver-info" }));
            li3.createElement("strong", { class: "resolver-type" }, "Type: Song Resolver");
        }
        for (const resolver of data.thumbnail ?? []) {
            const li = rHelper.createElement("li", { class: "resolver-item" });
            const li_h = new HtmlHelper(li);
            li_h.createElement("strong", { class: "resolver-name" }, resolver.name);
            const li2 = new HtmlHelper(li_h.createElement("li", { class: "resolver-info" }));
            // @ts-ignore
            li2.createElement("span", { class: "resolver-description" }, "Priority: " + resolver.priority);
            const li3 = new HtmlHelper(li_h.createElement("li", { class: "resolver-info" }));
            li3.createElement("strong", { class: "resolver-type" }, "Type: Thumbnail Resolver");
        }
        /*for (const resolver of retrieveAddonProperties(addon)) {
            const li = rHelper.createElement("li", {class:"resolver-item"});
            const li_h = new HtmlHelper(li);
            li_h.createElement("strong", {class:"resolver-name"}, resolver.name);
            // @ts-ignore
            li_h.createElement("span", {class:"resolver-description"}, " - Priority: " + resolver.priority)
        }*/
    }
    if (addon.data.commands) {
        for (const cmd of addon.data.commands ?? []) {
            const li = rHelper.createElement("li", { class: "resolver-item" });
            const li_h = new HtmlHelper(li);
            li_h.createElement("strong", { class: "resolver-name" }, cmd.name);
            li_h.createElement("span", { class: "resolver-description" }, " - " + cmd.description);
        }
    }
    if (addon.sources && addon.sources.length > 0) {
        const sourcesDiv = helper.createElement("div", { class: "addon-sources" });
        const sourcesHelper = new HtmlHelper(sourcesDiv);
        sourcesHelper.createElement("p", {}, "Sources:");
        const ul = sourcesHelper.createElement("ul", { class: "source-list" });
        for (const source of addon.sources) {
            const ul_h = new HtmlHelper(ul);
            ul_h.createElement("a", {
                class: "source-item",
                href: source,
                target: "_blank", // Open link in a new tab
                rel: "noopener noreferrer", // Recommended for security reasons
            }, source);
        }
    }
    addonContainer.appendChild(helper.parentElement);
}
async function renderAddons() {
    await fetchAddons(); // Wait for addons to be fetched
    for (const addon of addons) {
        if (addon.private)
            continue;
        createAddon(addon);
    }
}
renderAddons();
