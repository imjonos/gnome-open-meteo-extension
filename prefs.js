'use strict';

const { Adw, Gio, Gtk } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();


function init() {
}

function fillPreferencesWindow(window) {
    // Use the same GSettings schema as in `extension.js`
    const settings = ExtensionUtils.getSettings(
        'org.gnome.shell.extensions.openmeteo');
    
    // Create a preferences page and group
    const page = new Adw.PreferencesPage();
    const group = new Adw.PreferencesGroup();
    page.add(group);

    //TODO: optimize
    // Create a new preferences row
    const row = new Adw.ActionRow({ title: 'Title' });
    group.add(row);

    // Create the switch and bind its value to the `show-indicator` key
    const title = new Gtk.Entry();
    settings.bind(
        'title',
        title,
        'text',
        Gio.SettingsBindFlags.DEFAULT
    );

    // Add the switch to the row
    row.add_suffix(title);
    row.activatable_widget = title;
    
     // Create a new preferences row
    const row2 = new Adw.ActionRow({ title: 'Latitude' });
    group.add(row2);

    // Create the switch and bind its value to the `show-indicator` key
    const latitude = new Gtk.SpinButton({
            adjustment: new Gtk.Adjustment({
                lower: 0.0,
                upper: 100.0,
                step_increment: 0.001
            }),
            climb_rate: 0.001, 
            digits: 3
        });
    settings.bind(
        'latitude',
        latitude,
        'value',
        Gio.SettingsBindFlags.DEFAULT
    );

    // Add the switch to the row
    row2.add_suffix(latitude);
    row2.activatable_widget = latitude;
    
     // Create a new preferences row
    const row3 = new Adw.ActionRow({ title: 'Longitude' });
    group.add(row3);

    // Create the switch and bind its value to the `show-indicator` key
    const longitude =  new Gtk.SpinButton({
            adjustment: new Gtk.Adjustment({
                lower: 0.0,
                upper: 100.0,
                step_increment: 0.001
            }),
            climb_rate: 0.001, 
            digits: 3
        });
    settings.bind(
        'longitude',
        longitude,
        'value',
        Gio.SettingsBindFlags.DEFAULT
    );

    // Add the switch to the row
    row3.add_suffix(longitude);
    row3.activatable_widget = longitude;

    // Add our page to the window
    window.add(page);
}

