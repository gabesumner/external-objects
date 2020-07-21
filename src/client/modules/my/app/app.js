import { LightningElement } from 'lwc';

export default class App extends LightningElement {
    tables = [];

    connectedCallback() {
        this.list();
    }

    list() {
        fetch('/api/list')
            .then((response) => response.json())
            .then((data) => {
                console.log(JSON.stringify(data.tables));
                this.tables = data.tables;
            });
    }

    reset() {
        fetch('/api/reset')
            .then((response) => response.json())
            .then((data) => {
                console.log(JSON.stringify(data.status));
            });
    }
}
