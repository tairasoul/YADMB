import { AddonInfo } from "./addonTypes";
export declare function retrieveAddonProperties(addon: AddonInfo): import("./addonTypes").command[] | import("./addonTypes").thumbnailResolver[] | import("./addonTypes").PagerResolver[];
export declare function hasResolvers(addon: AddonInfo): boolean;
