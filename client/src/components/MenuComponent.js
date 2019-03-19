import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { Link } from "react-router-dom";
import classNames from 'classnames';
import _ from 'lodash';
import uuidv1 from  'uuid/v1';

import { UserContext } from './UserContext';
import { LocaleContext } from './LocaleContext';

export class Menu {
    constructor(id, options = {}) {
        this.id = id;
        this.title = options.title;
        this.subMenu = options.subMenu;
        this.actionFn = options.actionFn;
        this.url = options.url;
        this.icon = options.icon;
        this.classes = options.classes;
        this.active = options.active || false;
        this.selectProp = options.selectProp;
        this.defaultActive = options.defaultActive;
    }

    isLeaf() {
        return !this.subMenu;
    }

    iterateAll(iterationFn) {
        iterationFn(this);

        if (this.subMenu) {
            if (this.subMenu instanceof Menu) {
                this.subMenu.iterateAll(iterationFn);
            } else {
                this.subMenu.forEach(subSubMenu => subSubMenu.iterateAll(iterationFn));
            }
        }
    }

    iterateMenus(iterationFn) {
        const menusToRender = [iterationFn(this)];

        function _iterateMenus(menu) {
            if (menu.subMenu) {
                if (menu.subMenu instanceof Menu) {
                    menusToRender.push(iterationFn(menu.subMenu));
                } else {
                    menu.subMenu.forEach(subSubMenu => _iterateMenus(subSubMenu));
                }
            }
        }

        _iterateMenus(this);

        return menusToRender;
    }

    getHierarchy(id) {
        if (this.id === id) {
            return [this];
        }

        if (this.subMenu) {
            if (this.subMenu instanceof Menu) {
                const results = this.subMenu.getHierarchy(id);
                if (results) {
                    return [this, ...results];
                }
            } else {
                for (let i = 0; i < this.subMenu.length; ++i) {
                    const results = this.subMenu[i].getHierarchy(id);
                    if (results) {
                        return [this, ...results];
                    }
                }
            }
        }

        return null;
    }

    setActiveItem(id, makeLeafActive = true) {
        this.iterateAll(menu => menu.active = false);

        const hierarchy = this.getHierarchy(id);
        if (hierarchy) {
            const lastIndex = hierarchy.length - 1;

            hierarchy.forEach((menuItem) => {
                if (makeLeafActive || !menuItem.isLeaf()) {
                    menuItem.active = true;
                    console.log(`menuItem ${makeLeafActive} -> ${menuItem.id} (${menuItem.isLeaf()}) = ${menuItem.active}`);
                }
            });

            if (hierarchy[lastIndex].subMenu instanceof Menu) {
                hierarchy[lastIndex].subMenu.active = true;
            }
        }
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
    isDisabled: PropTypes.bool.isRequired,
    isOpen: PropTypes.bool.isRequired,
    children: PropTypes.element,
    handleClick: PropTypes.func.isRequired
};

export function MenuItemComponent({ menu, isSelected, isDisabled, isOpen, children, handleClick }) {
    const { translate } = useContext(LocaleContext);
    const title = translate(menu.title);

    return (
        <div
            className={classNames(
                'item',
                isOpen ? 'open' : 'closed',
                menu.active ? 'active' : 'inactive',
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
    menu: PropTypes.instanceOf(Menu).isRequired,
    selections: PropTypes.object.isRequired,
    disabled: PropTypes.object.isRequired,
    open: PropTypes.object.isRequired,
    handleClick: PropTypes.func.isRequired
};

export function SubMenuComponent({ menu, selections, disabled, open, handleClick }) {
    return (
        <div
            className={classNames(
                'menu',
                menu.classes,
                menu.active && 'active',
                open[menu.id] ? 'open' : 'closed'
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
                                isSelected={selections[subMenu.selectProp]}
                                disabled={disabled[subMenu.id]}
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
    selections: PropTypes.object,
    initiallyOpen: PropTypes.object,
    disabled: PropTypes.object,
    handleClick: PropTypes.func.isRequired
};

export default function MenuComponent({ menu, selections= {}, disabled = {}, initiallyOpen = {}, handleClick }) {
    const [open, setOpen] = useState(initiallyOpen);

    const _handleClick = (event, menuItem) => {
        console.log(`_handleClick for ${menuItem.id}: ${menuItem.subMenu}`);

        event.stopPropagation();

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
                                className='menu open'
                                menu={subMenu}
                                selections={selections}
                                disabled={disabled}
                                open={open}
                                handleClick={_handleClick}
                            />
                        ))
                    :
                        <SubMenuComponent
                            className='menu open'
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
