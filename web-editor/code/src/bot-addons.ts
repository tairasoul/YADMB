import { hasResolvers, retrieveAddonProperties } from "./retrieveFormattedAddons.js"
import { AddonInfo } from "./addonTypes.js";
import * as types from "./addonTypes.js";

let addons: AddonInfo[];
function fetchAddons() {
    return new Promise<void>((resolve) => {
        if (!addons) {
            fetch(`${window.location.protocol}/get-bot-addons`)
                .then((resp) => resp.json())
                .then((json) => {
                    addons = JSON.parse(json);
                    resolve();
                });
        } else {
            resolve();
        }
    });
}


class HtmlHelper {
    parentElement: HTMLElement;
    constructor(element: HTMLElement) {
        this.parentElement = element;
    }

    createElement(tagName: string, attributes: { [key: string]: any } = {}, textContent = '') {
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

function createAddon(addon: AddonInfo) {
    const addonContainer = document.querySelector(".addons-container") as Element;
    const addonDiv = document.createElement("div");
    addonDiv.className = "addon"
    const helper = new HtmlHelper(addonDiv);
    helper.createElement("h3", {class:"addon-title"}, addon.name);
    helper.createElement("p", {class:"addon-description"}, addon.description);
    helper.createElement("p", {class:"addon-author"}, addon.credits);
    helper.createElement("p", {class:"addon-version"}, addon.version);
    helper.createElement("p", {class:"addon-type"}, addon.type);
    const resolverList = helper.createElement("ul", {class:"resolver-item"});
    const rHelper = new HtmlHelper(resolverList);
    if (hasResolvers(addon)) {
        for (const resolver of retrieveAddonProperties(addon)) {
            const li = rHelper.createElement("li", {class:"resolver-item"});
            const li_h = new HtmlHelper(li);
            li_h.createElement("strong", {class:"resolver-name"}, resolver.name);
            // @ts-ignore
            li_h.createElement("span", {class:"resolver-description"}, " - Priority: " + resolver.priority)
        }
    }
    else {
        if (addon.type === "command") {
            for (const cmd of addon.commands) {
                const li = rHelper.createElement("li", {class:"resolver-item"});
                const li_h = new HtmlHelper(li);
                li_h.createElement("strong", {class:"resolver-name"}, cmd.name);
                li_h.createElement("span", {class:"resolver-description"}, " - " + cmd.description);
            }
        }
        else if (addon.type === "pagerAddon") {
            for (const pager of addon.pagers) {
                const li = rHelper.createElement("li", {class:"resolver-item"});
                const li_h = new HtmlHelper(li);
                li_h.createElement("strong", {class:"resolver-name"}, pager.name);
                li_h.createElement("span", {class:"resolver-description"}, " - Priority: " + pager.priority)
            }
        }
    }
    if (addon.sources && addon.sources.length > 0) {
        const sourcesDiv = helper.createElement("div", {class:"addon-sources"});
        const sourcesHelper = new HtmlHelper(sourcesDiv);
        sourcesHelper.createElement("p", {}, "Sources:");
        const ul = sourcesHelper.createElement("ul", {class:"source-list"});
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
        if (addon.private) continue;
        createAddon(addon);
    }
}

renderAddons()