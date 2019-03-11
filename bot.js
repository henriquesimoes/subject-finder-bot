// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityTypes } = require('botbuilder');
const request = require('request');
const {JSDOM} = require('jsdom');


class MyBot {
    
    constructor () {
        this.greeting = false;
    }
    /**
     *
     * @param {TurnContext} on turn context object.
     */
    async onTurn(turnContext) {
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        if (turnContext.activity.type === ActivityTypes.Message) {
            const message = turnContext.activity.text.toUpperCase();
            const subject = await this.loadSubject(message);
            if (subject !== null) {
                await turnContext.sendActivity(`${subject.name}\n\n${subject.description}`);
            } else {
                await turnContext.sendActivity(`Disciplina não encontrada. :(`);
            }
        }
    }

    async loadSubject(subjectName, year = 2019) {
        const dom = await JSDOM.fromURL(`https://www.dac.unicamp.br/sistemas/catalogos/grad/catalogo${year}/coordenadorias/0023/0023.html`);

        const referenceElement = dom.window.document.querySelector(`a[name='${subjectName}']`);
        const subjectDiv = referenceElement !== null ? referenceElement.parentElement : null;

        // if subject not found return null
        if (subjectDiv === null) return null;
        
        return {
            name: subjectDiv.querySelector('a').innerHTML,
            description: subjectDiv.nextElementSibling.nextElementSibling.querySelector('p').innerHTML
        }
    }
}

module.exports.MyBot = MyBot;
