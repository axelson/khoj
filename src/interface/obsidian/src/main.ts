import { Notice, Plugin } from 'obsidian';
import { KhojSetting, KhojSettingTab, DEFAULT_SETTINGS } from 'src/settings'
import { KhojModal } from 'src/modal'
import { configureKhojBackend } from './utils';


export default class Khoj extends Plugin {
    settings: KhojSetting;

    async onload() {
        await this.loadSettings();

        // Add a search command. It can be triggered from anywhere
        this.addCommand({
            id: 'search',
            name: 'Search',
            checkCallback: (checking) => {
                if (!checking && this.settings.connectedToBackend)
                    new KhojModal(this.app, this.settings).open();
                return this.settings.connectedToBackend;
            }
        });

        // Add a similar notes command
        this.addCommand({
            id: 'similar',
            name: 'Find Similar Notes',
            checkCallback: (checking) => {
                if (!checking && this.settings.connectedToBackend)
                    new KhojModal(this.app, this.settings, true).open();
                return this.settings.connectedToBackend;
            }
        });

        // Create an icon in the left ribbon.
        this.addRibbonIcon('search', 'Khoj', (_: MouseEvent) => {
            // Called when the user clicks the icon.
            this.settings.connectedToBackend
            ? new KhojModal(this.app, this.settings).open()
            : new Notice(`❗️Ensure Khoj backend is running and Khoj URL is pointing to it in the plugin settings`);
        });

        // Add a settings tab so the user can configure khoj
        this.addSettingTab(new KhojSettingTab(this.app, this));
    }

    onunload() {
    }

    async loadSettings() {
        // Load khoj obsidian plugin settings
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());

        // Load, configure khoj server settings
        await configureKhojBackend(this.settings);
    }

    async saveSettings() {
        await configureKhojBackend(this.settings, false)
            .then(() => this.saveData(this.settings));
    }
}
