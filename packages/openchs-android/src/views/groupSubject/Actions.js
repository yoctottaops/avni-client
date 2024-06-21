import React from 'react';
import {TouchableOpacity} from "react-native";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import Colors from "../primitives/Colors";
import MenuItem from "../menu/MenuItem";
import Menu from "../menu";
import AbstractComponent from "../../framework/view/AbstractComponent";
import PropTypes from "prop-types";

class Actions extends AbstractComponent {
    static propTypes = {
        actions: PropTypes.array.isRequired,
        item: PropTypes.object.isRequired
    };

    _menu = null;

    setMenuRef = ref => {
        this._menu = ref;
    };

    showMenu = () => {
        this._menu.show();
    };

    hideMenu = () => {
        this._menu.hide();
    };

    onPress = (cb) => {
        this.hideMenu();
        cb(this.props.item);
    };

    render() {
        const color = this.props.color || Colors.Complimentary;
        return <Menu
            ref={this.setMenuRef}
            button={<TouchableOpacity onPress={this.showMenu}>
                <MaterialIcon
                    name='more-vert'
                    size={25}
                    color={color}/>
            </TouchableOpacity>}>
            {this.props.actions.map(({fn, label, color:textColor}, index) => (
                <MenuItem key={index} onPress={() => this.onPress(fn)}
                          textStyle={{color: textColor || color}}>{this.I18n.t(label)}</MenuItem>))}
        </Menu>
    }
}

export default Actions;
