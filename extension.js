/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

/* exported init */

const GETTEXT_DOMAIN = 'open-meteo-extension';

const {GObject, St, Soup, GLib, Gio} = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Lang = imports.lang;

const TIMEOUT = 1800;
const INDICATOR_CLASS = 'openmeteo-label';

const _ = ExtensionUtils.gettext;
let _httpSession;

const Indicator = GObject.registerClass(
    class Indicator extends PanelMenu.Button {
        _init() {
            //TODO: dirty code need to fix
            this.hourlyData = '';
            this.settings = ExtensionUtils.getSettings('org.gnome.shell.extensions.openmeteo');
            this.label = new St.Label({ style_class: INDICATOR_CLASS, text: "Loading..."});
            
            this.lat = this.settings.get_double('latitude');
            this.lon = this.settings.get_double('longitude');
            
             _httpSession = new Soup.Session();
                
            super._init(0.0, _('OpenMeteo'));
            this.add_child(this.label);
            
            let item1 = new PopupMenu.PopupMenuItem(_('Hourly weather'));
            item1.connect('activate', () => {
                Main.notify(this.hourlyData);
            });
            this.menu.addMenuItem(item1);
            
            let item3 = new PopupMenu.PopupMenuItem(_('Update'));
            item3.connect('activate', () => {
                this._getData();
            });
            this.menu.addMenuItem(item3);
            
            let item2 = new PopupMenu.PopupMenuItem(_('Settings'));
            item2.connect('activate', () => {
                Main.extensionManager.openExtensionPrefs('openmeteo@toprogram.ru', '', {});
            });
            this.menu.addMenuItem(item2);
            
            let item4 = new PopupMenu.PopupMenuItem(_('About'));
            item4.connect('activate', () => {
                Main.notify(_('OpenMeteo Gnome Extension 0.1a.\r\rEugeny Nosenko <info@toprogram.ru>\rGitHub: https://github.com/imjonos'));
            });
            this.menu.addMenuItem(item4);

            
            this._getData();
            GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, TIMEOUT, () => {
                this._getData();
                return GLib.SOURCE_CONTINUE;
            });
        }

        _getData()
        {
           
            let url = 'https://api.open-meteo.com/v1/forecast';
            let params = {
                latitude: this.lat.toString(),
                longitude: this.lon.toString(),
                current_weather: 'true',
                temperature_unit: 'celsius',
                timezone: 'auto',
                // hourly: 'temperature_2m,precipitation,rain,showers,snowfall,snow_depth,cloudcover,windspeed_10m,winddirection_10m,weathercode',
                hourly: 'temperature_2m',
                windspeed_unit: 'ms'
            };
            
            let message = Soup.Message.new_from_encoded_form('GET', url, Soup.form_encode_hash(params));
            
            _httpSession.send_and_read_async(
            message,
            GLib.PRIORITY_DEFAULT,
            null,
            (_httpSession, result) => {
                if (message.get_status() === Soup.Status.OK) {
                    let bytes = _httpSession.send_and_read_finish(result);
                    let decoder = new TextDecoder('utf-8');
                    let response = decoder.decode(bytes.get_data());
                    let json = JSON.parse(response);
                    this._updateData(json);
                }
            });
        }

        _updateData(data) {
            let temperature2m = data.hourly_units.temperature_2m.toString();
            let temperature = data.current_weather.temperature.toString();
            let value = temperature + ' ' + temperature2m;
            let textLabel = this.settings.get_string('title');
            this.label.set_text(`${textLabel} ${value}`);
            this.hourlyData = '';
            data.hourly.time.forEach((element, index) => {
                if(index<24) {
                    this.hourlyData += element.toString() + ' - ' + data.hourly.temperature_2m[index].toString() + '' + temperature2m + '\r';
                }
            });
            
        }

    });

class Extension {
    constructor(uuid) {
        this._uuid = uuid;

        ExtensionUtils.initTranslations(GETTEXT_DOMAIN);
    }

    enable() { 
        this._indicator = new Indicator();
        Main.panel.addToStatusArea(this._uuid, this._indicator, 0, 'center');
    }

    disable() {
        this._indicator.destroy();
        this._indicator = null;
    }
}

function init(meta) {
    return new Extension(meta.uuid);
}
