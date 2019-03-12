// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityTypes } = require('botbuilder');
const {JSDOM} = require('jsdom');

const WELCOMED_USER = 'welcomedUserProperty';

class MyBot {
    
    /**
     *
     * @param {UserState} User state to persist boolean flag to indicate
     *                    if the bot had already welcomed the user
     */
    constructor(userState) {
        // Creates a new user property accessor.
        // See https://aka.ms/about-bot-state-accessors to learn more about the bot state and state accessors.
        this.welcomedUserProperty = userState.createProperty(WELCOMED_USER);

        this.userState = userState;
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
            // Save state changes
        } else {
            // Read UserState. If the 'DidBotWelcomedUser' does not exist (first time ever for a user)
            // set the default to false.
            const didBotWelcomedUser = await this.welcomedUserProperty.get(turnContext, false);

            // Your bot should proactively send a welcome message to a personal chat the first time
            // (and only the first time) a user initiates a personal chat with your bot.
            if (didBotWelcomedUser === false) {
                // The channel should send the user name in the 'From' object
                let userName = turnContext.activity.from.name;
                await turnContext.sendActivity(`Bem-vindo, ${userName}. Estou pronto para lhe informar sobre as disciplinas do IC. Fale-me o código e eu lido com o restante!`);

                // Set the flag indicating the bot handled the user's first message.
                await this.welcomedUserProperty.set(turnContext, true);
            }
        }

        await this.userState.saveChanges(turnContext);
    }

    async loadSubject(subjectName, year = 2019) {
        const dom = await JSDOM.fromURL(`https://www.dac.unicamp.br/sistemas/catalogos/grad/catalogo${year}/coordenadorias/0023/0023.html`);

        // Element that contains a reference to the subject name code
        const referenceElement = dom.window.document.querySelector(`a[name='${subjectName}']`);

        // Element that contains the subject title nested
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
