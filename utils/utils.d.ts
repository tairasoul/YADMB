import { ActionRow } from '@oceanicjs/builders'
import oceanic from "oceanic.js"

declare namespace Utils {
    export function mkdsf(path: string): void
    export function SelectMenu(options: Array<any>, customId: string): ActionRow
    export function ComponentCallback(id: string, interaction: any, callback: Function, client: any, timeoutOptions: object): void
    export function ButtonCallback(callback: Function, client: any, label: string, style: any): object
    export function PageSelect(options: object, client: any, othercomponents: Array<any>): object
    export function shuffleArray(array: Array<any>): void;
    export function LFGIC(client: oceanic.Client, guildid: string, userid: string, customid: string, callback: (interaction: oceanic.ComponentInteraction) => Promise<void>)
}

export = Utils
