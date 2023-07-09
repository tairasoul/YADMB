const fs = require('fs');
const oceanic = require('oceanic.js');
const { ActionRowBuilder, SelectMenuBuilder, SelectMenuOptionBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
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
    /* taken from StackOverflow: https://stackoverflow.com/a/12646864/21098495 */
    shuffleArray: (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
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
        const button = new ButtonBuilder()
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
        const npb = new ButtonBuilder();
        const bpb = new ButtonBuilder();
        npb.setStyle(ButtonStyle.Primary);
        bpb.setStyle(ButtonStyle.Primary);
        npb.setLabel('Next page');
        bpb.setLabel('Previous page');
        npb.setCustomId(npid);
        bpb.setCustomId(bpid);
        const PagesRow = new ActionRowBuilder();
        PagesRow.addComponents(npb, bpb);
        allcomps.push(PagesRow);
        allcomps.push(menu);
        if (othercomponents) allcomps.concat(othercomponents)
        client.on('interactionCreate', async i => {
            if (i.customId != id) return
            if (!i.isStringSelectMenu() && !i.isButton()) return;
            if (i.isStringSelectMenu()) {
                currentembed = currentpage.embeds[i.values[0]];
                currentopt = i.values[0];
                await i.update({components: allcomps, embeds: [currentembed]})
            }
            else if (i.isButton()) {
                if (i.customId == npid) {
                    currentPage += 1;
                    currentembed = pages[currentPage].embeds[0];
                    currentopt = optnames[currentPage][0]
                    if (!shouldUseSeperateComponents) await i.update({components: allcomps, embeds: [currentembed]})
                    else await i.update({components: allcomps.concat(pages[currentPage].components), embeds: [currentembed]})
                }
                else if (i.customId == bpid) {
                    currentPage -= 1;
                    currentembed = pages[currentPage].embeds[0];
                    currentopt = optnames[currentPage][0]
                    if (!shouldUseSeperateComponents) await i.update({components: allcomps, embeds: [currentembed]})
                    else await i.update({components: allcomps.concat(pages[currentPage].components), embeds: [currentembed]})
                }
            }
        })
        return {menuid: id, backid: bpid, nextid: npid, action: async i => {
            if (i.customId != id) return
            if (!i.isStringSelectMenu() && !i.isButton()) return;
            if (i.isStringSelectMenu()) {
                currentembed = currentpage.embeds[i.values[0]];
                currentopt = i.values[0];
                await i.update({components: allcomps, embeds: [currentembed]})
            }
            else if (i.isButton()) {
                if (i.customId == npid) {
                    currentPage += 1;
                    currentembed = pages[currentPage].embeds[0];
                    currentopt = optnames[currentPage][0]
                    if (!shouldUseSeperateComponents) await i.update({components: allcomps, embeds: [currentembed]})
                    else await i.update({components: allcomps.concat(pages[currentPage].components), embeds: [currentembed]})
                }
                else if (i.customId == bpid) {
                    currentPage -= 1;
                    currentembed = pages[currentPage].embeds[0];
                    currentopt = optnames[currentPage][0]
                    if (!shouldUseSeperateComponents) await i.update({components: allcomps, embeds: [currentembed]})
                    else await i.update({components: allcomps.concat(pages[currentPage].components), embeds: [currentembed]})
                }
            }
        }}
    },
    // listen  for interactions from a specific guild, user and custom id
    LFGIC: function(client, guildid, userid, customid, callback) {
        return client.on("interactionCreate", async i => {
            if (i.guildID != guildid) return;
            if (i.user.id != userid) return;
            if (i.data.customID != customid) return;
            await callback(i);
        });
    }
}
