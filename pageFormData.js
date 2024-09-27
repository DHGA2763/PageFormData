// Made by DHGA2763
import { ActionFormData } from "@minecraft/server-ui";

/**
 * @typedef ActionFormDataButton
 * @property {string} text
 * @property {string} [iconPath]
*/

/** Maximum number of buttons per basic page*/
const DEFAULT_BUTTON_IN_FORM_VALUE = 5;
/** Text and icons for the basic page turn and back buttons */
const DEFAULT_PAGE_BUTTON = {

    Next: {

        text: '[ NEXT ]',
        iconPath: 'textures/ui/chevron_grey_right',

    },

    Before: {

        text: '[ BACK ]',
        iconPath: 'textures/ui/chevron_grey_left',

    },

};
/** PageFormData title text design */
const FORM_TITLE_DESIGN = '<TitleText>§r (<CurrentPage>/<MaxPage>)';


/** PageFormData */
class PageFormData {

    /** 
     * @param {number} buttonInFormValue 
     */
    constructor (buttonInFormValue) {

        this.buttonInFormValue = Number(buttonInFormValue) || DEFAULT_BUTTON_IN_FORM_VALUE;
        /**
         * @type {ActionFormDataButton[]}
         */
        this.allButton = [];
        this.nextPageData = {

            text: DEFAULT_PAGE_BUTTON.Next.text,
            icon: DEFAULT_PAGE_BUTTON.Next.iconPath,

        };
        this.beforePageData = {

            text: DEFAULT_PAGE_BUTTON.Before.text,
            icon: DEFAULT_PAGE_BUTTON.Before.iconPath,

        };

    }

    /**
     * set PageFormData title text
     * @param {string} titleText 
     */
    title(titleText) {

        this.titleText = `${titleText}`;

    }

    /**
     * set PageFormData body text
     * @param {string} bodyText 
     */
    body(bodyText) {

        this.bodyText = `${bodyText}`;

    }

    /**
     * add PageFormData button
     * @param {string} text 
     * @param {string} [iconPath] 
     */
    button(text, iconPath) {

        this.allButton.push({ text, iconPath });

    }

    /**
     * set 'go next page' button text, iconPath
     * @param {string} text 
     * @param {string} [iconPath] 
     */
    setNextPageData(text, iconPath) {

        this.nextPageData = { text, iconPath };

    }

    /**
     * set 'go before page' button text, iconPath
     * @param {string} text 
     * @param {string} [iconPath] 
     */
    setBeforePageData(text, iconPath) {

        this.beforePageData = { text, iconPath };

    }

    /**
     * show PageFormData for target(player)
     * @param {Player} target 
     * @param {function( { canceled: boolean, page: number, selection: number | undefined } )} [callback] 
     * @param {number} [pageValue] 
     */
    show(target, callback, pageValue) {

        const pageIndex = pageValue !== undefined ? pageValue : 0;
        const form = new ActionFormData();
        form.body(this?.bodyText || '');
        this.button = setPageButton(this.allButton, this.buttonInFormValue);
        form.title(FORM_TITLE_DESIGN.replace('<TitleText>', (this?.titleText !== undefined ? `${this.titleText}` : '')).replace('<CurrentPage>', `${pageIndex+1}`).replace('<MaxPage>', `${this.button.length}`));
        const buttons = this.button[pageIndex];
        buttons.forEach( button => form.button((button?.text || '§r'), button?.iconPath) );
        form.button(this.beforePageData.text, this.beforePageData?.iconPath);
        form.button(this.nextPageData.text, this.nextPageData?.iconPath);

        form.show(target).then((response) => {

            if (response.canceled) {

                return callback( { canceled: true, page: pageIndex } );

            } else {

                switch (response.selection) {

                    case buttons.length:

                        if (pageIndex > 0) {

                            return this.show(target, callback, --pageIndex);

                        } else {

                            return this.show(target, callback, --this.button.length);

                        };

                    case ++buttons.length:

                        if (pageIndex+1 >= this.button.length) {

                            return this.show(target, callback, 0);

                        } else {

                            return this.show(target, callback, ++pageIndex);

                        };

                    default:

                        return callback({

                            canceled: false,
                            selection: (pageIndex * buttons.length) + response.selection,
                            page: pageIndex,

                        });

                    break;

                };

            };

        });

    };

};

/**
 * @param {ActionFormDataButton[]} allButton 
 * @param {number} buttonInFormValue 
 * @returns {ActionFormDataButton[]}
 */
function setPageButton(allButton, buttonInFormValue) {
    let result = [];
    for (let i = 0; i < allButton.length; i += buttonInFormValue) result.push(allButton.slice(i, i + buttonInFormValue));
    return result;
}

export default PageFormData;
