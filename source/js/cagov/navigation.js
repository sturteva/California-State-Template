/* -----------------------------------------
   NAVIGATION - /source/js/cagov/navigation.js
----------------------------------------- */

/*
Copyright � 2013 Adobe Systems Incorporated.

Licensed under the Apache License, Version 2.0 (the �License�);
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an �AS IS� BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

/**
 * See <a href="http://jquery.com">http://jquery.com</a>.
 * @name jquery
 * @class
 * See the jQuery Library  (<a href="http://jquery.com">http://jquery.com</a>) for full details.  This just
 * documents the function and classes that are added to jQuery by this plug-in.
 */

/**
 * See <a href="http://jquery.com">http://jquery.com</a>
 * @name fn
 * @class
 * See the jQuery Library  (<a href="http://jquery.com">http://jquery.com</a>) for full details.  This just
 * documents the function and classes that are added to jQuery by this plug-in.
 * @memberOf jquery
 */

/**
 * @fileOverview accessibleMegaMenu plugin
 *
 *<p>Licensed under the Apache License, Version 2.0 (the �License�)
 *<br />Copyright � 2013 Adobe Systems Incorporated.
 *<br />Project page <a href="https://github.com/adobe-accessibility/Accessible-Mega-Menu">https://github.com/adobe-accessibility/Accessible-Mega-Menu</a>
 * @version 0.1
 * @author Michael Jordan
 * @requires jquery
 */

/*jslint browser: true, devel: true, plusplus: true, nomen: true */
/*global jQuery, window, document */
(function ($, window, document) {
    "use strict";
    var pluginName = "accessibleMegaMenu",
        defaults = {
            uuidPrefix: "accessible-megamenu", // unique ID's are required to indicate aria-owns, aria-controls and aria-labelledby
            menuClass: "accessible-megamenu", // default css class used to define the megamenu styling
            topNavItemClass: "accessible-megamenu-top-nav-item", // default css class for a top-level navigation item in the megamenu
            panelClass: "accessible-megamenu-panel", // default css class for a megamenu panel
            panelGroupClass: "accessible-megamenu-panel-group", // default css class for a group of items within a megamenu panel
            hoverClass: "hover", // default css class for the hover state
            focusClass: "focus", // default css class for the focus state
            openClass: "open", // default css class for the open state,
            toggleButtonClass: "toggle-menu", // default css class responsive toggle button
            openDelay: 0, // default open delay when opening menu via mouseover
            closeDelay: 250, // default open delay when opening menu via mouseover
            openOnMouseover: false // default setting for whether menu should open on mouseover
        },
        Keyboard = {
            BACKSPACE: 8,
            COMMA: 188,
            DELETE: 46,
            DOWN: 40,
            END: 35,
            ENTER: 13,
            ESCAPE: 27,
            HOME: 36,
            LEFT: 37,
            PAGE_DOWN: 34,
            PAGE_UP: 33,
            PERIOD: 190,
            RIGHT: 39,
            SPACE: 32,
            TAB: 9,
            UP: 38,
            keyMap: {
                48: "0",
                49: "1",
                50: "2",
                51: "3",
                52: "4",
                53: "5",
                54: "6",
                55: "7",
                56: "8",
                57: "9",
                59: ";",
                65: "a",
                66: "b",
                67: "c",
                68: "d",
                69: "e",
                70: "f",
                71: "g",
                72: "h",
                73: "i",
                74: "j",
                75: "k",
                76: "l",
                77: "m",
                78: "n",
                79: "o",
                80: "p",
                81: "q",
                82: "r",
                83: "s",
                84: "t",
                85: "u",
                86: "v",
                87: "w",
                88: "x",
                89: "y",
                90: "z",
                96: "0",
                97: "1",
                98: "2",
                99: "3",
                100: "4",
                101: "5",
                102: "6",
                103: "7",
                104: "8",
                105: "9",
                190: "."
            }
        },
        clearTimeout = window.clearTimeout,
        setTimeout = window.setTimeout,
        isOpera = window.opera && window.opera.toString() === '[object Opera]';
    /**
     * @desc Creates a new accessible mega menu instance.
     * @param {jquery} element
     * @param {object} [options] Mega Menu options
     * @param {string} [options.uuidPrefix=accessible-megamenu] - Prefix for generated unique id attributes, which are required to indicate aria-owns, aria-controls and aria-labelledby
     * @param {string} [options.menuClass=accessible-megamenu] - CSS class used to define the megamenu styling
     * @param {string} [options.topNavItemClass=accessible-megamenu-top-nav-item] - CSS class for a top-level navigation item in the megamenu
     * @param {string} [options.panelClass=accessible-megamenu-panel] - CSS class for a megamenu panel
     * @param {string} [options.panelGroupClass=accessible-megamenu-panel-group] - CSS class for a group of items within a megamenu panel
     * @param {string} [options.hoverClass=hover] - CSS class for the hover state
     * @param {string} [options.focusClass=focus] - CSS class for the focus state
     * @param {string} [options.openClass=open] - CSS class for the open state
     * @constructor
     */
    function AccessibleMegaMenu(element, options) {
        this.element = element;

        // merge optional settings and defaults into settings
        this.settings = $.extend({}, defaults, options);

        this._defaults = defaults;
        this._name = pluginName;

        this.mouseTimeoutID = null;
        this.focusTimeoutID = null;
        this.mouseFocused = false;
        this.justFocused = false;

        this.init();
    }

    AccessibleMegaMenu.prototype = (function () {

        /* private attributes and methods ------------------------ */
        var uuid = 0,
            keydownTimeoutDuration = 1000,
            keydownSearchString = "",
            isTouch = 'ontouchstart' in window || window.navigator.msMaxTouchPoints,
            _getPlugin,
            _addUniqueId,
            _togglePanel,
            _clickHandler,
            _touchmoveHandler,
            _clickOutsideHandler,
            _DOMAttrModifiedHandler,
            _focusInHandler,
            _focusOutHandler,
            _keyDownHandler,
            _mouseDownHandler,
            _mouseOverHandler,
            _mouseOutHandler,
            _clickToggleHandler,
            _toggleExpandedEventHandlers,
            _addEventHandlers,
            _removeEventHandlers;

        /**
         * @name jQuery.fn.accessibleMegaMenu~_getPlugin
         * @desc Returns the parent accessibleMegaMenu instance for a given element
         * @param {jQuery} element
         * @memberof jQuery.fn.accessibleMegaMenu
         * @inner
         * @private
         */
        _getPlugin = function (element) {
            return $(element).closest(':data(plugin_' + pluginName + ')').data("plugin_" + pluginName);
        };

        /**
         * @name jQuery.fn.accessibleMegaMenu~_addUniqueId
         * @desc Adds a unique id and element.
         * The id string starts with the
         * string defined in settings.uuidPrefix.
         * @param {jQuery} element
         * @memberof jQuery.fn.accessibleMegaMenu
         * @inner
         * @private
         */
        _addUniqueId = function (element) {
            element = $(element);
            var settings = this.settings;
            if (!element.attr("id")) {
                element.attr("id", settings.uuidPrefix + "-" + new Date().getTime() + "-" + (++uuid));
            }
        };

        /**
         * @name jQuery.fn.accessibleMegaMenu~_togglePanel
         * @desc Toggle the display of mega menu panels in response to an event.
         * The optional boolean value 'hide' forces all panels to hide.
         * @param {event} event
         * @param {Boolean} [hide] Hide all mega menu panels when true
         * @memberof jQuery.fn.accessibleMegaMenu
         * @inner
         * @private
         */
        _togglePanel = function (event, hide) {
            var target = $(event.target),
                that = this,
                settings = this.settings,
                menu = this.menu,
                topli = target.closest('.' + settings.topNavItemClass),
                panel = target.hasClass(settings.panelClass) ? target : target.closest('.' + settings.panelClass),
                newfocus;

            _toggleExpandedEventHandlers.call(this, true);

            if (hide) {
                topli = menu.find('.' + settings.topNavItemClass + ' .' + settings.openClass + ':first').closest('.' + settings.topNavItemClass);
                if (!(topli.is(event.relatedTarget) || topli.has(event.relatedTarget).length > 0)) {
                    if ((event.type === 'mouseout' || event.type === 'focusout') && topli.has(document.activeElement).length > 0) {
                        return;
                    }
                    topli.find('[aria-expanded]')
                        .attr('aria-expanded', 'false')
                        .removeClass(settings.openClass)
                        .filter('.' + settings.panelClass)
                        .attr('aria-hidden', 'true');
                    if ((event.type === 'keydown' && event.keyCode === Keyboard.ESCAPE) || event.type === 'DOMAttrModified') {
                        newfocus = topli.find(':tabbable:first');
                        setTimeout(function () {
                            menu.find('[aria-expanded].' + that.settings.panelClass).off('DOMAttrModified.accessible-megamenu');
                            newfocus.focus();
                            that.justFocused = false;
                        }, 99);
                    }
                } else if (topli.length === 0) {
                    menu.find('[aria-expanded=true]')
                        .attr('aria-expanded', 'false')
                        .removeClass(settings.openClass)
                        .filter('.' + settings.panelClass)
                        .attr('aria-hidden', 'true');
                }
            } else {
                clearTimeout(that.focusTimeoutID);
                topli.siblings()
                    .find('[aria-expanded]')
                    .attr('aria-expanded', 'false')
                    .removeClass(settings.openClass)
                    .filter('.' + settings.panelClass)
                    .attr('aria-hidden', 'true');
                topli.find('[aria-expanded]')
                    .attr('aria-expanded', 'true')
                    .addClass(settings.openClass)
                    .filter('.' + settings.panelClass)
                    .attr('aria-hidden', 'false');

                var pageScrollPosition = $('html')[0].scrollTop;
                var openPanelTopPosition = $('.' + settings.panelClass + '.' + settings.openClass).parent().offset().top;

                if (pageScrollPosition > openPanelTopPosition) {
                    $('html')[0].scrollTop = openPanelTopPosition;
                }

                if (event.type === 'mouseover' && target.is(':tabbable') && topli.length === 1 && panel.length === 0 && menu.has(document.activeElement).length > 0) {
                    target.focus();
                    that.justFocused = false;
                }

                _toggleExpandedEventHandlers.call(that);
            }
        };

        /**
         * @name jQuery.fn.accessibleMegaMenu~_clickHandler
         * @desc Handle click event on mega menu item
         * @param {event} Event object
         * @memberof jQuery.fn.accessibleMegaMenu
         * @inner
         * @private
         */
        _clickHandler = function (event) {
            var target = $(event.target).closest(':tabbable'),
                topli = target.closest('.' + this.settings.topNavItemClass),
                panel = target.closest('.' + this.settings.panelClass);
            if (topli.length === 1
                && panel.length === 0
                && topli.find('.' + this.settings.panelClass).length === 1) {
                if (!target.hasClass(this.settings.openClass)) {
                    event.preventDefault();
                    event.stopPropagation();
                    _togglePanel.call(this, event);
                    this.justFocused = false;
                } else {
                    if (this.justFocused) {
                        event.preventDefault();
                        event.stopPropagation();
                        this.justFocused = false;
                    } else if (isTouch || !isTouch && !this.settings.openOnMouseover) {
                        event.preventDefault();
                        event.stopPropagation();
                        _togglePanel.call(this, event, target.hasClass(this.settings.openClass));
                    }
                }
            }
        };

        /**
         * @name jQuery.fn.accessibleMegaMenu~_touchmoveHandler
         * @desc Handle touch move event on menu
         * @memberof jQuery.fn.accessibleMegaMenu
         * @inner
         * @private
         */
        _touchmoveHandler = function () {
            this.justMoved = true;
        };

        /**
         * @name jQuery.fn.accessibleMegaMenu~_clickOutsideHandler
         * @desc Handle click event outside of a the megamenu
         * @param {event} Event object
         * @memberof jQuery.fn.accessibleMegaMenu
         * @inner
         * @private
         */
        _clickOutsideHandler = function (event) {
            if ($(event.target).closest(this.menu).length === 0) {
                event.preventDefault();
                event.stopPropagation();
                _togglePanel.call(this, event, true);
            }
        };

        /**
         * @name jQuery.fn.accessibleMegaMenu~_DOMAttrModifiedHandler
         * @desc Handle DOMAttrModified event on panel to respond to Windows 8 Narrator ExpandCollapse pattern
         * @param {event} Event object
         * @memberof jQuery.fn.accessibleMegaMenu
         * @inner
         * @private
         */
        _DOMAttrModifiedHandler = function (event) {
            if (event.originalEvent.attrName === 'aria-expanded'
                && event.originalEvent.newValue === 'false'
                && $(event.target).hasClass(this.settings.openClass)) {
                event.preventDefault();
                event.stopPropagation();
                _togglePanel.call(this, event, true);
            }
        };

        /**
         * @name jQuery.fn.accessibleMegaMenu~_focusInHandler
         * @desc Handle focusin event on mega menu item.
         * @param {event} Event object
         * @memberof jQuery.fn.accessibleMegaMenu
         * @inner
         * @private
         */
        _focusInHandler = function (event) {
            clearTimeout(this.focusTimeoutID);
            var target = $(event.target),
                panel = target.closest('.' + this.settings.panelClass);
            target
                .addClass(this.settings.focusClass);
            this.justFocused = !this.mouseFocused || (!this.settings.openOnMouseover && this.mouseFocused);
            this.mouseFocused = false;
            if (this.justFocused && this.panels.not(panel).filter('.' + this.settings.openClass).length) {
                _togglePanel.call(this, event);
            }
        };

        /**
         * @name jQuery.fn.accessibleMegaMenu~_focusOutHandler
         * @desc Handle focusout event on mega menu item.
         * @param {event} Event object
         * @memberof jQuery.fn.accessibleMegaMenu
         * @inner
         * @private
         */
        _focusOutHandler = function (event) {
            this.justFocused = false;
            var that = this,
                target = $(event.target),
                topli = target.closest('.' + this.settings.topNavItemClass);
            target
                .removeClass(this.settings.focusClass);

            if (window.cvox) {
                // If ChromeVox is running...
                that.focusTimeoutID = setTimeout(function () {
                    window.cvox.Api.getCurrentNode(function (node) {
                        if (topli.has(node).length) {
                            // and the current node being voiced is in
                            // the mega menu, clearTimeout,
                            // so the panel stays open.
                            clearTimeout(that.focusTimeoutID);
                        } else {
                            that.focusTimeoutID = setTimeout(function (scope, event, hide) {
                                _togglePanel.call(scope, event, hide);
                            }, 275, that, event, true);
                        }
                    });
                }, 25);
            } else {
                that.focusTimeoutID = setTimeout(function () {
                    if (that.mouseFocused && event.relatedTarget === null) {
                        return;
                    }
                    _togglePanel.call(that, event, true);
                }, 300);
            }
        };

        /**
         * @name jQuery.fn.accessibleMegaMenu~_keyDownHandler
         * @desc Handle keydown event on mega menu.
         * @param {event} Event object
         * @memberof jQuery.fn.accessibleMegaMenu
         * @inner
         * @private
         */
        _keyDownHandler = function (event) {
            var that = (this.constructor === AccessibleMegaMenu) ? this : _getPlugin(this), // determine the AccessibleMegaMenu plugin instance
                settings = that.settings,
                target = $($(this).is('.' + settings.hoverClass + ':tabbable') ? this : event.target), // if the element is hovered the target is this, otherwise, its the focused element
                menu = that.menu,
                topnavitems = that.topnavitems,
                topli = target.closest('.' + settings.topNavItemClass),
                tabbables = menu.find(':tabbable'),
                panel = target.hasClass(settings.panelClass) ? target : target.closest('.' + settings.panelClass),
                panelGroups = panel.find('.' + settings.panelGroupClass),
                currentPanelGroup = target.closest('.' + settings.panelGroupClass),
                next,
                keycode = event.keyCode || event.which,
                start,
                i,
                o,
                label,
                found = false,
                newString = Keyboard.keyMap[event.keyCode] || '',
                regex,
                isTopNavItem = (topli.length === 1 && panel.length === 0);

            if (target.is("input:focus, select:focus, textarea:focus, button:focus")) {
                // if the event target is a form element we should handle keydown normally
                return;
            }

            if (target.is('.' + settings.hoverClass + ':tabbable')) {
                $('html').off('keydown.accessible-megamenu');
            }

            switch (keycode) {
                case Keyboard.ESCAPE:
                    this.mouseFocused = false;
                    _togglePanel.call(that, event, true);
                    break;
                case Keyboard.DOWN:
                    event.preventDefault();
                    this.mouseFocused = false;
                    if (isTopNavItem) {
                        _togglePanel.call(that, event);
                        found = (topli.find('.' + settings.panelClass + ' :tabbable:first').focus().length === 1);
                    } else {
                        found = (tabbables.filter(':gt(' + tabbables.index(target) + '):first').focus().length === 1);
                    }

                    if (!found && isOpera && (event.ctrlKey || event.metaKey)) {
                        tabbables = $(':tabbable');
                        i = tabbables.index(target);
                        found = ($(':tabbable:gt(' + $(':tabbable').index(target) + '):first').focus().length === 1);
                    }
                    break;
                case Keyboard.UP:
                    event.preventDefault();
                    this.mouseFocused = false;
                    if (isTopNavItem && target.hasClass(settings.openClass)) {
                        _togglePanel.call(that, event, true);
                        next = topnavitems.filter(':lt(' + topnavitems.index(topli) + '):last');
                        if (next.children('.' + settings.panelClass).length) {
                            found = (next.find('[aria-expanded]')
                                .attr('aria-expanded', 'true')
                                .addClass(settings.openClass)
                                .filter('.' + settings.panelClass)
                                .attr('aria-hidden', 'false')
                                .find(':tabbable:last')
                                .focus() === 1);
                        }
                    } else if (!isTopNavItem) {
                        found = (tabbables.filter(':lt(' + tabbables.index(target) + '):last').focus().length === 1);
                    }

                    if (!found && isOpera && (event.ctrlKey || event.metaKey)) {
                        tabbables = $(':tabbable');
                        i = tabbables.index(target);
                        found = ($(':tabbable:lt(' + $(':tabbable').index(target) + '):first').focus().length === 1);
                    }
                    break;
                case Keyboard.RIGHT:
                    event.preventDefault();
                    this.mouseFocused = false;
                    if (isTopNavItem) {
                        found = (topnavitems.filter(':gt(' + topnavitems.index(topli) + '):first').find(':tabbable:first').focus().length === 1);
                    } else {
                        if (panelGroups.length && currentPanelGroup.length) {
                            // if the current panel contains panel groups, and we are able to focus the first tabbable element of the next panel group
                            found = (panelGroups.filter(':gt(' + panelGroups.index(currentPanelGroup) + '):first').find(':tabbable:first').focus().length === 1);
                        }

                        if (!found) {
                            found = (topli.find(':tabbable:first').focus().length === 1);
                        }
                    }
                    break;
                case Keyboard.LEFT:
                    event.preventDefault();
                    this.mouseFocused = false;
                    if (isTopNavItem) {
                        found = (topnavitems.filter(':lt(' + topnavitems.index(topli) + '):last').find(':tabbable:first').focus().length === 1);
                    } else {
                        if (panelGroups.length && currentPanelGroup.length) {
                            // if the current panel contains panel groups, and we are able to focus the first tabbable element of the previous panel group
                            found = (panelGroups.filter(':lt(' + panelGroups.index(currentPanelGroup) + '):last').find(':tabbable:first').focus().length === 1);
                        }

                        if (!found) {
                            found = (topli.find(':tabbable:first').focus().length === 1);
                        }
                    }
                    break;
                case Keyboard.TAB:
                    this.mouseFocused = false;
                    i = tabbables.index(target);
                    if (event.shiftKey && isTopNavItem && target.hasClass(settings.openClass)) {
                        _togglePanel.call(that, event, true);
                        next = topnavitems.filter(':lt(' + topnavitems.index(topli) + '):last');
                        if (next.children('.' + settings.panelClass).length) {
                            found = next.children()
                                .attr('aria-expanded', 'true')
                                .addClass(settings.openClass)
                                .filter('.' + settings.panelClass)
                                .attr('aria-hidden', 'false')
                                .find(':tabbable:last')
                                .focus();
                        }
                    } else if (event.shiftKey && i > 0) {
                        found = (tabbables.filter(':lt(' + i + '):last').focus().length === 1);
                    } else if (!event.shiftKey && i < tabbables.length - 1) {
                        found = (tabbables.filter(':gt(' + i + '):first').focus().length === 1);
                    } else if (isOpera) {
                        tabbables = $(':tabbable');
                        i = tabbables.index(target);
                        if (event.shiftKey) {
                            found = ($(':tabbable:lt(' + $(':tabbable').index(target) + '):last').focus().length === 1);
                        } else {
                            found = ($(':tabbable:gt(' + $(':tabbable').index(target) + '):first').focus().length === 1);
                        }
                    }

                    if (found) {
                        event.preventDefault();
                    }
                    break;
                case Keyboard.SPACE:
                case Keyboard.ENTER:
                    if (isTopNavItem) {
                        // event.preventDefault();
                        _clickHandler.call(that, event);
                    } else {
                        return true;
                    }
                    break;
                default:
                    // alphanumeric filter
                    clearTimeout(this.keydownTimeoutID);

                    keydownSearchString += newString !== keydownSearchString ? newString : '';

                    if (keydownSearchString.length === 0) {
                        return;
                    }

                    this.keydownTimeoutID = setTimeout(function () {
                        keydownSearchString = '';
                    }, keydownTimeoutDuration);

                    if (isTopNavItem && !target.hasClass(settings.openClass)) {
                        tabbables = tabbables.filter(':not(.' + settings.panelClass + ' :tabbable)');
                    } else {
                        tabbables = topli.find(':tabbable');
                    }

                    if (event.shiftKey) {
                        tabbables = $(tabbables.get()
                            .reverse());
                    }

                    for (i = 0; i < tabbables.length; i++) {
                        o = tabbables.eq(i);
                        if (o.is(target)) {
                            start = (keydownSearchString.length === 1) ? i + 1 : i;
                            break;
                        }
                    }

                    regex = new RegExp('^' + keydownSearchString.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&'), 'i');

                    for (i = start; i < tabbables.length; i++) {
                        o = tabbables.eq(i);
                        label = $.trim(o.text());
                        if (regex.test(label)) {
                            found = true;
                            o.focus();
                            break;
                        }
                    }
                    if (!found) {
                        for (i = 0; i < start; i++) {
                            o = tabbables.eq(i);
                            label = $.trim(o.text());
                            if (regex.test(label)) {
                                o.focus();
                                break;
                            }
                        }
                    }
                    break;
            }
            that.justFocused = false;
        };

        /**
         * @name jQuery.fn.accessibleMegaMenu~_mouseDownHandler
         * @desc Handle mousedown event on mega menu.
         * @param {event} Event object
         * @memberof accessibleMegaMenu
         * @inner
         * @private
         */
        _mouseDownHandler = function (event) {
            if ($(event.target).closest(this.settings.panelClass) || $(event.target).closest(":focusable").length) {
                this.mouseFocused = true;
                if ($(event.target).closest(this.settings.menuClass)) {
                    $('html').on('keydown.accessible-megamenu', $.proxy(_keyDownHandler, event.target));
                }
            }
            clearTimeout(this.mouseTimeoutID);
            this.mouseTimeoutID = setTimeout(function () {
                clearTimeout(this.focusTimeoutID);
            }, 1);
        };

        /**
         * @name jQuery.fn.accessibleMegaMenu~_mouseOverHandler
         * @desc Handle mouseover event on mega menu.
         * @param {event} Event object
         * @memberof jQuery.fn.accessibleMegaMenu
         * @inner
         * @private
         */
        _mouseOverHandler = function (event) {
            clearTimeout(this.mouseTimeoutID);
            var that = this;

            if (!that.settings.openOnMouseover) {
                return;
            }

            this.mouseTimeoutID = setTimeout(function () {
                $(event.target).addClass(that.settings.hoverClass);
                _togglePanel.call(that, event);
                if ($(event.target).closest(that.settings.menuClass)) {
                    $('html').on('keydown.accessible-megamenu', $.proxy(_keyDownHandler, event.target));
                }
            }, this.settings.openDelay);
        };

        /**
         * @name jQuery.fn.accessibleMegaMenu~_mouseOutHandler
         * @desc Handle mouseout event on mega menu.
         * @param {event} Event object
         * @memberof jQuery.fn.accessibleMegaMenu
         * @inner
         * @private
         */
        _mouseOutHandler = function (event) {
            clearTimeout(this.mouseTimeoutID);
            var that = this;

            if (!that.settings.openOnMouseover) {
                return;
            }

            $(event.target)
                .removeClass(that.settings.hoverClass);

            that.mouseTimeoutID = setTimeout(function () {
                _togglePanel.call(that, event, true);
            }, this.settings.closeDelay);
            if ($(event.target).is(':tabbable')) {
                $('html').off('keydown.accessible-megamenu');
            }
        };

        /**
         * @name jQuery.fn.accessibleMegaMenu~_clickToggleHandler
         * @desc Handle click event on menu toggle button.
         * @memberof jQuery.fn.accessibleMegaMenu
         * @inner
         * @private
         */
        _clickToggleHandler = function () {
            var isExpanded = this.toggleButton.attr('aria-expanded') === 'true';

            this.toggleButton.attr({ 'aria-expanded': !isExpanded, 'aria-pressed': !isExpanded });


        };

        _toggleExpandedEventHandlers = function (hide) {
            var menu = this.menu;
            if (hide) {
                $('html').off('mouseup.outside-accessible-megamenu, touchend.outside-accessible-megamenu, mspointerup.outside-accessible-megamenu,  pointerup.outside-accessible-megamenu');

                menu.find('[aria-expanded].' + this.settings.panelClass).off('DOMAttrModified.accessible-megamenu');
            } else {
                $('html').on('mouseup.outside-accessible-megamenu, touchend.outside-accessible-megamenu, mspointerup.outside-accessible-megamenu,  pointerup.outside-accessible-megamenu', $.proxy(_clickOutsideHandler, this));

                /* Narrator in Windows 8 automatically toggles the aria-expanded property on double tap or click.
                   To respond to the change to collapse the panel, we must add a listener for a DOMAttrModified event. */
                menu.find('[aria-expanded=true].' + this.settings.panelClass).on('DOMAttrModified.accessible-megamenu', $.proxy(_DOMAttrModifiedHandler, this));
            }
        };

        _addEventHandlers = function () {
            var menu = this.menu,
                toggleButton = this.toggleButton;
            menu.on("focusin.accessible-megamenu", ":focusable, ." + this.settings.panelClass, $.proxy(_focusInHandler, this))
                .on("focusout.accessible-megamenu", ":focusable, ." + this.settings.panelClass, $.proxy(_focusOutHandler, this))
                .on("keydown.accessible-megamenu", $.proxy(_keyDownHandler, this))
                .on("mouseover.accessible-megamenu", $.proxy(_mouseOverHandler, this))
                .on("mouseout.accessible-megamenu", $.proxy(_mouseOutHandler, this))
                .on("mousedown.accessible-megamenu", $.proxy(_mouseDownHandler, this))
                .on("click.accessible-megamenu", $.proxy(_clickHandler, this));

            toggleButton.on('click.accessible-megamenu', $.proxy(_clickToggleHandler, this));

            if (isTouch) {
                menu.on("touchmove.accessible-megamenu", $.proxy(_touchmoveHandler, this));
            }

            if ($(document.activeElement).closest(menu).length) {
                $(document.activeElement).trigger("focusin.accessible-megamenu");
            }
        };

        _removeEventHandlers = function () {
            var menu = this.menu,
                toggleButton = this.toggleButton;
            menu.off('.accessible-megamenu');
            if (menu.find('[aria-expanded=true].' + this.settings.panelClass).length) {
                _toggleExpandedEventHandlers.call(this, true);
            }

            toggleButton.off('.accessible-megamenu');
        };

        /* public attributes and methods ------------------------- */
        return {
            constructor: AccessibleMegaMenu,

            /**
             * @lends jQuery.fn.accessibleMegaMenu
             * @desc Initializes an instance of the accessibleMegaMenu plugins
             * @memberof jQuery.fn.accessibleMegaMenu
             * @instance
             */
            init: function () {
                var settings = this.settings,
                    nav = $(this.element),
                    menu = nav.children('ol,ul').first(),
                    topnavitems = menu.children(),
                    toggleButton = $('.toggle-menu');
                this.start(settings, nav, menu, topnavitems, toggleButton);
            },

            start: function (settings, nav, menu, topnavitems, toggleButton) {
                var that = this;
                this.settings = settings;
                this.menu = menu;
                this.topnavitems = topnavitems;
                this.toggleButton = toggleButton;

                nav.attr("role", "navigation");
                _addUniqueId.call(that, menu);
                menu.addClass(settings.menuClass);
                menu.addClass(['js', settings.menuClass].join('-'));
                topnavitems.each(function (i, topnavitem) {
                    var topnavitemlink, topnavitempanel;
                    topnavitem = $(topnavitem);
                    topnavitem.addClass(settings.topNavItemClass);
                    topnavitemlink = topnavitem.find(":tabbable:first");
                    topnavitempanel = topnavitem.children(":not(:tabbable):last");
                    _addUniqueId.call(that, topnavitemlink);
                    if (topnavitempanel.length) {
                        _addUniqueId.call(that, topnavitempanel);
                        topnavitemlink.attr({
                            "role": "button",
                            "aria-controls": topnavitempanel.attr("id"),
                            "aria-expanded": false,
                            "tabindex": 0
                        });

                        topnavitempanel.attr({
                            "role": "region",
                            "aria-expanded": false,
                            "aria-hidden": true
                        })
                            .addClass(settings.panelClass)
                            .not("[aria-labelledby]")
                            .attr("aria-labelledby", topnavitemlink.attr("id"));
                    }
                });

                this.panels = menu.find("." + settings.panelClass);

                menu.find("hr").attr("role", "separator");

                toggleButton.addClass(settings.toggleButtonClass);
                toggleButton.attr({ 'aria-expanded': false, 'aria-pressed': false, 'aria-controls': menu.attr('id') });

                _addEventHandlers.call(this);
            },

            /**
             * @desc Removes maga menu javascript behavior
             * @example $(selector).accessibleMegaMenu("destroy");
             * @return {object}
             * @memberof jQuery.fn.accessibleMegaMenu
             * @instance
             */
            destroy: function () {
                this.menu.removeClass(['js', this.settings.menuClass].join('-'));
                _removeEventHandlers.call(this, true);
            },

            /**
             * @desc Get default values
             * @example $(selector).accessibleMegaMenu("getDefaults");
             * @return {object}
             * @memberof jQuery.fn.accessibleMegaMenu
             * @instance
             */
            getDefaults: function () {
                return this._defaults;
            },

            /**
             * @desc Get any option set to plugin using its name (as string)
             * @example $(selector).accessibleMegaMenu("getOption", some_option);
             * @param {string} opt
             * @return {string}
             * @memberof jQuery.fn.accessibleMegaMenu
             * @instance
             */
            getOption: function (opt) {
                return this.settings[opt];
            },

            /**
             * @desc Get all options
             * @example $(selector).accessibleMegaMenu("getAllOptions");
             * @return {object}
             * @memberof jQuery.fn.accessibleMegaMenu
             * @instance
             */
            getAllOptions: function () {
                return this.settings;
            },

            /**
             * @desc Set option
             * @example $(selector).accessibleMegaMenu("setOption", "option_name",  "option_value",  reinitialize);
             * @param {string} opt - Option name
             * @param {string} val - Option value
             * @param {boolean} [reinitialize] - boolean to re-initialize the menu.
             * @memberof jQuery.fn.accessibleMegaMenu
             * @instance
             */
            setOption: function (opt, value, reinitialize) {
                this.settings[opt] = value;
                if (reinitialize) {
                    this.init();
                }
            }
        };
    }());


    $.fn[pluginName] = function (options) {
        return this.each(function () {
            var pluginInstance = $.data(this, "plugin_" + pluginName);
            if (!pluginInstance) {
                $.data(this, "plugin_" + pluginName, new $.fn[pluginName].AccessibleMegaMenu(this, options));
            } else if (typeof pluginInstance[options] === 'function') {
                pluginInstance[options].apply(pluginInstance, Array.prototype.slice.call(arguments, 1));
            }
        });
    };

    $.fn[pluginName].AccessibleMegaMenu = AccessibleMegaMenu;



    /**
     * @private
     */
    function visible(element) {
        return $.expr.filters.visible(element) && !$(element).parents().addBack().filter(function () {
            return $.css(this, "visibility") === "hidden";
        }).length;
    }

    /**
     * @private
     */
    function focusable(element, isTabIndexNotNaN) {
        var map, mapName, img,
            nodeName = element.nodeName.toLowerCase();
        if ("area" === nodeName) {
            map = element.parentNode;
            mapName = map.name;
            if (!element.href || !mapName || map.nodeName.toLowerCase() !== "map") {
                return false;
            }
            img = $("img[usemap=#" + mapName + "]")[0];
            return !!img && visible(img);
        }
        return (/input|select|textarea|button|object/.test(nodeName) ? !element.disabled :
            "a" === nodeName ?
                element.href || isTabIndexNotNaN :
                isTabIndexNotNaN) &&
            // the element and all of its ancestors must be visible
            visible(element);
    }

    $.extend($.expr[":"], {
        data: $.expr.createPseudo ? $.expr.createPseudo(function (dataName) {
            return function (elem) {
                return !!$.data(elem, dataName);
            };
        }) : // support: jQuery <1.8
            function (elem, i, match) {
                return !!$.data(elem, match[3]);
            },

        focusable: function (element) {
            return focusable(element, !isNaN($.attr(element, "tabindex")));
        },

        tabbable: function (element) {
            var tabIndex = $.attr(element, "tabindex"),
                isTabIndexNaN = isNaN(tabIndex);
            return (isTabIndexNaN || tabIndex >= 0) && focusable(element, !isTabIndexNaN);
        }
    });







}(jQuery, window, document));


$("nav:first").accessibleMegaMenu({
    /* prefix for generated unique id attributes, which are required 
       to indicate aria-owns, aria-controls and aria-labelledby */
    uuidPrefix: "accessible-menu",

    /* css class used to define the megamenu styling */
    menuClass: "nav-menu",

    /* css class for a top-level navigation item in the megamenu */
    topNavItemClass: "nav-item",

    /* css class for a megamenu panel */
    panelClass: "sub-nav",

    /* css class for a group of items within a megamenu panel */
    panelGroupClass: "sub-nav-group",

    /* css class for the hover state */
    hoverClass: "hover",

    /* css class for the focus state */
    focusClass: "focus",

    /* css class for the open state */
    openClass: "open"
});






/// MOBILE
function mobileView() {
    return $('.global-header .mobile-controls').css('display') !== "none";
}





$(document).ready(function () {

    // INITIAZE NAVIGATION
    $('.main-navigation').accessibleMegaMenu();

    if (mobileView()) {
        $('#navigation').addClass('collapse');
    }


    // Variables
    var $navigation = $('#navigation.main-navigation'),
        $navItems = $navigation.find('.nav-item'), // first level link containers'
        $navItemsWithSubs = $navItems.has('.sub-nav'),
        $subNavs = $navigation.find('.sub-nav'),
        megamenu = $navigation.hasClass('megadropdown'),
        dropdown = $navigation.hasClass('dropdown'),
        singleLevel = $navigation.hasClass('singleLevel'),
        setActiveLinkByFolder = $navigation.hasClass('auto-highlight'); // Use new folder matching method to highlight the current navigation tab


    // HIGHLIGHT APPROPRIATE NAV ITEM
    var reMainNav = "",
        arrCurrentURL = location.href.split("/");
    if (typeof defaultActiveLink != "undefined") {
        reMainNav = new RegExp("^" + defaultActiveLink + "$", "i"); // Regex for finding the index of the default main list item
    }
    $navItems.each(function () { // loop through top level links
        var $this = $(this),
            $a = $this.find('.first-level-link');

        if (reMainNav) {
            if ($a.text().match(reMainNav)) {
                $this.addClass('active');
            }
        } else if (setActiveLinkByFolder && $a.attr('href')) {
            var arrNavLink = $a[0].href.split("/");
            if ((arrNavLink.length > 4) && (arrCurrentURL[3] == arrNavLink[3])) { // folder of current URL matches this nav link
                $this.addClass('active');
            }
        }
    });


    // Nav items with subs
    $navItemsWithSubs.each(function () {
        var itemCount = $(this).find('.second-level-nav > li').length;
        if (itemCount <= 2) {
            $(this).find('.sub-nav').addClass('with-few-items');
        }
    });


    // Add class has-sub, then add carrots
    if (!singleLevel) {
        $navItemsWithSubs.each(function () {

            $(this).find('.first-level-link').addClass('has-sub');

            var $toggleSubNav = $('<div class="ca-gov-icon-caret-right rotate" aria-hidden="true"></div>');
            var carrot = $('<span class="ca-gov-icon-triangle-down carrot" aria-hidden="true"></span>');

            if (mobileView()) {
                $(this).find('.has-sub').append($toggleSubNav);
            }
            $(this).find('.has-sub').append(carrot);
        });
    }

    // Scrolling to the top of the menu in mobile
    var HasSubLink = $(".collapse .has-sub");
    var navTarget = $(".mobile-controls");

    $(HasSubLink).click(function () {
        if (mobileView()) {
            $('html,body').animate({
                scrollTop: $(navTarget).offset().top
            }, '3000');
        }
    });

    $(".toggle-menu").removeAttr('aria-pressed'); // siteimprove accesibility error fix...

});


// Do Navigation Reset function on window resize uless it's mobile device.
$(window).on('resize', function () {
    if (navigator.userAgent.match(/Android/i)
        || navigator.userAgent.match(/webOS/i)
        || navigator.userAgent.match(/iPhone/i)
        || navigator.userAgent.match(/iPad/i)
        || navigator.userAgent.match(/iPod/i)
        || navigator.userAgent.match(/BlackBerry/i)
        || navigator.userAgent.match(/Windows Phone/i)
    ) {
        return false;
    }
    else {
        NavReset();
    }
});

// Navigation Reset function
function NavReset() {
    var $toggleSubNav = $('<div class="ca-gov-icon-caret-right rotate" aria-hidden="true"></div>');
    if (window.innerWidth < 768) {
        $("#navigation").addClass("collapse");
        $("#navigation").removeClass("show");
        $('.has-sub').append($toggleSubNav);
        $(".rotate").css("display", "block");
    }
    else {
        $("#navigation").removeClass("collapse");
        $(".rotate").css("display", "none");

    }

    $(".toggle-menu").attr('aria-expanded', 'false');
    $(".toggle-menu").attr('aria-selected', 'false');
}

/* Mobile Controls fix */
$(document).ready(function () {
    $("#navigation .mobile-controls").removeClass("nav-menu");
    $("#navigation .mobile-control a").removeAttr("aria-hidden aria-expanded role id").removeClass("sub-nav with-few-items subnav-closed");
    $("#navigation .mobile-control .sr-only").removeAttr("aria-hidden aria-expanded role id").removeClass("sub-nav with-few-items subnav-closed");
});
