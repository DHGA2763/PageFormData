// Made by DHGA2763
import { ActionFormData } from "@minecraft/server-ui";

/**
 * @typedef ActionFormDataButton
 * @property {string} text
 * @property {string} [iconPath]
*/

/** Maximum number of buttons per page */
const DEFAULT_BUTTONS_PER_PAGE = 5;
/** Text and icons for the page navigation buttons */
const DEFAULT_PAGE_BUTTONS = {
    Next: { text: '[ NEXT ]', iconPath: 'textures/ui/chevron_grey_right' },
    Back: { text: '[ BACK ]', iconPath: 'textures/ui/chevron_grey_left' },
};
/** PageFormData title text template */
const TITLE_TEMPLATE = '<TitleText>§r (<CurrentPage>/<MaxPage>)';


/** PageFormData */
class PageFormData {

    /** @param {number | DEFAULT_BUTTONS_PER_PAGE} buttonsPerPage */
    constructor(buttonsPerPage = DEFAULT_BUTTONS_PER_PAGE) {

        this.buttonsPerPage = Number(buttonsPerPage);
        /** @type {ActionFormDataButton[]} */
        this.allButtons = [];
        this.nextPageButton = DEFAULT_PAGE_BUTTONS.Next;
        this.backPageButton = DEFAULT_PAGE_BUTTONS.Back;

    }

    /** @param {string} titleText */
    title(titleText) { this.titleText = String(titleText); }

    /** @param {string} bodyText */
    body(bodyText) { this.bodyText = String(bodyText); }

    /** @param {string} text @param {string} [iconPath] */
    button(text, iconPath) { this.allButtons.push({ text, iconPath }); }

    /** @param {string} text @param {string} [iconPath] */
    setNextPageButton(text, iconPath) { this.nextPageButton = { text, iconPath }; };

    /** @param {string} text @param {string} [iconPath] */
    setBackPageButton(text, iconPath) { this.backPageButton = { text, iconPath }; }

    /**
     * show PageFormData for target(player)
     * @param {Player} target 
     * @param {function} [callback] 
     * @param {number} [pageIndex] 
     * @returns {function({ canceled: boolean, page: number, selection: number | undefined }) | { canceled: boolean, page: number, selection: number | undefined }}
     */
    async show(target, callback, pageIndex = 0) {

        if (!target) throw new Error(`PageFormData.show(target) - target is undefined`);
        const callbackTypeIsFunction = typeof callback === "function";

        const form = new ActionFormData();
        form.title(this.getTitle(pageIndex));
        form.body(this.bodyText || '');

        const buttons = this.getButtonsForPage(pageIndex);
        buttons.forEach(button => form.button(button.text || '§r', button.iconPath));

        form.button(this.backPageButton.text, this.backPageButton.iconPath);
        form.button(this.nextPageButton.text, this.nextPageButton.iconPath);

        const response = await form.show(target);
        if (response.canceled) {

            if (callbackTypeIsFunction) return callback({ canceled: true, page: ++pageIndex });
            return { canceled: true, page: ++pageIndex };

        };
        this.handleResponse(response.selection, buttons.length, pageIndex, target, callbackTypeIsFunction, callback);

    }

    getTitle(pageIndex) {

        return TITLE_TEMPLATE.replace('<TitleText>', this.titleText || '').replace('<CurrentPage>', String(++pageIndex)).replace('<MaxPage>', String(this.getTotalPages()));

    }

    getTotalPages() { return Math.ceil(this.allButtons.length / this.buttonsPerPage); }

    getButtonsForPage(pageIndex) {

        const start = pageIndex * this.buttonsPerPage;
        return this.allButtons.slice(start, start + this.buttonsPerPage);

    }

    handleResponse(selection, buttonsCount, pageIndex, target, callbackTypeIsFunction, callback) {

        switch (selection) {

            case buttonsCount:

                return this.show(target, callback, pageIndex > 0 ? pageIndex - 1 : this.getTotalPages() - 1);

            case buttonsCount + 1:

                return this.show(target, callback, pageIndex + 1 >= this.getTotalPages() ? 0 : pageIndex + 1);

            default:

                if (callbackTypeIsFunction) return callback({ canceled: false, selection: pageIndex * this.buttonsPerPage + selection, page: pageIndex + 1 });
                return { canceled: false, selection: pageIndex * this.buttonsPerPage + selection, page: pageIndex + 1 };

            break;

        };

    }

}

export default PageFormData;
