import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import _ from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretUp, faCaretDown } from '@fortawesome/free-solid-svg-icons'

import { ThemeContext } from './ThemeContext';
import { UserContext } from './UserContext';
import { LocaleContext } from './LocaleContext';

export class Menu {
    constructor(id, title, options = null, defaultSelectionId) {
        this.id = id;
        this.title = title;
        this.options = options;
        this.defaultSelectionId = defaultSelectionId;
    }

    iterate(iterationFn) {
        function _iterate(menu, parentTree) {
            iterationFn(menu, parentTree);

            if (menu.options) {
                parentTree = [...parentTree, menu];

                menu.options.forEach(subMenu => {
                    _iterate(subMenu, parentTree);
                });
            }
        }

        _iterate(this, []);
    }

    openAppropriateMenus(menuId) {
        const openMenus = {};

        this.iterate((subMenu, parentTree) => {
            if (subMenu.id === menuId) {
                parentTree.forEach(menu => {
                    openMenus[menu.id] = true
                });
            }
        });

        return openMenus;
    }
}

HeaderMenuItem.propTypes = {
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    active: PropTypes.bool,
    handleClick: PropTypes.func.isRequired
};

export function HeaderMenuItem({ id, title, active = false, handleClick }) {
    const { translations } = useContext(LocaleContext);

    return (
        <div
            id={id}
            className={classNames('item', active && 'active')}
            onClick={handleClick}
        >
            {_.get(translations, title, title)}
        </div>
    );
}

export function ProfileMenu({ menu, open = true, handleClick }) {
    const theme = useContext(ThemeContext);
    const user = useContext(UserContext);

    return (
        <div className='profile'>
            <img
                className='avatar'
                src={(user && user.image) || 'default-profile.png'}
                width='48'
                height='48'
                alt='Default Profile'
                onClick={() => handleClick(menu)}
            />
            {
                <div
                    className={classNames('drop-down-wrapper', (open && user) ? 'visible' : 'hidden')}
                    style={{
                        backgroundColor: theme.backgroundColor
                    }}
                >
                    <div className='drop-down-content'>
                        {
                            menu.options.map(subMenu =>
                                <SideMenuItem
                                    key={subMenu.id}
                                    {...subMenu}
                                    handleClick={() => handleClick(subMenu)}
                                />
                            )
                        }
                    </div>
                </div>
            }
            </div>
    );
}

SideMenu.propTypes = {
    menu: PropTypes.instanceOf(Menu).isRequired,
    openMenus: PropTypes.object.isRequired,
    activeSubMenuId: PropTypes.string.isRequired,
    handleClick: PropTypes.func.isRequired
};

export function SideMenu({ menu, openMenus, activeSubMenuId, handleClick }) {
    const { translations } = useContext(LocaleContext);

    // TODO: Clean-up and allow full recursion of items.
    return (
        <div
            className='side-menu'
            style={{
                maxWidth: menu.options ? '280px' : '0'
            }}
        >
            <div className='side-menu-content'>
                {
                    menu.options &&
                        <>
                            <h3>{_.get(translations, menu.title, menu.title)}</h3>
                            <ul>
                                {
                                    menu.options.map(subMenu =>
                                        <SideMenuItem
                                            key={subMenu.id}
                                            {...subMenu}
                                            open={openMenus[subMenu.id]}
                                            active={subMenu.id === activeSubMenuId}
                                            handleClick={() => handleClick(subMenu)}
                                        >
                                            {
                                                subMenu.options &&
                                                    <ul>
                                                        {
                                                            subMenu.options.map(subSubMenu =>
                                                                <SideMenuItem
                                                                    key={subSubMenu.id}
                                                                    {...subSubMenu}
                                                                    open={openMenus[subSubMenu.id]}
                                                                    active={subSubMenu.id === activeSubMenuId}
                                                                    handleClick={() => handleClick(subSubMenu)}
                                                                />
                                                            )
                                                        }
                                                    </ul>
                                            }
                                        </SideMenuItem>
                                    )
                                }
                            </ul>
                        </>
                }
            </div>
        </div>
    );
}

SideMenuItem.propTypes = {
    title: PropTypes.string,
    active: PropTypes.bool,
    open: PropTypes.bool,
    children: PropTypes.element,
    handleClick: PropTypes.func
};

export function SideMenuItem({ title = '', active = false, open = false, children = null, handleClick = () => {} }) {
    const { translations } = useContext(LocaleContext);

    const canCollapse = () => {
        return children !== null;
    }

    const onClick = (event) => {
        event.stopPropagation();

        handleClick(event);
    }

    const determineIcon = () => {
        return !canCollapse() ? null
            : open
                ? faCaretUp
                : faCaretDown;
    }

    const icon = determineIcon();

    return (
        <div
            className='collapsible-element'
            onClick={onClick}
        >
            <div className={classNames('top-level', active && 'active')}>
                {
                    icon
                        ? <FontAwesomeIcon icon={icon} />
                        : <span className='spacer' />
                }
                <span className='title'>
                    {_.get(translations, title, title)}
                </span>
            </div>
            {
                canCollapse() &&
                    <div className='collapsible-body' style={{ maxHeight: open ? '6rem' : 0 }}>
                        {children}
                    </div>
            }
        </div>
    );
}

MainPage.propTypes = {
    menu: PropTypes.instanceOf(Menu).isRequired,
    defaultMenu: PropTypes.arrayOf(PropTypes.string).isRequired,
    profileMenu: PropTypes.instanceOf(Menu).isRequired,
    handleSelection: PropTypes.func
};

export default function MainPage({ menu, defaultMenu, profileMenu, handleSelection }) {
    const [ defaultSideMenuId, defaultSubMenuId ] = defaultMenu;

    const [ lastSelections, setLastSelection ] = useState(() => ({ [defaultSideMenuId]: defaultSubMenuId }));
    const [ activeSubMenuId, setActiveMenu ] = useState(defaultSubMenuId);
    const [ openMenus, setOpenMenus ] = useState(() => menu.openAppropriateMenus(defaultSubMenuId));
    const [ sideMenu, setSideMenu ] = useState(() => menu.options.find(value => value.id === defaultSideMenuId));
    const [ showProfileMenu, setShowProfileMenu ] = useState(false);
    const theme = useContext(ThemeContext);
    const user = useContext(UserContext);
    const { translations } = useContext(LocaleContext);

    const handleMenuClick = (menu) => {
        if (menu === sideMenu) {
            return
        }

        const defaultSubMenu = lastSelections[menu.id] || menu.defaultSelectionId;

        setSideMenu(menu);
        setActiveMenu(defaultSubMenu);
        setOpenMenus(menu.openAppropriateMenus(defaultSubMenu));
    };

    const handleSubMenuClick = (subMenu) => {
        if (subMenu.options) {
            const newOpenMenus = {};

            if (newOpenMenus[subMenu.id]) {
                delete newOpenMenus[subMenu.id];
            } else {
                newOpenMenus[subMenu.id] = true;
            }

            setOpenMenus(newOpenMenus);
        } else {
            setActiveMenu(subMenu.id);
            setLastSelection({ ...lastSelections, [sideMenu.id]: subMenu.id });

            handleSelection(subMenu.id);
        }
    };

    const handleProfileMenuClick = (menu) => {
        if (user === null) {
            return handleSelection('login');
        }

        if (menu === profileMenu) {
            setShowProfileMenu(!showProfileMenu);
        } else {
            console.log(`Option selected: ${menu.id}`);

            setShowProfileMenu(false);

            handleSelection(menu.id);
        }
    }

    return (
        <div
            className='main-page'
            style={{
                backgroundColor: theme.backgroundColor,
                color: theme.textColor
            }}
        >
            <div className='top-bar'>
                <img className='logo' src='n-tab.png' alt='Nielsen logo' />
                <div className='header-menu'>
                    {
                        menu.options.map(subMenu =>
                            <HeaderMenuItem
                                key={subMenu.id}
                                {...subMenu}
                                active={subMenu.id === sideMenu.id}
                                handleClick={() => handleMenuClick(subMenu)}
                            />
                        )
                    }
                </div>
                <ProfileMenu
                    className='profile'
                    menu={profileMenu}
                    open={showProfileMenu}
                    handleClick={handleProfileMenuClick}
                />
            </div>
            {
                <SideMenu
                    menu={sideMenu}
                    activeSubMenuId={activeSubMenuId}
                    openMenus={openMenus}
                    handleClick={handleSubMenuClick}
                />
            }
            <div
                className='body'
            >
                Body content goes here...
            </div>
            <div className='footer'>
                <p>{translations.copyright}</p>
            </div>
        </div>
    );
}
