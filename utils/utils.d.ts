import { ApplicationCommandTypes } from "discord.js"

declare namespace Utils {
    export function mkdsf(path: string): void
    export function SelectMenu(options: Array<any>, customId: string): typeof ActionRowBuilder
    export function ComponentCallback(id: string, interaction: any, callback: Function, client: any, timeoutOptions: object): void
    export function ButtonCallback(callback: Function, client: any, label: string, style: any): object
    export function PageSelect(options: object, client: any, othercomponents: Array<any>): object
    export class Command {
        type: ApplicationCommandTypes;
        name: string;
        description: string;
        options: [];
        dmPermission: boolean;
        defaultMemberPermissions: string;
        setType(type: ApplicationCommandTypes): Command;
        setName(name: string): Command;
        setDescription(desc: string): Command;
        addOptions(...options): Command;
        setDMPermission(bool: boolean): Command;
        get build()
    }
}

export = Utils