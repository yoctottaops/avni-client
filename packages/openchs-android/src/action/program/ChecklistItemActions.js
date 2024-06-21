import ObservationsHolderActions from '../common/ObservationsHolderActions';
import _ from 'lodash';
import ChecklistItemState from "../../state/ChecklistItemState";
import ChecklistService from "../../service/ChecklistService";
import RuleEvaluationService from "../../service/RuleEvaluationService";
import {ChecklistItem} from "openchs-models";

function filterFormElements(formElementGroup, context, checklistItem) {
    const formElementStatuses = context.get(RuleEvaluationService).getFormElementsStatuses(checklistItem, ChecklistItem.schema.name, formElementGroup);
    return formElementGroup.filterElements(formElementStatuses);
}

class ChecklistItemActions {
    static getInitialState() {
        return new ChecklistItemState();
    }

    static onLoad(state, action, context) {
        const form = action.checklistItem.detail.form;

        let firstGroupWithAtLeastOneVisibleElement = _.find(_.sortBy(form.nonVoidedFormElementGroups(), [function (o) {
            return o.displayOrder
        }]), (formElementGroup) => filterFormElements(formElementGroup, context, action.checklistItem).length !== 0);

        if (_.isNil(firstGroupWithAtLeastOneVisibleElement)) {
            return ChecklistItemState.createOnLoadStateForEmptyForm(action.checklistItem, form, false);
        }

        let filteredElements = filterFormElements(firstGroupWithAtLeastOneVisibleElement, context, action.checklistItem);

        return ChecklistItemState.createOnLoad(action.checklistItem, form, false, firstGroupWithAtLeastOneVisibleElement, filteredElements);
    }

    static onNext(state, action, context) {
        return state.clone().handleNext(action, context);
    }

    static onPrevious(state, action, context) {
        return state.clone().handlePrevious(action, context);
    }

    static onSave(state, action, context) {
        const newState = state.clone();

        const service = context.get(ChecklistService);
        service.saveChecklistItem(newState.checklistItem);

        action.cb();
        return newState;
    }

    static onUndo(state, action, context) {
        context.get(ChecklistService).undoChecklistItem(action.checklistItem);
        return state;
    }

    static encounterDateTimeChanged(state, action, context) {
        const newState = state.clone();
        newState.checklistItem.completionDate = action.value;
        const formElementStatuses = ObservationsHolderActions.updateFormElements(newState.formElementGroup, newState, context);
        newState.observationsHolder.removeNonApplicableObs(newState.formElementGroup.getFormElements(), newState.filteredFormElements);
        newState.observationsHolder.updatePrimitiveCodedObs(newState.filteredFormElements, formElementStatuses);
        return newState;
    }
}

const ChecklistItemActionNames = {
    ON_LOAD: 'ci.ON_LOAD',
    TOGGLE_MULTISELECT_ANSWER: "ci.TOGGLE_MULTISELECT_ANSWER",
    TOGGLE_SINGLESELECT_ANSWER: "ci.TOGGLE_SINGLESELECT_ANSWER",
    PRIMITIVE_VALUE_CHANGE: 'ci.PRIMITIVE_VALUE_CHANGE',
    PRIMITIVE_VALUE_END_EDITING: 'ci.PRIMITIVE_VALUE_END_EDITING',
    DURATION_CHANGE: 'ci.DURATION_CHANGE',
    DATE_DURATION_CHANGE: 'ci.DATE_DURATION_CHANGE',
    PREVIOUS: 'ci.PREVIOUS',
    NEXT: 'ci.NEXT',
    ENCOUNTER_DATE_TIME_CHANGED: "ci.ENROLMENT_DATE_TIME_CHANGED",
    SAVE: "ci.SAVE",
    UNDO: 'ci.UNDO'
};

const ChecklistItemActionMap = new Map([
    [ChecklistItemActionNames.ON_LOAD, ChecklistItemActions.onLoad],
    [ChecklistItemActionNames.TOGGLE_MULTISELECT_ANSWER, ObservationsHolderActions.toggleMultiSelectAnswer],
    [ChecklistItemActionNames.TOGGLE_SINGLESELECT_ANSWER, ObservationsHolderActions.toggleSingleSelectAnswer],
    [ChecklistItemActionNames.PRIMITIVE_VALUE_CHANGE, ObservationsHolderActions.onPrimitiveObsUpdateValue],
    [ChecklistItemActionNames.PRIMITIVE_VALUE_END_EDITING, ObservationsHolderActions.onPrimitiveObsEndEditing],
    [ChecklistItemActionNames.DATE_DURATION_CHANGE, ObservationsHolderActions.onDateDurationChange],
    [ChecklistItemActionNames.DURATION_CHANGE, ObservationsHolderActions.onDurationChange],
    [ChecklistItemActionNames.NEXT, ChecklistItemActions.onNext],
    [ChecklistItemActionNames.PREVIOUS, ChecklistItemActions.onPrevious],
    [ChecklistItemActionNames.ENCOUNTER_DATE_TIME_CHANGED, ChecklistItemActions.encounterDateTimeChanged],
    [ChecklistItemActionNames.SAVE, ChecklistItemActions.onSave],
    [ChecklistItemActionNames.UNDO, ChecklistItemActions.onUndo],
]);

export {
    ChecklistItemActionNames,
    ChecklistItemActionMap,
    ChecklistItemActions
};
