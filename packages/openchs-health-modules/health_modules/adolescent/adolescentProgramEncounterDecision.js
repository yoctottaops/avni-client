import FormFilterHelper from "../rules/FormFilterHelper";

import RoutineEncounterHandler from "./formFilters/RoutineEncounterHandler";
import {getEncounterDecisions as vulnerabilityDecisionsFromEncounter} from './vulnerabilityDecisions';

const encounterTypeHandlerMap = new Map([
    ['Annual Visit', new RoutineEncounterHandler()],
    ['Quarterly Visit', new RoutineEncounterHandler()],
    ['Half-Yearly Visit', new RoutineEncounterHandler()],
    ['Monthly Visit', new RoutineEncounterHandler()]
]);

export function getDecisions (programEncounter, today) {
    return {enrolmentDecisions: [], encounterDecisions: vulnerabilityDecisionsFromEncounter(programEncounter), registrationDecisions: []};
}
export function filterFormElements(programEncounter, formElementGroup) {
    let handler = encounterTypeHandlerMap.get(programEncounter.encounterType.name);
    return FormFilterHelper.filterFormElements(handler, programEncounter, formElementGroup);
}