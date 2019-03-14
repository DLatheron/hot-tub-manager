import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Link } from "react-router-dom";
import classNames from 'classnames';
import _ from 'lodash';

export class Menu {
    constructor(id, options = {}) {
        this.id = id;
        this.title = options.title;
        this.subMenu = options.subMenu;
        this.actionFn = options.actionFn;
        this.url = options.url;
        this.classes = options.classes;
        this.active = false;
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

MenuItemComponent.propTypes = {
    menu: PropTypes.instanceOf(Menu).isRequired,
    handleClick: PropTypes.func.isRequired
};

export function MenuItemComponent({ menu, handleClick }) {
    if (menu.url) {
        return (
            <Link
                to={menu.url || '#'}
                onClick={() => handleClick(menu)}
            >
                {menu.title}
            </Link>
        );
    } else {
        return (
            <div
                onClick={() => handleClick(menu)}
            >
                {menu.title}
            </div>
        );
    }
}

SubMenuComponent.propTypes = {
    menu: PropTypes.instanceOf(Menu).isRequired,
    handleClick: PropTypes.func
};

export function SubMenuComponent({ menu, handleClick = () => {} }) {
    const onClick = (subMenu) => (subMenu.actionFn || handleClick)(subMenu);

    return (
        <ul className={classNames(menu.classes, menu.active && 'active')}>
            {
                menu.subMenu.map(subMenu => {
                    let subItem;

                    if (subMenu.subMenu && !(subMenu.subMenu instanceof Menu)) {
                        subItem = (
                            <SubMenuComponent
                                className='menu'
                                menu={subMenu}
                                handleClick={handleClick}
                            />
                        );

                    }

                    return (
                        <li
                            key={subMenu.id}
                            className={classNames(
                                'item',
                                subMenu.active && 'active',
                                subMenu.isLeaf() && 'leaf'
                            )}
                        >
                            <MenuItemComponent
                                className='item'
                                menu={subMenu}
                                handleClick={onClick}
                            />
                            {subItem}
                        </li>
                    );
                })
            }
        </ul>
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
