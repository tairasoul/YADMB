const fs = require('fs');
const oceanic = require('oceanic.js');
const randomstring = require('randomstring');
const { Client, ApplicationCommandOptionTypes, ApplicationCommandTypes } = require('oceanic.js');
const builders = require("@oceanicjs/builders");

function selectmenu(options, customId) {
    const actionRow = new builders.ActionRow()
    actionRow.type = oceanic.ComponentTypes.ACTION_ROW
    const selectMenu = new builders.SelectMenu()
    selectMenu.type = oceanic.ComponentTypes.STRING_SELECT
    const addedsongs = new Array
    selectMenu.setCustomID(customId);
    selectMenu.setPlaceholder('Nothing selected')
    for (const option in options) {
        if (!addedsongs.includes(options[option].name) && options[option].name != '') {
            addedsongs.push(options[option].name)
            const name = options[option].name;
            const value = options[option].value || name
            const selectoptions = []
            selectoptions.default = false
            selectoptions.label = name
            selectoptions.value = value
            selectMenu.addOptions(selectoptions)
        }
    }
    actionRow.addComponents(selectMenu)
    return actionRow
}

module.exports = {
    mkdsf: function (path) {
        if (!fs.existsSync(path)) fs.mkdirSync(path)
    },
    SelectMenu: selectmenu,
    ComponentCallback: function (id, interaction, callback, /** @type {Client} */client, timeoutOptions) {
        client.on('interactionCreate', async i => {
            if (i.customId != id) return
            await callback(i)
        })
        if (timeoutOptions && timeoutOptions.ms) {
            setTimeout(async () => {
                client.removeListener('interactionCreate', async i => {
                    if (i.customId != id) return
                    await callback(i)
                })
                await timeoutOptions.callback(interaction)
            }, timeoutOptions.ms)
        }
    },
    ButtonCallback: function(callback, client, label, style) {
        const id = randomstring.generate()
        const button = new builders.Button()
        button.setStyle(style)
        button.setLabel(label)
        button.setCustomId(id)
        const func = async i => {
            if (i.customId != id) return;
            await callback(i)
        }
        client.on('interactionCreate', func)
        return {id: id, button: button, event: func}
    },
    PageSelect: function (options, client, othercomponents) {
        let shouldUseSeperateComponents = false;
        let currentComponents;
        if (typeof options.pages != 'object') throw new Error('Pages must be an object')
        if (options.pages[0].components) shouldUseSeperateComponents = true
        const optnames = new Object;
        const pages = new Array;
        let currentPage = 0;
        const id = randomstring.generate();
        const npid = randomstring.generate();
        const bpid = randomstring.generate();
        for (const page of options.pages) {
            pages.push(page)
            optnames[page.id] = []
            for (const opt in page.embeds) optnames[page.id].push(opt)
        }
        let currentpage = pages[currentPage]
        let currentembed = pages[currentPage].embeds[optnames[0]]
        let currentopt = optnames[currentPage][0]
        if (shouldUseSeperateComponents) currentComponents = currentpage.components
        const allcomps = new Array;
        const menu = selectmenu(optnames, id);
        const npb = new builders.Button();
        const bpb = new builders.Button();
        npb.setStyle(oceanic.ButtonStyles.PRIMARY);
        bpb.setStyle(oceanic.ButtonStyles.PRIMARY);
        npb.setLabel('Next page');
        bpb.setLabel('Previous page');
        npb.setCustomId(npid);
        bpb.setCustomId(bpid);
        const PagesRow = new builders.ActionRow();
        PagesRow.addComponents(npb, bpb);
        allcomps.push(PagesRow);
        allcomps.push(menu);
        if (othercomponents) allcomps.concat(othercomponents)
        client.on('interactionCreate',  async (/** @type {oceanic.AnyComponentSelectMenuInteraction} */i) => {
            if (i.customId != id) return
            if (!i.isSelectMenuComponentInteraction() && !i.isButtonComponentInteraction()) return;
            if (i.isSelectMenuComponentInteraction()) {
                currentembed = currentpage.embeds[i.values[0]];
                currentopt = i.values[0];
                i.editOriginal({components: allcomps, embeds: [currentembed]})
            }
            else if (i.isButtonComponentInteraction()) {
                if (i.customId == npid) {
                    currentPage += 1;
                    currentembed = pages[currentPage].embeds[0];
                    currentopt = optnames[currentPage][0]
                    if (!shouldUseSeperateComponents) await i.update({components: allcomps, embeds: [currentembed]})
                    else await i.editOriginal({components: allcomps.concat(pages[currentPage].components), embeds: [currentembed]})
                }
                else if (i.customId == bpid) {
                    currentPage -= 1;
                    currentembed = pages[currentPage].embeds[0];
                    currentopt = optnames[currentPage][0]
                    if (!shouldUseSeperateComponents) await i.update({components: allcomps, embeds: [currentembed]})
                    else await i.editOriginal({components: allcomps.concat(pages[currentPage].components), embeds: [currentembed]})
                }
            }
        })
        return {menuid: id, backid: bpid, nextid: npid, action: async (/** @type {oceanic.AnyComponentSelectMenuInteraction} */i) => {
            if (i.customId != id) return
            if (!i.isSelectMenuComponentInteraction() && !i.isButtonComponentInteraction()) return;
            if (i.isSelectMenuComponentInteraction()) {
                currentembed = currentpage.embeds[i.values[0]];
                currentopt = i.values[0];
                i.editOriginal({components: allcomps, embeds: [currentembed]})
            }
            else if (i.isButtonComponentInteraction()) {
                if (i.customId == npid) {
                    currentPage += 1;
                    currentembed = pages[currentPage].embeds[0];
                    currentopt = optnames[currentPage][0]
                    if (!shouldUseSeperateComponents) await i.update({components: allcomps, embeds: [currentembed]})
                    else await i.editOriginal({components: allcomps.concat(pages[currentPage].components), embeds: [currentembed]})
                }
                else if (i.customId == bpid) {
                    currentPage -= 1;
                    currentembed = pages[currentPage].embeds[0];
                    currentopt = optnames[currentPage][0]
                    if (!shouldUseSeperateComponents) await i.update({components: allcomps, embeds: [currentembed]})
                    else await i.editOriginal({components: allcomps.concat(pages[currentPage].components), embeds: [currentembed]})
                }
            }
        }}
    }
}

// nothing changed i just added this so the commit can be accurate
