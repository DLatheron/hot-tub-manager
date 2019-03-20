import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { Link } from "react-router-dom";
import classNames from 'classnames';
import _ from 'lodash';
import uuidv1 from  'uuid/v1';

import { UserContext } from './UserContext';
import { LocaleContext } from './LocaleContext';

export class Menu {
    constructor(id, { title, subMenu, actionFn, url, icon, classes, selectProps, defaultActive } = {}) {
        this.id = id;

        this.title = title;
        this.subMenu = subMenu;
        this.actionFn = actionFn;
        this.url = url;
        this.icon = icon;
        this.classes = classes;
        this.selectProps = selectProps;
        this.defaultActive = defaultActive;
    }

    isLeaf() {
        return !this.subMenu;
    }

    getSelectPropObject() {
        if (this.selectProps) {
            return _.castArray(this.selectProps).reduce((results, selectProp) => {
                results[selectProp] = this.id;
                return results;
            }, {});
        }

        return undefined;
    }

    firstSelectProp() {
        return _.castArray(this.selectProps)[0];
    }
}

export class Separator extends Menu {
    constructor() {
        super(
            `separator_${uuidv1()}`,
            {
                classes: ['separator'],
                disabled: true
            }
        );
    }
}

ProfileItemComponent.propTypes = {
    menu: PropTypes.instanceOf(Menu).isRequired,
    handleClick: PropTypes.func.isRequired,
    children: PropTypes.element
};

export function ProfileItemComponent({ menu, handleClick, children }) {
    const user = useContext(UserContext);

    return (
        <div className='profile-button'>
            <img
                className='profile-image'
                src={(user && user.image) || 'default-profile.png'}
                width='48'
                height='48'
                alt='Default Profile'
                onClick={() => handleClick(menu)}
            />
            {children}
        </div>
    );
}

MenuItemComponent.propTypes = {
    menu: PropTypes.instanceOf(Menu).isRequired,
    isSelected: PropTypes.bool,
    isDisabled: PropTypes.bool,
    isOpen: PropTypes.bool,
    children: PropTypes.element,
    handleClick: PropTypes.func.isRequired
};

export function MenuItemComponent({
    menu,
    isSelected = false,
    isDisabled = false,
    isOpen = false,
    children,
    handleClick
}) {
    const { translate } = useContext(LocaleContext);
    const title = translate(menu.title);

    return (
        <div
            className={classNames(
                'item',
                isOpen && 'open',
                menu.isLeaf() ? 'leaf' : 'hasSubMenu',
                (isSelected === menu.id) && 'selected',
                (isSelected !== undefined) && 'selectable',
                isDisabled && 'disabled',
                menu.classes
            )}
            onClick={(event) => handleClick(event, menu)}
        >
            <div
                className={classNames(
                    'item-content',
                    (isSelected === menu.id) && 'selected',
                    isDisabled && 'disabled'
                )}
            >
                {
                    menu.icon &&
                        <>
                            <div className='iconBackground' />
                            <div className='icon'>{menu.icon}</div>
                        </>
                }
                {
                    menu.option && menu.url
                        ?   <Link
                                className='option'
                                to={menu.url || '#'}
                                onClick={(event) => handleClick(event, menu)}
                            >
                                {title}
                            </Link>
                        :   <div className='option'>
                                {title}
                            </div>
                }
            </div>
            {children}
        </div>
    );
}

SubMenuComponent.propTypes = {
    className: PropTypes.string,
    menu: PropTypes.instanceOf(Menu).isRequired,
    selections: PropTypes.object.isRequired,
    disabled: PropTypes.object.isRequired,
    open: PropTypes.object,
    handleClick: PropTypes.func.isRequired
};

export function SubMenuComponent({
    className,
    menu,
    selections,
    disabled,
    open = false,
    handleClick
}) {
    return (
        <div
            className={classNames(
                'menu',
                className,
                menu.classes,
                open[menu.id] && 'open',
                disabled[menu.id] && 'disabled'
            )}
        >
            <div
                className='menu-content'
            >
                {
                    menu.subMenu.map(subMenu => {
                        return (
                            <MenuItemComponent
                                key={subMenu.id}
                                menu={subMenu}
                                isSelected={selections[subMenu.firstSelectProp()] === subMenu.id}
                                isDisabled={disabled[subMenu.id]}
                                isOpen={open[subMenu.id]}
                                handleClick={handleClick}
                            >
                                {
                                    subMenu.subMenu && !(subMenu.subMenu instanceof Menu) &&
                                        <SubMenuComponent
                                            menu={subMenu}
                                            selections={selections}
                                            disabled={disabled}
                                            open={open}
                                            handleClick={handleClick}
                                        />
                                }
                            </MenuItemComponent>
                        );
                    })
                }
            </div>
        </div>
    )
}

MenuComponent.propTypes = {
    menu: PropTypes.instanceOf(Menu).isRequired,
    isVisible: PropTypes.bool,
    selections: PropTypes.object,
    initiallyOpen: PropTypes.object,
    disabled: PropTypes.object,
    handleClick: PropTypes.func.isRequired
};

export default function MenuComponent({
    menu,
    isVisible = true,
    selections = {},
    initiallyOpen = {},
    disabled = {},
    handleClick
}) {
    const [open, setOpen] = useState(initiallyOpen);

    const _handleClick = (event, menuItem) => {
        event.stopPropagation();

        if (disabled[menuItem.id]) {
            console.log(`${menuItem.id} is disabled - click ignored`);
            return;
        }

        console.log(`_handleClick for ${menuItem.id}: ${menuItem.subMenu}`);

        if (menuItem.isLeaf()) {
            console.log('leaf');
            (menuItem.actionFn || handleClick)(menuItem);
        } else {
            const newOpen = {
                ...open,
                [menuItem.id]: !open[menuItem.id]
            };

            setOpen(newOpen);

            console.log(`newOpen: ${JSON.stringify(newOpen, null, 4)}`);
        }
    };

    return (
        <>
            {
                _.isArray(menu)
                    ?
                        menu.map(subMenu => (
                            <SubMenuComponent
                                key={subMenu.id}
                                className={classNames(isVisible ? 'visible' : 'hidden')}
                                menu={subMenu}
                                selections={selections}
                                disabled={disabled}
                                open={open}
                                handleClick={_handleClick}
                            />
                        ))
                    :
                        <SubMenuComponent
                            className={classNames(isVisible ? 'visible' : 'hidden')}
                            menu={menu}
                            selections={selections}
                            disabled={disabled}
                            open={open}
                            handleClick={_handleClick}
                        />
            }
        </>
    );
}
