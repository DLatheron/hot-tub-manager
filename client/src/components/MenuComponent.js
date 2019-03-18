import React, { useContext } from 'react';
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
        this.selected = options.selected || false;
        this.selectable = options.selectable || false;
        this.disabled = options.disabled || false;
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

    setProperty(id, propertySettingFn) {
        this.iterateAll(menu => {
            if (menu.id === id) {
                propertySettingFn(menu);
            }
        });
    }

    setSelected(id, value) {
        this.setProperty(id, item => item.selected = value);
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

    setActiveItem(id) {
        this.iterateAll(menu => menu.active = false);

        const hierarchy = this.getHierarchy(id);
        if (hierarchy) {
            hierarchy.forEach(menuItem => menuItem.active = true);

            const lastIndex = hierarchy.length - 1;
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
    children: PropTypes.element,
    handleClick: PropTypes.func.isRequired
};

export function MenuItemComponent({ menu, children, handleClick }) {
    const { translate } = useContext(LocaleContext);
    const onClick = (!menu.disabled && !menu.selected)
        ?   (event) => {
                event.stopPropagation();
                handleClick(menu);
            }
        :   (event) => {
                event.stopPropagation();
            };

    return (
        <div
            className={classNames(
                'item',
                menu.active ? 'active' : 'inactive',
                menu.isLeaf() ? 'leaf' : 'subMenu',
                menu.selected && 'selected',
                menu.selectable && 'selectable',
                menu.disabled && 'disabled',
                menu.classes
            )}
            onClick={onClick}
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
                            onClick={onClick}
                        >
                            {translate(menu.title)}
                        </Link>
                    :   <div className='option'>
                            {translate(menu.title)}
                        </div>
            }
            {children}
        </div>
    );
}

SubMenuComponent.propTypes = {
    menu: PropTypes.instanceOf(Menu).isRequired,
    handleClick: PropTypes.func
};

export function SubMenuComponent({ menu, handleClick = () => {} }) {
    const onClick = (subMenu) => (subMenu.actionFn || handleClick)(subMenu);

    return (
        <div className={
            classNames('menu',
            menu.classes, menu.active && 'active')
            }
        >
            <div
                className='menu-content'
            >
                {
                    menu.subMenu.map(subMenu => {
                        return (
                            <MenuItemComponent
                                key={subMenu.id}
                                className='item subMenu'
                                menu={subMenu}
                                handleClick={onClick}
                            >
                                {
                                    subMenu.subMenu && !(subMenu.subMenu instanceof Menu) &&
                                        <SubMenuComponent
                                            className='menu'
                                            menu={subMenu}
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
    handleClick: PropTypes.func.isRequired
};

export default function MenuComponent({ menu, handleClick }) {
    return (
        <>
            {
                _.isArray(menu)
                    ?
                        menu.map(subMenu => (
                            <SubMenuComponent
                                key={subMenu.id}
                                className='menu'
                                menu={subMenu}
                                handleClick={handleClick}
                            />
                        ))
                    :
                        <SubMenuComponent
                            className='menu'
                            menu={menu}
                            handleClick={handleClick}
                        />
                // menu.iterateMenus(subMenus =>
                //     <SubMenuComponent
                //         key={subMenus.id}
                //         className='menu'
                //         menu={subMenus}
                //         handleClick={handleClick}
                //     />
                // )
            }
        </>
    );
}
