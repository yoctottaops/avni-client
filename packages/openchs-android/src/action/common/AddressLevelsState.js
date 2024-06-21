import _ from 'lodash';

class AddressLevelsState {
    constructor(levels = []) {
        const unsortedLevels = Object.entries(_.uniqBy(levels, l => l.uuid)
            .reduce((acc, {locationMappings, uuid, name, level, type, parentUuid, typeUuid, isSelected = false}) => {
                const accumulatorKey = level + "->" + type;
                // accumulating just by type affects our ability to sort the levels. accumulating just by level affects our ability to group levels of the same type
                // hence using a composite key of level + type with a separator
                acc[accumulatorKey] = _.defaultTo(acc[accumulatorKey], []).concat([{
                    uuid,
                    name,
                    level,
                    type,
                    parentUuid,
                    typeUuid,
                    isSelected,
                    locationMappings
                }]);
                return acc;
            }, {}));
        const sortedLevels = _.orderBy(unsortedLevels, ([levelKey, value]) => levelKey, ['desc']);
        this.levels = sortedLevels.map(([levelKey, levels]) => {
            const levelType = levels[0].type;
            const other = _.find(levels, (level) => _.startsWith(level.name, "Other"));
            if(!_.isNil(other)) {
                const levelsExcludingOther = _.filter(levels, (level) => level.name !== other.name);
                const sortedLevels = _.sortBy(levelsExcludingOther, "name");
                const levelsEndingWithOther = _.concat(sortedLevels, other);
                return [levelType, levelsEndingWithOther];
            } else {
                return [levelType, _.sortBy(levels, "name")];
            }

        });
    }

    canBeUsed(level) {
        return level.isSelected || level.level === this.maxSelectedLevel || _.isEmpty(this.selectedAddresses) || _.isEmpty(level.locationMappings);
    }

    _asList(levelMap = new Map(this.levels)) {
        return _.flatten([...levelMap.values()]);
    }

    get maxSelectedLevel() {
        if (_.isEmpty(this.selectedAddresses)) return null;
        return _.maxBy(this.selectedAddresses, l => l.level).level
    }

    get selectedAddresses() {
        return this._asList().filter(l => l.isSelected);
    }

    isSelected(uuid) {
        return this.selectedAddresses.some(sa => sa.uuid === uuid);
    }

    get lowestSelectedAddresses() {
        if (_.isEmpty(this.selectedAddresses)) return [];
        const minLevel = _.minBy(this.selectedAddresses, l => l.level).level;
        return this.selectedAddresses.filter(l => l.level === minLevel);
    }

    addLevel(type, selectedLevel, newLevels = []) {
        let levelMap = new Map(this.levels);
        const levels = levelMap.get(type);
        levelMap.set(type, levels.map(l => _.assignIn({},l,{
            isSelected: l.uuid === selectedLevel.uuid ? !l.isSelected : l.isSelected
        })));
        return new AddressLevelsState(this._asList(levelMap)).addOrRemoveLevels(selectedLevel.uuid, newLevels).removeUnwantedLevels();
    }

    selectLevel(type, selectedLevel, newLevels = []) {
        const allCurrentLevels = this._asList();
        if (_.isEmpty(selectedLevel.locationMappings)) {
            allCurrentLevels.forEach(l => {
                l.isSelected = l.uuid === selectedLevel.uuid ? !l.isSelected : false;
            })
        } else {
            allCurrentLevels.filter(it => it.level === selectedLevel.level).forEach(l => {
                l.isSelected = l.uuid === selectedLevel.uuid ? !l.isSelected : false
            });
        }
        const toRemove = allCurrentLevels.filter(l => !_.isEmpty(l.locationMappings) && l.level < selectedLevel.level && l.parentUuid !== selectedLevel.parentUuid);
        return new AddressLevelsState(allCurrentLevels).addLevels(newLevels)
            .removeLevels(toRemove)
            .removeUnwantedLevels();
    }

    addLevels(levels) {
        return new AddressLevelsState(this._asList().concat(levels));
    }

    removeLevels(levels) {
        const allChildren = this.findAllChildrenFromCurrentLevels(levels);
        return new AddressLevelsState(_.differenceBy(this._asList(), allChildren, (a) => a.uuid));
    }

    removeUnwantedLevels() {
        const levels = this._asList();
        const getParent = parentUUID => _.filter(levels, it => it.uuid === parentUUID);
        return new AddressLevelsState(levels.filter(l => {
            return this.canBeUsed(l) || _(getParent(l.parentUuid)).reject(p => _.isNil(p) || !p.isSelected)
                .some(this.canBeUsed);
        }));
    }

    addOrRemoveLevels(selectedLevelUUID, levels) {
        return this.isSelected(selectedLevelUUID) ?
            this.addLevels(levels) :
            this.removeLevels(levels);
    }

    defaultTo(state) {
        return _.isEmpty(this.selectedAddresses) ? state : this;
    }

    clone() {
        return new AddressLevelsState(Array.from(this._asList()));
    }

    get selectedAddressLevelUUIDs() {
        return _.map(this.selectedAddresses, ({uuid}) => uuid);
    }

    findAllChildrenFromCurrentLevels(levels = []) {
        if(_.isEmpty(levels)) {
            return levels;
        }
        const parentUUIDs = _.defaultTo(levels.map(p => p.uuid), []);
        const children = this._asList().filter(l => _.includes(parentUUIDs, l.parentUuid));
        return _.concat(levels, this.findAllChildrenFromCurrentLevels(children));
    }
}

export default AddressLevelsState;
