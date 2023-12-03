let addons;
function fetchAddons() {
    return new Promise((resolve) => {
        if (!addons) {
            fetch(`${window.location.protocol}/read-addons`)
                .then((resp) => resp.json())
                .then((json) => {
                    addons = json.addons;
                    resolve();
                });
        } else {
            resolve();
        }
    });
}


class HtmlHelper {
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
    addonDiv.className = "addon"
    const helper = new HtmlHelper(addonDiv);
    helper.createElement("h3", {class:"addon-title"}, addon.name);
    helper.createElement("p", {class:"addon-description"}, addon.description);
    helper.createElement("p", {class:"addon-version"}, addon.version);
    helper.createElement("p", {class:"addon-priority"}, `Priority: ${addon.priority}`);
    const resolverList = helper.createElement("ul", {class:"resolver-item"});
    const rHelper = new HtmlHelper(resolverList);
    for (const resolver of addon.resolvers) {
        const li = rHelper.createElement("li", {class:"resolver-item"});
        const li_h = new HtmlHelper(li);
        li_h.createElement("strong", {class:"resolver-name"}, resolver.name);
        li_h.createElement("span", {class:"resolver-description"}, " - " + resolver.description)
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