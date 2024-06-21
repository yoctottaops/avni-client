import React from "react";
import AbstractComponent from "../../framework/view/AbstractComponent";
import PropTypes from 'prop-types';
import {View} from "react-native";
import Colors from "../primitives/Colors";
import Distances from "../primitives/Distances";
import Separator from "../primitives/Separator";
import SubjectInfoCard from "./SubjectInfoCard";

class IndividualDetailsCard extends AbstractComponent {
    static propTypes = {
        individual: PropTypes.object.isRequired,
        renderDraftString: PropTypes.bool
    };

    constructor(props, context) {
        super(props, context);
    }

    render() {
        const {individual, renderDraftString} = this.props;
        return (
            <View style={{
                marginRight: Distances.ScaledContentDistanceFromEdge,
                marginLeft: Distances.ScaledContentDistanceFromEdge
            }}
            >
                <SubjectInfoCard individual={individual} renderDraftString={renderDraftString}/>
                <Separator backgroundColor={Colors.InputBorderNormal}/>
            </View>
        );
    }
}

export default IndividualDetailsCard
