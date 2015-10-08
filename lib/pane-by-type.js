'use babel';

const path = require('path');

export default class PaneByType {

  static activate() {
    this.skipIds = [];

    atom.workspace.onDidOpen(event => {
      const id = event.item.id;
      this.skipIds.push(id);
      this.moveToCorrectPane(event.item, event.pane);
      const index = this.skipIds.indexOf(id);
      this.skipIds.splice(index, 1);
    });
  }

  /**
   * Move item to the first pane that has a file with the same extension
   * @param  {object} item to move
   * @param  {Pane} pane current pane
   */
  static moveToCorrectPane(item, pane) {
    const ext = this.getFileExtension(item);
    if (!this.paneHasType(pane, ext)) {
      const paneWithType = this.getPaneWithType(ext);
      paneWithType.activate();

      if (paneWithType) {
        pane.moveItemToPane(item, paneWithType);
        paneWithType.activateItem(item);
      }
    }
  }

  /**
   * Check to see if pane contains a specific type
   * @param  {Pane} pane
   * @param  {string} type
   * @return {boolean}
   */
  static paneHasType(pane, type) {
    const types = this.getPaneTypes(pane);
    if (types.indexOf(type) < 0) {
      return false;
    }

    return true;
  }

  /**
   * Get the pane that holds a certain type
   * @param  {string} type
   * @return {Pane}
   */
  static getPaneWithType(type) {
    const panes = atom.workspace.getPanes();
    for (let pane of panes) {
      if (this.paneHasType(pane, type)) {
        return pane;
      }
    }
  }

  static getPaneTypes(pane) {
    const items = pane.getItems();
    let extensions = [];
    for (let item of items) {
      const doNotSkip = this.skipIds.indexOf(item.id) < 0 ? true : false;
      if (item.buffer && item.buffer.file && doNotSkip) {
        extensions.push(path.extname(item.buffer.file.path));
      }
    }

    return extensions;
  }

  /**
   * Get extension of file
   * @param  {object} item
   * @return {string}
   */
  static getFileExtension(item) {
    if (item.buffer && item.buffer.file) {
      return path.extname(item.buffer.file.path);
    }

    return false;
  }

  static deactivate() {}
}
